import { db } from "./db/index.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { AuthRepository } from "./modules/auth/auth.repository.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { UserService } from "./modules/user/user.service.js";
import { UserRepository } from "./modules/user/user.repository.js";

export const userRepository = new UserRepository(db);
export const userService = new UserService(userRepository);

export const authRepository = new AuthRepository(db);
export const authService = new AuthService(authRepository, userService);
export const authController = new AuthController(authService);
