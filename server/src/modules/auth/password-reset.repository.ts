import { and, eq, gt } from "drizzle-orm";
import type { Database, DbExecutor } from "../../db/index.js";
import {
  passwordResetTokens,
  type PasswordResetToken,
} from "../../db/schema.js";

export class PasswordResetRepository {
  constructor(private readonly db: Database) {}

  async findValidToken(
    tokenHash: string,
    db: DbExecutor = this.db,
  ): Promise<PasswordResetToken | null> {
    const [token] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return token ?? null;
  }

  async upsert(
    data: { userId: string; tokenHash: string; expiresAt: Date },
    db: DbExecutor = this.db,
  ): Promise<void> {
    await db
      .insert(passwordResetTokens)
      .values(data)
      .onConflictDoUpdate({
        target: passwordResetTokens.userId,
        set: { tokenHash: data.tokenHash, expiresAt: data.expiresAt },
      });
  }

  async deleteValidToken(
    tokenHash: string,
    db: DbExecutor = this.db,
  ): Promise<PasswordResetToken | null> {
    const [deleted] = await db
      .delete(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .returning();
    return deleted ?? null;
  }
}
