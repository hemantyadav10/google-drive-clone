import type { DbClient } from "../../db/index.js";
import type { ProviderType, User } from "../../db/schema.js";
import type { UserRepository } from "./user.repository.js";
import type {
  CreateOAuthUserDto,
  CreateUserDto,
  UpdatePasswordDto,
  UpdateUnverifiedUserDto,
  UserId,
} from "./user.types.js";

export class UserService {
  constructor(
    private readonly db: DbClient,
    private readonly userRepository: UserRepository,
  ) {}

  findUserByEmail(db: DbClient, email: string): Promise<User | null> {
    return this.userRepository.findByEmail(db, email);
  }

  findUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(this.db, id);
  }

  async createUserIfNotExists(
    db: DbClient,
    data: CreateUserDto,
  ): Promise<User | null> {
    return this.userRepository.createUserIfNotExists(db, data);
  }

  async createOAuthUser(db: DbClient, data: CreateOAuthUserDto): Promise<User> {
    return this.userRepository.createOAuthUser(db, data);
  }

  async markEmailVerified(db: DbClient, userId: string): Promise<void> {
    await this.userRepository.markEmailVerified(db, userId);
  }

  async updatePassword(
    db: DbClient,
    data: UpdatePasswordDto,
  ): Promise<UserId | null> {
    return this.userRepository.updatePassword(db, data);
  }

  async updateUnverifiedUser(
    db: DbClient,
    data: UpdateUnverifiedUserDto,
  ): Promise<User | null> {
    return this.userRepository.updateUnverifiedUser(db, data);
  }

  async findUserByProvider(
    db: DbClient,
    provider: ProviderType,
    providerId: string,
  ): Promise<User | null> {
    return this.userRepository.findByProvider(db, provider, providerId);
  }
}
