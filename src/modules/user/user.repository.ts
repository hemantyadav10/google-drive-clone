import { DrizzleQueryError, eq } from "drizzle-orm";
import { DatabaseError } from "pg";
import type { Database } from "../../db/index.js";
import { users, type User } from "../../db/schema.js";
import { ConflictError } from "../../utils/index.js";
import type { CreateUserDto } from "./user.types.js";

export class UserRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const [user] = await this.db
        .insert(users)
        .values(createUserDto)
        .returning();
      if (!user) throw new Error("Failed to create user");

      return user;
    } catch (error) {
      if (
        error instanceof DrizzleQueryError &&
        error.cause instanceof DatabaseError &&
        error.cause.code === "23505"
      ) {
        throw new ConflictError("Email already in use");
      }

      throw error;
    }
  }
}
