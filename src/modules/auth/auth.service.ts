import {
  DUMMY_PASSWORD_HASH,
  SESSION_LIFETIME_MS,
} from "../../constants/index.js";
import type { UserSession } from "../../db/schema.js";
import {
  comparePassword,
  ConflictError,
  ForbiddenError,
  generateToken,
  hashPassword,
  hashToken,
  isBreachedPassword,
  logger,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../utils/index.js";
import type { UserService } from "../user/user.service.js";
import type { AuthRepository } from "./auth.repository.js";
import type { LoginDto, RegisterDto } from "./auth.schema.js";
import type {
  LoginResult,
  SessionMetadata,
  SessionSummaryWithCurrent,
} from "./auth.types.js";

export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userService: UserService,
  ) {}

  async registerUser(registerUserDto: RegisterDto): Promise<void> {
    const { password, email, fullName } = registerUserDto;

    const { breached, count } = await isBreachedPassword(password);

    if (breached) {
      logger.info({ count }, "Registration blocked: breached password");
      throw new ValidationError([
        {
          code: "custom",
          path: "password",
          message:
            "This password has appeared in a data breach. Please choose a different one.",
        },
      ]);
    }

    const passwordHash = await hashPassword(password);

    try {
      await this.userService.createUser({ email, fullName, passwordHash });
    } catch (error) {
      if (error instanceof ConflictError) {
        // TODO: send "account already exists" notification email
        return;
      }

      throw error;
    }
    //TODO: send verification email
  }

  async login(
    loginUserDto: LoginDto,
    metadata: SessionMetadata,
  ): Promise<LoginResult> {
    const user = await this.userService.findUserByEmail(loginUserDto.email);

    const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;

    const isPasswordValid = await comparePassword(
      passwordHash,
      loginUserDto.password,
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenError("Please verify your email before logging in");
    }

    const token = generateToken();
    const tokenHash = hashToken(token);

    await this.authRepository.createSession({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    });

    return { sessionToken: token };
  }

  async logout(sessionToken: string): Promise<void> {
    const tokenHash = hashToken(sessionToken);

    await this.authRepository.deleteSession(tokenHash);
  }

  async findValidSession(sessionToken: string): Promise<UserSession> {
    const tokenHash = hashToken(sessionToken);

    const session = await this.authRepository.findValidSession(tokenHash);

    if (!session) {
      throw new UnauthorizedError("Authentication required");
    }

    return session;
  }

  async logoutAll(userId: string): Promise<void> {
    await this.authRepository.deleteAllSessionsForUser(userId);
  }

  async listSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<SessionSummaryWithCurrent[]> {
    const sessions = await this.authRepository.findAllSessionsForUser(userId);

    return sessions.map((session) => ({
      ...session,
      isCurrent: session.id === currentSessionId,
    }));
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const deleted = await this.authRepository.deleteSessionForUser(
      sessionId,
      userId,
    );

    if (!deleted) {
      throw new NotFoundError("Session not found");
    }
  }
}
