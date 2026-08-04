import { and, eq, gt } from "drizzle-orm";
import type { DbClient } from "../../db/index.js";
import {
  passwordResetTokens,
  type PasswordResetToken,
} from "../../db/schema.js";

export class PasswordResetRepository {
  async findValidToken(
    db: DbClient,
    tokenHash: string,
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
    db: DbClient,
    data: { userId: string; tokenHash: string; expiresAt: Date },
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
    db: DbClient,
    tokenHash: string,
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
