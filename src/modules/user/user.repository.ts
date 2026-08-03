import { and, eq } from "drizzle-orm";
import type { DbClient } from "../../db/index.js";
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
  async findByEmail(db: DbClient, email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  }

  async findById(db: DbClient, id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }

  async findByProvider(
    db: DbClient,
    provider: ProviderType,
    providerId: string,
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
    db: DbClient,
    data: CreateUserDto,
  ): Promise<User | null> {
    const [user] = await db
      .insert(users)
      .values(data)
      .onConflictDoNothing({ target: users.email })
      .returning();
    return user ?? null;
  }

  async createOAuthUser(db: DbClient, data: CreateOAuthUserDto): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    if (!user) throw new ApiError("Failed to create user");

    return user;
  }

  async markEmailVerified(db: DbClient, userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isEmailVerified: true, emailVerifiedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updatePassword(
    db: DbClient,
    data: UpdatePasswordDto,
  ): Promise<UserId | null> {
    const [result] = await db
      .update(users)
      .set({ passwordHash: data.passwordHash })
      .where(eq(users.id, data.userId))
      .returning({ id: users.id });

    return result ?? null;
  }

  async updateUnverifiedUser(
    db: DbClient,
    data: UpdateUnverifiedUserDto,
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
