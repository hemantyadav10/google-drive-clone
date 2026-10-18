import { and, asc, desc, eq, gt, isNull, lt, or, SQL, sql } from "drizzle-orm";
import type { Database, DbExecutor } from "../../db/index.js";
import { nodes, type Node } from "../../db/schema.js";
import type {
  Ancestor,
  CreateFileNodeRecord,
  CreateNewFolderData,
  FindNodesParams,
  UpdateProcessingResultData,
} from "./nodes.types.js";

export class NodesRepository {
  constructor(private readonly db: Database) {}

  async createFolder(
    data: CreateNewFolderData,
    db: DbExecutor = this.db,
  ): Promise<Node | null> {
    const result = await db.insert(nodes).values(data).returning();
    return result[0] ?? null;
  }

  async createFileNode(
    data: CreateFileNodeRecord,
    db: DbExecutor = this.db,
  ): Promise<Node | null> {
    const result = await db.insert(nodes).values(data).returning();
    return result[0] ?? null;
  }

  async findNodeById(
    id: string,
    db: DbExecutor = this.db,
  ): Promise<Node | null> {
    const result = await db
      .select()
      .from(nodes)
      .where(and(eq(nodes.id, id), eq(nodes.isTrashed, false)))
      .limit(1);
    return result[0] ?? null;
  }

  async findSiblingNames(
    parentId: string | null,
    db: DbExecutor = this.db,
  ): Promise<string[]> {
    const result = await db
      .select({ name: nodes.name })
      .from(nodes)
      .where(
        and(
          parentId === null
            ? isNull(nodes.parentId)
            : eq(nodes.parentId, parentId),
          eq(nodes.isTrashed, false),
        ),
      );
    return result.map((node) => node.name);
  }

  async findNodes(
    {
      userId,
      parentId,
      limit,
      cursor,
      type,
      isAscending,
      sortField,
    }: FindNodesParams,
    db: DbExecutor = this.db,
  ): Promise<Node[]> {
    const sortExpr: SQL = {
      name: sql`lower(${nodes.name})`,
      sizeBytes: sql`coalesce(${nodes.sizeBytes}, 0)`,
      createdAt: sql`${nodes.createdAt}`,
    }[sortField];

    let nodeCursor: SQL | undefined;
    if (cursor) {
      const cursorValue =
        cursor.sort === "sizeBytes"
          ? Number(cursor.value)
          : cursor.sort === "createdAt"
            ? new Date(cursor.value)
            : cursor.value;

      const cmp = isAscending ? gt : lt;

      nodeCursor = or(
        gt(nodes.type, cursor.type),
        and(eq(nodes.type, cursor.type), cmp(sortExpr, cursorValue)),
        and(
          eq(nodes.type, cursor.type),
          eq(sortExpr, cursorValue),
          gt(nodes.id, cursor.id),
        ),
      );
    }

    const dir = isAscending ? asc : desc;

    const result = await db
      .select()
      .from(nodes)
      .where(
        and(
          eq(nodes.createdBy, userId),
          eq(nodes.isTrashed, false),
          parentId === null
            ? isNull(nodes.parentId)
            : eq(nodes.parentId, parentId),
          type ? eq(nodes.type, type) : undefined,
          nodeCursor,
        ),
      )
      .orderBy(asc(nodes.type), dir(sortExpr), asc(nodes.id))
      .limit(limit);

    return result;
  }

  async findFolderById(
    { userId, folderId }: { userId: string; folderId: string },
    db: DbExecutor = this.db,
  ): Promise<Node | null> {
    const [result] = await db
      .select()
      .from(nodes)
      .where(
        and(
          eq(nodes.id, folderId),
          eq(nodes.createdBy, userId),
          eq(nodes.isTrashed, false),
          eq(nodes.type, "folder"),
        ),
      );
    return result ?? null;
  }

  async findAncestors(
    { userId, folderPath }: { userId: string; folderPath: string },
    db: DbExecutor = this.db,
  ): Promise<Ancestor[]> {
    const result = await db
      .select({
        id: nodes.id,
        name: nodes.name,
        folderColor: nodes.folderColor,
      })
      .from(nodes)
      .where(
        and(
          eq(nodes.createdBy, userId),
          eq(nodes.isTrashed, false),
          sql`${nodes.path} @> ${folderPath}::ltree`,
          sql`${nodes.path} != ${folderPath}::ltree`,
        ),
      )
      .orderBy(asc(sql`nlevel(${nodes.path})`));
    return result;
  }

  async getPathById(
    nodeId: string,
    db: DbExecutor = this.db,
  ): Promise<string | null> {
    const [result] = await db
      .select({ path: nodes.path })
      .from(nodes)
      .where(eq(nodes.id, nodeId));
    return result?.path ?? null;
  }

  async findAccessibleNodeById(
    { userId, nodeId }: { userId: string; nodeId: string },
    db: DbExecutor = this.db,
  ) {
    const [node] = await db
      .select()
      .from(nodes)
      .where(and(eq(nodes.id, nodeId), eq(nodes.createdBy, userId)));

    return node ?? null;
  }

  async updateProcessingResult(
    nodeId: string,
    data: UpdateProcessingResultData,
  ): Promise<Node | null> {
    const [updated] = await this.db
      .update(nodes)
      .set({
        thumbnailSmallKey: data.thumbnailSmallKey,
        thumbnailMediumKey: data.thumbnailMediumKey,
        width: data.width,
        height: data.height,
        duration: data.duration,
        processingStatus: "completed",
        pageCount: data.pageCount,
      })
      .where(eq(nodes.id, nodeId))
      .returning();

    return updated ?? null;
  }
}
