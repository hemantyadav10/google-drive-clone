import { and, eq } from "drizzle-orm";
import type { Database, DbExecutor } from "../../db/index.js";
import {
  accounts,
  users,
  type ProviderType,
  type User,
} from "../../db/schema.js";
import { ApiError } from "../../utils/api-error.js";
import type {
  CreateOAuthUserDto,
  CreateUserDto,
  UpdatePasswordDto,
  UpdateUnverifiedUserDto,
  UserId,
} from "./user.types.js";

export class UserRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(
    email: string,
    db: DbExecutor = this.db,
  ): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  }

  async findById(id: string, db: DbExecutor = this.db): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }

  async findByProvider(
    provider: ProviderType,
    providerId: string,
    db: DbExecutor = this.db,
  ): Promise<User | null> {
    const [row] = await db
      .select({ user: users })
      .from(accounts)
      .innerJoin(users, eq(accounts.userId, users.id))
      .where(
        and(
          eq(accounts.provider, provider),
          eq(accounts.providerId, providerId),
        ),
      )
      .limit(1);

    return row?.user ?? null;
  }

  async createUserIfNotExists(
    data: CreateUserDto,
    db: DbExecutor = this.db,
  ): Promise<User | null> {
    const [user] = await db
      .insert(users)
      .values(data)
      .onConflictDoNothing({ target: users.email })
      .returning();
    return user ?? null;
  }

  async createOAuthUser(
    data: CreateOAuthUserDto,
    db: DbExecutor = this.db,
  ): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    if (!user) throw new ApiError("Failed to create user");

    return user;
  }

  async markEmailVerified(
    userId: string,
    db: DbExecutor = this.db,
  ): Promise<void> {
    await db
      .update(users)
      .set({ isEmailVerified: true, emailVerifiedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updatePassword(
    data: UpdatePasswordDto,
    db: DbExecutor = this.db,
  ): Promise<UserId | null> {
    const [result] = await db
      .update(users)
      .set({ passwordHash: data.passwordHash })
      .where(eq(users.id, data.userId))
      .returning({ id: users.id });

    return result ?? null;
  }

  async updateUnverifiedUser(
    data: UpdateUnverifiedUserDto,
    db: DbExecutor = this.db,
  ): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        fullName: data.fullName,
        passwordHash: data.passwordHash,
      })
      .where(and(eq(users.id, data.userId), eq(users.isEmailVerified, false)))
      .returning();

    return user ?? null;
  }
}
