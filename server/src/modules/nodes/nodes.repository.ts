import { and, desc, eq, isNull } from "drizzle-orm";
import type { DbClient } from "../../db/index.js";
import { nodes, type Node } from "../../db/schema.js";
import type { CreateNewFolderData } from "./nodes.types.js";

export class NodesRepository {
  async createFolder(
    db: DbClient,
    data: CreateNewFolderData,
  ): Promise<Node | null> {
    const result = await db.insert(nodes).values(data).returning();
    return result[0] ?? null;
  }

  async findNodeById(db: DbClient, id: string): Promise<Node | null> {
    const result = await db
      .select()
      .from(nodes)
      .where(and(eq(nodes.id, id), eq(nodes.isTrashed, false)))
      .limit(1);
    return result[0] ?? null;
  }

  async findSiblingNames(
    db: DbClient,
    parentId: string | null,
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
    db: DbClient,
    { userId, parentId }: { userId: string; parentId: string | null },
  ): Promise<Node[]> {
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
        ),
      )
      .orderBy(desc(nodes.createdAt));

    return result;
  }
}
