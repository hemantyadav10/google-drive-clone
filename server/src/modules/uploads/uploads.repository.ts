import { and, eq } from "drizzle-orm";
import { type Database, type DbExecutor } from "../../db/index.js";
import {
  uploadSessions,
  type CreateUploadSessionData,
  type UploadSession,
} from "../../db/schema.js";

export class UploadsRepository {
  constructor(private readonly db: Database) {}

  async createUploadSession(
    data: CreateUploadSessionData,
    db: DbExecutor = this.db,
  ): Promise<UploadSession | null> {
    const result = await db.insert(uploadSessions).values(data).returning();
    return result[0] ?? null;
  }

  async findUploadSessionByIdAndUserId(
    data: { uploadId: string; userId: string },
    db: DbExecutor = this.db,
  ): Promise<UploadSession | null> {
    const result = await db
      .select()
      .from(uploadSessions)
      .where(
        and(
          eq(uploadSessions.id, data.uploadId),
          eq(uploadSessions.userId, data.userId),
        ),
      );
    return result[0] ?? null;
  }

  async findUploadSessionForUpdate(
    data: { uploadId: string },
    db: DbExecutor = this.db,
  ): Promise<UploadSession | null> {
    const result = await db
      .select()
      .from(uploadSessions)
      .where(eq(uploadSessions.id, data.uploadId))
      .for("update");
    return result[0] ?? null;
  }

  async markCompleted(
    data: { uploadId: string; nodeId: string; uploadedSize: number },
    db: DbExecutor = this.db,
  ): Promise<void> {
    await db
      .update(uploadSessions)
      .set({
        status: "completed",
        nodeId: data.nodeId,
        uploadedSize: data.uploadedSize,
      })
      .where(eq(uploadSessions.id, data.uploadId));
  }
}
