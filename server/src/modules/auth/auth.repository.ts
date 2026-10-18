import { and, desc, eq, gt, ne } from "drizzle-orm";
import type { Database, DbExecutor } from "../../db/index.js";
import { userSessions, type UserSession } from "../../db/schema.js";
import { ApiError } from "../../utils/api-error.js";
import type { CreateSessionData, SessionSummary } from "./auth.types.js";

export class AuthRepository {
  constructor(private readonly db: Database) {}

  async createSession(
    data: CreateSessionData,
    db: DbExecutor = this.db,
  ): Promise<UserSession> {
    const [session] = await db.insert(userSessions).values(data).returning();
    if (!session) throw new ApiError("Failed to create session");

    return session;
  }

  async deleteSession(
    tokenHash: string,
    db: DbExecutor = this.db,
  ): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.tokenHash, tokenHash));
  }

  async findValidSession(
    tokenHash: string,
    db: DbExecutor = this.db,
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

  async deleteAllSessionsForUser(
    userId: string,
    db: DbExecutor = this.db,
  ): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.userId, userId));
  }

  async findAllSessionsForUser(
    userId: string,
    db: DbExecutor = this.db,
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
    sessionId: string,
    userId: string,
    db: DbExecutor = this.db,
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
    userId: string,
    currentSessionId: string,
    db: DbExecutor = this.db,
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

  async touchLastActive(
    sessionId: string,
    db: DbExecutor = this.db,
  ): Promise<void> {
    await db
      .update(userSessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(userSessions.id, sessionId));
  }
}
