import { env } from "../../config/env.js";
import type { Database, DbExecutor } from "../../db/index.js";
import type { Node } from "../../db/schema.js";
import {
  ApiError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/api-error.js";
import { buildNodePath } from "../../utils/helper.js";
import { generateUUIDv7 } from "../../utils/uuid.js";
import type { IStorageService } from "../storage/storage.interface.js";
import type { NodesRepository } from "./nodes.repository.js";
import {
  SORT_FIELDS_MAPPER,
  type Ancestor,
  type CreateFileData,
  type Cursor,
  type DbSortField,
  type NodeChildren,
  type NodeChildrenParams,
  type UpdateProcessingResultData,
} from "./nodes.types.js";
import { cursorSchema, type CreateFolderDto } from "./nodes.validator.js";

export class NodesService {
  constructor(
    private readonly db: Database,
    private readonly nodesRepository: NodesRepository,
    private readonly storageService: IStorageService,
  ) {}

  async createFolder(userId: string, data: CreateFolderDto): Promise<Node> {
    const folderId = generateUUIDv7();
    let nodePath = buildNodePath(folderId);

    if (data.parentId) {
      const parentNode = await this.nodesRepository.findNodeById(data.parentId);

      if (!parentNode) {
        throw new NotFoundError("Parent node not found");
      }

      if (parentNode.createdBy !== userId) {
        throw new UnauthorizedError(
          "You are not authorized to create a folder in this parent node",
        );
      }

      nodePath = buildNodePath(nodePath, parentNode.path);
    }

    const uniqueName = await this.resolveUniqueName({
      baseName: data.name,
      isFolder: true,
      parentId: data.parentId,
      userId: userId,
    });

    const result = await this.nodesRepository.createFolder({
      ...data,
      id: folderId,
      name: uniqueName,
      type: "folder",
      path: nodePath,
      createdBy: userId,
      processingStatus: "completed",
    });

    if (!result) {
      throw new ApiError("Failed to create folder");
    }

    return result;
  }

  async getNodeDetails(userId: string, nodeId: string) {
    const node = await this.nodesRepository.findAccessibleNodeById({
      userId,
      nodeId,
    });

    if (!node) throw new NotFoundError("Node not found");

    const ancestors = node.path
      ? await this.nodesRepository.findAncestors({
          userId,
          folderPath: node.path,
        })
      : [];

    if (!node.storageKey) return { ...node, ancestors };

    const thumbnailMediumUrl = node.thumbnailMediumKey
      ? await this.storageService.getSignedDownloadUrl({
          Bucket: env.S3_BUCKET_NAME,
          Key: node.thumbnailMediumKey,
        })
      : null;

    return { ...node, ancestors, thumbnailMediumUrl };
  }

  // TODO: Fetch only names that could collide instead of all sibling names.
  // TODO: Make naming safe under concurrent requests (per-folder lock, unique index as backstop).
  private async resolveUniqueName(
    {
      baseName,
      isFolder,
      parentId,
      userId,
    }: {
      baseName: string;
      parentId: string | null;
      userId: string;
      isFolder: boolean;
    },
    tx: DbExecutor = this.db,
  ): Promise<string> {
    const siblingNames = new Set(
      await this.nodesRepository.findSiblingNames({ parentId, userId }, tx),
    );

    if (!siblingNames.has(baseName)) return baseName;

    const dot = isFolder ? -1 : baseName.lastIndexOf(".");
    const stem = dot < 0 ? baseName : baseName.slice(0, dot);
    const ext = dot < 0 ? "" : baseName.slice(dot);

    let counter = 1;
    let candidate = `${stem} (${counter})${ext}`;

    while (siblingNames.has(candidate)) {
      counter++;
      candidate = `${stem} (${counter})${ext}`;
    }

    return candidate;
  }

  findFolderById(userId: string, folderId: string): Promise<Node | null> {
    return this.nodesRepository.findFolderById({
      userId,
      folderId,
    });
  }

  async findNodeById(userId: string, nodeId: string): Promise<Node | null> {
    const node = await this.nodesRepository.findNodeById(nodeId);
    if (!node) return null;
    if (node.createdBy !== userId) return null;
    return node;
  }

  async getNodeChildren(
    userId: string,
    { nodeId, limit, cursor, type, isAscending, sortField }: NodeChildrenParams,
  ): Promise<NodeChildren> {
    let currentFolder: Node | null = null;
    let ancestors: Ancestor[] = [];

    if (nodeId) {
      currentFolder = await this.nodesRepository.findFolderById({
        userId,
        folderId: nodeId,
      });
      if (!currentFolder) throw new NotFoundError("Folder not found");

      ancestors = await this.nodesRepository.findAncestors({
        userId,
        folderPath: currentFolder.path,
      });
    }

    const dbSortField = SORT_FIELDS_MAPPER[sortField];

    const rows = await this.nodesRepository.findNodes({
      userId,
      parentId: currentFolder?.id ?? null,
      limit: limit + 1,
      cursor: cursor ? this.decodeCursor(cursor, dbSortField) : undefined,
      type,
      isAscending,
      sortField: dbSortField,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    const children = await this.attachThumbnailUrls(page);
    const last = page[page.length - 1];

    const nextCursor =
      hasMore && last
        ? this.encodeCursor({
            type: last.type,
            sort: dbSortField,
            value: this.cursorValue(last, dbSortField),
            id: last.id,
          })
        : null;

    return {
      currentFolder,
      ancestors,
      children,
      hasMore,
      nextCursor,
    };
  }

  private async attachThumbnailUrls(nodes: Node[]) {
    return Promise.all(
      nodes.map(async (node) => ({
        ...node,
        thumbnailSmallUrl: node.thumbnailSmallKey
          ? await this.storageService.getSignedDownloadUrl({
              Bucket: env.S3_BUCKET_NAME,
              Key: node.thumbnailSmallKey,
            })
          : null,
      })),
    );
  }

  async createFileNode(
    userId: string,
    data: CreateFileData,
    tx: DbExecutor = this.db,
  ): Promise<Node> {
    const fileId = generateUUIDv7();

    let nodePath = buildNodePath(fileId);

    if (data.parentId) {
      const parentNode = await this.nodesRepository.findNodeById(
        data.parentId,
        tx,
      );

      if (!parentNode) {
        throw new NotFoundError("Parent folder not found");
      }

      if (parentNode.type !== "folder") {
        throw new BadRequestError("Parent node must be a folder");
      }

      if (parentNode.createdBy !== userId) {
        throw new UnauthorizedError(
          "You are not authorized to create a file in this folder",
        );
      }

      nodePath = buildNodePath(fileId, parentNode.path);
    }

    const uniqueName = await this.resolveUniqueName(
      {
        baseName: data.name,
        isFolder: false,
        parentId: data.parentId,
        userId,
      },
      tx,
    );

    const result = await this.nodesRepository.createFileNode(
      {
        ...data,
        id: fileId,
        type: "file",
        name: uniqueName,
        path: nodePath,
        createdBy: userId,
      },
      tx,
    );

    if (!result) {
      throw new ApiError("Failed to create file node");
    }

    return result;
  }

  getPathById(
    nodeId: string,
    tx: DbExecutor = this.db,
  ): Promise<string | null> {
    return this.nodesRepository.getPathById(nodeId, tx);
  }

  async markProcessingComplete(
    nodeId: string,
    data: UpdateProcessingResultData,
  ): Promise<Node> {
    const updated = await this.nodesRepository.updateProcessingResult(
      nodeId,
      data,
    );
    if (!updated) throw new NotFoundError("Node not found");

    return updated;
  }

  private encodeCursor(c: Cursor): string {
    return Buffer.from(JSON.stringify(c), "utf-8").toString("base64url");
  }

  private decodeCursor(raw: string, expectedSort: DbSortField): Cursor {
    if (raw.length > 2048) throw new BadRequestError("Invalid cursor");

    let json: unknown;
    try {
      json = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    } catch {
      throw new BadRequestError("Invalid cursor");
    }

    const result = cursorSchema.safeParse(json);
    if (!result.success || result.data.sort !== expectedSort)
      throw new BadRequestError("Invalid cursor");

    return result.data;
  }

  private cursorValue(last: Node, field: DbSortField): string {
    switch (field) {
      case "name":
        return last.name.toLowerCase();
      case "sizeBytes":
        return String(last.sizeBytes ?? 0n);
      case "createdAt":
        return last.createdAt.toISOString();
    }
  }
}
