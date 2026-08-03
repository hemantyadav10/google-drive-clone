import { and, eq, gt } from "drizzle-orm";
import type { DbClient } from "../../db/index.js";
import { emailVerificationTokens } from "../../db/schema.js";
import type { EmailVerificationTokenRecord } from "./auth.types.js";

export class EmailVerificationRepository {
  async upsert(
    db: DbClient,
    data: {
      userId: string;
      tokenHash: string;
      expiresAt: Date;
    },
  ): Promise<void> {
    await db
      .insert(emailVerificationTokens)
      .values(data)
      .onConflictDoUpdate({
        target: emailVerificationTokens.userId,
        set: { tokenHash: data.tokenHash, expiresAt: data.expiresAt },
      });
  }

  async deleteValidToken(
    db: DbClient,
    tokenHash: string,
  ): Promise<EmailVerificationTokenRecord | null> {
    const [deleted] = await db
      .delete(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenHash, tokenHash),
          gt(emailVerificationTokens.expiresAt, new Date()),
        ),
      )
      .returning({
        id: emailVerificationTokens.id,
        userId: emailVerificationTokens.userId,
      });

    return deleted ?? null;
  }
}
