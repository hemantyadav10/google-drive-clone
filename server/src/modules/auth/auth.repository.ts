import { and, desc, eq, gt, ne } from "drizzle-orm";
import type { DbClient } from "../../db/index.js";
import { userSessions, type UserSession } from "../../db/schema.js";
import { ApiError } from "../../utils/api-error.js";
import type { CreateSessionData, SessionSummary } from "./auth.types.js";

export class AuthRepository {
  async createSession(
    db: DbClient,
    data: CreateSessionData,
  ): Promise<UserSession> {
    const [session] = await db.insert(userSessions).values(data).returning();
    if (!session) throw new ApiError("Failed to create session");

    return session;
  }

  async deleteSession(db: DbClient, tokenHash: string): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.tokenHash, tokenHash));
  }

  async findValidSession(
    db: DbClient,
    tokenHash: string,
  ): Promise<UserSession | null> {
    const [session] = await db
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

  async deleteAllSessionsForUser(db: DbClient, userId: string): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.userId, userId));
  }

  async findAllSessionsForUser(
    db: DbClient,
    userId: string,
  ): Promise<SessionSummary[]> {
    return db
      .select({
        id: userSessions.id,
        browserName: userSessions.browserName,
        osName: userSessions.osName,
        deviceType: userSessions.deviceType,
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
    db: DbClient,
    sessionId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await db
      .delete(userSessions)
      .where(
        and(eq(userSessions.id, sessionId), eq(userSessions.userId, userId)),
      )
      .returning({ id: userSessions.id });

    return result.length > 0;
  }

  async deleteAllSessionsForUserExcept(
    db: DbClient,
    userId: string,
    currentSessionId: string,
  ): Promise<void> {
    await db
      .delete(userSessions)
      .where(
        and(
          eq(userSessions.userId, userId),
          ne(userSessions.id, currentSessionId),
        ),
      );
  }

  async touchLastActive(db: DbClient, sessionId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(userSessions.id, sessionId));
  }
}
