import type { Database } from "../../db/index.js";
import type { Node } from "../../db/schema.js";
import {
  ApiError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/api-error.js";
import { buildNodePath } from "../../utils/helper.js";
import { generateUUIDv7 } from "../../utils/uuid.js";
import type { NodesRepository } from "./nodes.repository.js";
import type { CreateFolderDto } from "./nodes.validator.js";

export class NodesService {
  constructor(
    private readonly db: Database,
    private readonly nodesRepository: NodesRepository,
  ) {}

  async createFolder(userId: string, data: CreateFolderDto): Promise<Node> {
    const folderId = generateUUIDv7();
    let nodePath = buildNodePath(folderId);

    if (data.parentId) {
      const parentNode = await this.nodesRepository.findNodeById(
        this.db,
        data.parentId,
      );

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

    const uniqueName = await this.resolveUniqueName(data.name, data.parentId);

    const result = await this.nodesRepository.createFolder(this.db, {
      ...data,
      id: folderId,
      name: uniqueName,
      type: "folder",
      path: nodePath,
      createdBy: userId,
    });

    if (!result) {
      throw new ApiError("Failed to create folder");
    }

    return result;
  }

  async getNodes(userId: string, parentId: string | null): Promise<Node[]> {
    const result = await this.nodesRepository.findNodes(this.db, {
      userId,
      parentId,
    });
    return result;
  }

  private async resolveUniqueName(
    baseName: string,
    parentId: string | null,
  ): Promise<string> {
    const siblings = await this.nodesRepository.findSiblingNames(
      this.db,
      parentId,
    );

    const siblingNames = new Set(siblings);

    if (!siblingNames.has(baseName)) return baseName;

    let counter = 1;
    let candidate = `${baseName} (${counter})`;

    while (siblingNames.has(candidate)) {
      counter++;
      candidate = `${baseName} (${counter})`;
    }

    return candidate;
  }
}
