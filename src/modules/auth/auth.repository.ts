import { and, desc, eq, gt } from "drizzle-orm";
import { type Database } from "../../db/index.js";
import { userSessions, type UserSession } from "../../db/schema.js";
import type { CreateSessionData, SessionSummary } from "./auth.types.js";

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

  async findValidSession(tokenHash: string): Promise<UserSession | null> {
    const [session] = await this.db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.tokenHash, tokenHash),
          gt(userSessions.expiresAt, new Date()),
        ),
      );

    return session ?? null;
  }

  async deleteAllSessionsForUser(userId: string): Promise<void> {
    await this.db.delete(userSessions).where(eq(userSessions.userId, userId));
  }

  async findAllSessionsForUser(userId: string): Promise<SessionSummary[]> {
    return this.db
      .select({
        id: userSessions.id,
        userAgent: userSessions.userAgent,
        ipAddress: userSessions.ipAddress,
        lastActiveAt: userSessions.lastActiveAt,
        createdAt: userSessions.createdAt,
        expiresAt: userSessions.expiresAt,
      })
      .from(userSessions)
      .where(
        and(
          eq(userSessions.userId, userId),
          gt(userSessions.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(userSessions.lastActiveAt));
  }

  async deleteSessionForUser(
    sessionId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.db
      .delete(userSessions)
      .where(
        and(eq(userSessions.id, sessionId), eq(userSessions.userId, userId)),
      )
      .returning({ id: userSessions.id });

    return result.length > 0;
  }
}
