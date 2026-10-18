import { and, eq, gt } from "drizzle-orm";
import type { Database, DbExecutor } from "../../db/index.js";
import { emailVerificationTokens } from "../../db/schema.js";
import type { EmailVerificationTokenRecord } from "./auth.types.js";

export class EmailVerificationRepository {
  constructor(private readonly db: Database) {}

  async upsert(
    data: {
      userId: string;
      tokenHash: string;
      expiresAt: Date;
    },
    db: DbExecutor = this.db,
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
    tokenHash: string,
    db: DbExecutor = this.db,
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
