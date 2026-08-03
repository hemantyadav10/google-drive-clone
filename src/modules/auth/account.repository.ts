import type { DbClient } from "../../db/index.js";
import {
  accounts,
  type Account,
  type CreateAccountData,
} from "../../db/schema.js";
import { ApiError } from "../../utils/api-error.js";

export class AccountRepository {
  async create(db: DbClient, data: CreateAccountData): Promise<Account> {
    const [account] = await db.insert(accounts).values(data).returning();
    if (!account) throw new ApiError("Failed to create account");

    return account;
  }
}
