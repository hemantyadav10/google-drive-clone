import type { User } from "../../db/schema.js";
import type { UserRepository } from "./user.repository.js";
import type { CreateUserDto } from "./user.types.js";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.create(createUserDto);
  }
}
