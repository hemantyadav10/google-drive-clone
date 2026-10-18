import type { Database, DbExecutor } from "../../db/index.js";
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
    private readonly db: Database,
    private readonly userRepository: UserRepository,
  ) {}

  findUserByEmail(
    email: string,
    tx: DbExecutor = this.db,
  ): Promise<User | null> {
    return this.userRepository.findByEmail(email, tx);
  }

  findUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  createUserIfNotExists(
    data: CreateUserDto,
    tx: DbExecutor = this.db,
  ): Promise<User | null> {
    return this.userRepository.createUserIfNotExists(data, tx);
  }

  createOAuthUser(
    data: CreateOAuthUserDto,
    tx: DbExecutor = this.db,
  ): Promise<User> {
    return this.userRepository.createOAuthUser(data, tx);
  }

  markEmailVerified(userId: string, tx: DbExecutor = this.db): Promise<void> {
    return this.userRepository.markEmailVerified(userId, tx);
  }

  updatePassword(
    data: UpdatePasswordDto,
    tx: DbExecutor = this.db,
  ): Promise<UserId | null> {
    return this.userRepository.updatePassword(data, tx);
  }

  updateUnverifiedUser(
    data: UpdateUnverifiedUserDto,
    tx: DbExecutor = this.db,
  ): Promise<User | null> {
    return this.userRepository.updateUnverifiedUser(data, tx);
  }

  findUserByProvider(
    provider: ProviderType,
    providerId: string,
  ): Promise<User | null> {
    return this.userRepository.findByProvider(provider, providerId);
  }
}
