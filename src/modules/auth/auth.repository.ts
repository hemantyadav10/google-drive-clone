import { eq } from "drizzle-orm";
import { type Database } from "../../db/index.js";
import { userSessions, type UserSession } from "../../db/schema.js";
import type { CreateSessionData } from "./auth.types.js";

export class AuthRepository {
  constructor(private readonly db: Database) {}

  async createSession(data: CreateSessionData): Promise<UserSession> {
    const [session] = await this.db
      .insert(userSessions)
      .values(data)
      .returning();

    if (!session) throw new Error("Failed to create session");

    return session;
  }

  async deleteSession(tokenHash: string): Promise<void> {
    await this.db
      .delete(userSessions)
      .where(eq(userSessions.tokenHash, tokenHash));
  }
}
