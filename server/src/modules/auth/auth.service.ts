import * as arctic from "arctic";
import { env } from "../../config/env.js";
import { google } from "../../config/oauth.js";
import {
  DUMMY_PASSWORD_HASH,
  ErrorCodes,
  LAST_ACTIVE_UPDATE_THRESHOLD_MS,
  PASSWORD_RESET_TOKEN_LIFETIME_MS,
  SESSION_LIFETIME_MS,
  VERIFICATION_TOKEN_LIFETIME_MS,
} from "../../constants/index.js";
import type { Database } from "../../db/index.js";
import type { User, UserSession } from "../../db/schema.js";
import { resolveDeviceType } from "../../utils/device-types.js";
import {
  ApiError,
  BadRequestError,
  comparePassword,
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
import { parseUserAgent } from "../../utils/session-metadata.js";
import type { EmailQueue } from "../email/email.queue.js";
import type { UserService } from "../user/user.service.js";
import { toUserProfile } from "../user/user.types.js";
import type { AccountRepository } from "./account.repository.js";
import type { AuthRepository } from "./auth.repository.js";
import {
  googleIdTokenPayloadSchema,
  type ChangePasswordDto,
  type GoogleIdTokenPayload,
  type LoginDto,
  type RegisterDto,
  type ResetPasswordDto,
} from "./auth.validator.js";
import type {
  GoogleCallbackParams,
  LoginResult,
  SessionMetadata,
  SessionSummaryWithCurrent,
} from "./auth.types.js";
import type { EmailVerificationRepository } from "./email-verification.repository.js";
import type { PasswordResetRepository } from "./password-reset.repository.js";

export class AuthService {
  constructor(
    private readonly db: Database,
    private readonly authRepository: AuthRepository,
    private readonly userService: UserService,
    private readonly emailQueue: EmailQueue,
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly accountRepository: AccountRepository,
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

    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_LIFETIME_MS);

    const verificationUser = await this.db.transaction(async (tx) => {
      // Avoids exception-driven control flow for duplicate registrations by
      // returning null when the email is already in use.
      let user = await this.userService.createUserIfNotExists(tx, {
        email,
        fullName,
        passwordHash,
      });

      if (!user) {
        logger.info(
          { email },
          "Registration attempted for an existing account",
        );

        const existingUser = await this.userService.findUserByEmail(tx, email);

        if (!existingUser) {
          // Unexpected: a unique constraint violation occurred, but the conflicting
          // user could not be loaded. This indicates an inconsistent persistence state.
          throw new ApiError(
            "Registration conflict occurred but user not found by email",
          );
        }

        if (existingUser.isEmailVerified) {
          // Silently no-op instead of throwing ConflictError, to avoid leaking account
          // existence via response timing/status (email enumeration). Caller should
          // respond with a generic "check your inbox" message regardless of outcome.
          // TODO: queue a "someone tried to register with your email" notification
          // to the existing owner, so they're alerted to potential account probing
          // without the requester learning the email is taken.
          return null;
        }

        // Allow an existing unverified account to complete registration by
        // replacing the pending credentials and issuing a fresh verification link.
        user = await this.userService.updateUnverifiedUser(tx, {
          userId: existingUser.id,
          fullName,
          passwordHash,
        });
      }

      if (!user) {
        return null;
      }

      // Keep exactly one active verification token per user. Issuing a new
      // token implicitly invalidates all previously generated verification links.
      await this.emailVerificationRepository.upsert(tx, {
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      return user;
    });

    if (!verificationUser) {
      return;
    }

    // Email delivery is intentionally performed after the transaction commits.
    // Registration succeeds even if enqueueing fails; the user can request
    // another verification email later.
    try {
      await this.emailQueue.enqueueVerificationEmail({
        email: verificationUser.email,
        fullName: verificationUser.fullName,
        token,
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to enqueue verification email");
    }
  }

  async login(
    loginUserDto: LoginDto,
    metadata: SessionMetadata,
  ): Promise<LoginResult> {
    const user = await this.userService.findUserByEmail(
      this.db,
      loginUserDto.email,
    );

    const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;

    const isPasswordValid = await comparePassword(
      passwordHash,
      loginUserDto.password,
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedError(
        "Invalid email or password",
        ErrorCodes.INVALID_CREDENTIALS,
      );
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenError(
        "Please verify your email before logging in",
        ErrorCodes.EMAIL_NOT_VERIFIED,
      );
    }

    const sessionToken = await this.createUserSession(user, metadata);

    return { sessionToken, user: toUserProfile(user) };
  }

  async logout(sessionToken: string): Promise<void> {
    const tokenHash = hashToken(sessionToken);

    await this.authRepository.deleteSession(this.db, tokenHash);
  }

  async findValidSession(sessionToken: string): Promise<UserSession> {
    const tokenHash = hashToken(sessionToken);

    const session = await this.authRepository.findValidSession(
      this.db,
      tokenHash,
    );

    if (!session) {
      throw new UnauthorizedError(
        "Authentication required",
        ErrorCodes.SESSION_EXPIRED,
      );
    }

    const staleBy = Date.now() - session.lastActiveAt.getTime();
    if (staleBy > LAST_ACTIVE_UPDATE_THRESHOLD_MS) {
      this.authRepository
        .touchLastActive(this.db, session.id)
        .catch((err) => logger.error({ err }, "Failed to update lastActiveAt"));
    }

    return session;
  }

  async logoutAll(userId: string): Promise<void> {
    await this.authRepository.deleteAllSessionsForUser(this.db, userId);
  }

  async listSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<SessionSummaryWithCurrent[]> {
    const sessions = await this.authRepository.findAllSessionsForUser(
      this.db,
      userId,
    );

    const withCurrent = sessions.map((session) => ({
      ...session,
      isCurrent: session.id === currentSessionId,
    }));

    return withCurrent.sort((a, b) => {
      if (a.isCurrent) return -1;
      if (b.isCurrent) return 1;
      return 0;
    });
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const deleted = await this.authRepository.deleteSessionForUser(
      this.db,
      sessionId,
      userId,
    );

    if (!deleted) {
      throw new NotFoundError("Session not found");
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashToken(token);

    await this.db.transaction(async (tx) => {
      const record = await this.emailVerificationRepository.deleteValidToken(
        tx,
        tokenHash,
      );

      if (!record) {
        throw new BadRequestError(
          "This verification link is invalid or has expired",
        );
      }

      await this.userService.markEmailVerified(tx, record.userId);
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_LIFETIME_MS);

    const user = await this.userService.findUserByEmail(this.db, email);

    if (!user) {
      // NOTE:
      // This branch returns earlier than the "user exists" path, so response timing
      // is not fully normalized. Generic responses, rate limiting, and Turnstile
      // mitigate the practical risk. A production-hardening option is to move the
      // entire flow into a background worker (BullMQ).
      return;
    }

    await this.passwordResetRepository.upsert(this.db, {
      tokenHash,
      userId: user.id,
      expiresAt,
    });

    try {
      await this.emailQueue.enqueuePasswordResetEmail({
        email: user.email,
        fullName: user.fullName,
        token,
      });
    } catch (error) {
      logger.error(
        { err: error, email },
        "Failed to enqueue password reset email",
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, password } = resetPasswordDto;
    const tokenHash = hashToken(token);

    const validToken = await this.passwordResetRepository.findValidToken(
      this.db,
      tokenHash,
    );
    if (!validToken) {
      throw new BadRequestError("This reset link is invalid or has expired");
    }

    const { breached, count } = await isBreachedPassword(password);
    if (breached) {
      logger.info({ count }, "Reset password blocked: breached password");
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

    await this.db.transaction(async (tx) => {
      const resetPasswordToken =
        await this.passwordResetRepository.deleteValidToken(tx, tokenHash);
      if (!resetPasswordToken) {
        throw new BadRequestError("This reset link is invalid or has expired");
      }

      const updatedUser = await this.userService.updatePassword(tx, {
        passwordHash,
        userId: resetPasswordToken.userId,
      });
      if (!updatedUser) {
        throw new NotFoundError("User no longer exists");
      }

      await this.authRepository.deleteAllSessionsForUser(
        tx,
        resetPasswordToken.userId,
      );
    });

    // TODO (optional): send "password changed" confirmation email
  }

  async changePassword(
    userId: string,
    currentSessionId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError(
        "Current password is incorrect",
        ErrorCodes.INVALID_CREDENTIALS,
      );
    }

    const isCurrentPasswordValid = await comparePassword(
      user.passwordHash,
      currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError(
        "Current password is incorrect",
        ErrorCodes.INVALID_CREDENTIALS,
      );
    }

    const { breached, count } = await isBreachedPassword(newPassword);
    if (breached) {
      logger.info({ count }, "Password change blocked: breached password");
      throw new ValidationError([
        {
          code: "custom",
          path: "newPassword",
          message:
            "This password has appeared in a data breach. Please choose a different one.",
        },
      ]);
    }

    const passwordHash = await hashPassword(newPassword);

    await this.db.transaction(async (tx) => {
      const updatedUser = await this.userService.updatePassword(tx, {
        userId,
        passwordHash,
      });
      if (!updatedUser) {
        throw new NotFoundError("User no longer exists");
      }

      await this.authRepository.deleteAllSessionsForUserExcept(
        tx,
        userId,
        currentSessionId,
      );
    });

    // TODO (optional): send "your password was changed" notification email
  }

  googleLogin(): { state: string; codeVerifier: string; url: string } {
    const state = arctic.generateState();
    const codeVerifier = arctic.generateCodeVerifier();
    const scopes = ["openid", "profile", "email"];
    const url = google.createAuthorizationURL(state, codeVerifier, scopes);

    return { state, codeVerifier, url: url.toString() };
  }

  async googleCallback({
    code,
    codeVerifier,
    ipAddress,
    state,
    storedState,
    userAgent,
  }: GoogleCallbackParams): Promise<LoginResult> {
    if (!code || !state || !storedState || !codeVerifier) {
      throw new BadRequestError(
        "Missing required OAuth parameters",
        ErrorCodes.OAUTH_MISSING_PARAMS,
      );
    }

    if (state !== storedState) {
      throw new UnauthorizedError(
        "OAuth state mismatch. Security verification failed.",
        ErrorCodes.OAUTH_STATE_MISMATCH,
      );
    }

    try {
      const tokens = await google.validateAuthorizationCode(code, codeVerifier);
      const idToken = tokens.idToken();
      const rawClaims = arctic.decodeIdToken(idToken);

      const result = googleIdTokenPayloadSchema.safeParse(rawClaims);

      if (!result.success) {
        throw new BadRequestError(
          "Malformed Google ID token",
          ErrorCodes.OAUTH_ERROR,
        );
      }

      const claims = result.data;

      if (claims.aud !== env.GOOGLE_CLIENT_ID) {
        throw new BadRequestError(
          "Token audience mismatch",
          ErrorCodes.OAUTH_ERROR,
        );
      }

      if (!claims.email_verified) {
        throw new ForbiddenError(
          "Google account email is not verified.",
          ErrorCodes.OAUTH_EMAIL_UNVERIFIED,
        );
      }

      const user = await this.findOrCreateGoogleUser(claims);

      const sessionToken = await this.createUserSession(user, {
        ipAddress,
        userAgent,
      });

      return { sessionToken, user: toUserProfile(user) };
    } catch (error) {
      if (error instanceof arctic.OAuth2RequestError) {
        throw new UnauthorizedError(
          "Invalid or expired Google authorization code",
          ErrorCodes.OAUTH_CODE_INVALID,
        );
      }

      if (error instanceof arctic.ArcticFetchError) {
        throw new ApiError("Failed to contact Google authentication server", {
          statusCode: 502,
          code: ErrorCodes.OAUTH_PROVIDER_ERROR,
        });
      }

      throw error;
    }
  }

  private async findOrCreateGoogleUser(
    claims: GoogleIdTokenPayload,
  ): Promise<User> {
    const existingByGoogleId = await this.userService.findUserByProvider(
      this.db,
      "google",
      claims.sub,
    );
    if (existingByGoogleId) {
      if (!existingByGoogleId.isEmailVerified) {
        await this.userService.markEmailVerified(
          this.db,
          existingByGoogleId.id,
        );
        return { ...existingByGoogleId, isEmailVerified: true };
      }
      return existingByGoogleId;
    }

    const existingByEmail = await this.userService.findUserByEmail(
      this.db,
      claims.email,
    );
    if (existingByEmail) {
      await this.db.transaction(async (tx) => {
        await this.accountRepository.create(tx, {
          provider: "google",
          providerId: claims.sub,
          userId: existingByEmail.id,
        });

        if (!existingByEmail.isEmailVerified) {
          await this.userService.markEmailVerified(tx, existingByEmail.id);
        }
      });

      return { ...existingByEmail, isEmailVerified: true };
    }

    return this.db.transaction(async (tx) => {
      const newUser = await this.userService.createOAuthUser(tx, {
        email: claims.email,
        fullName: claims.name,
        emailVerifiedAt: new Date(),
        profilePicture: claims.picture,
        isEmailVerified: claims.email_verified,
      });

      await this.accountRepository.create(tx, {
        provider: "google",
        providerId: claims.sub,
        userId: newUser.id,
      });

      return newUser;
    });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userService.findUserByEmail(this.db, email);

    // Return silently to prevent account enumeration.
    if (!user || user.isEmailVerified) return;

    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_LIFETIME_MS);

    // Replace the previous token — only the newest verification link remains valid.
    await this.emailVerificationRepository.upsert(this.db, {
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    try {
      await this.emailQueue.enqueueVerificationEmail({
        email: user.email,
        fullName: user.fullName,
        token,
      });
    } catch (error) {
      // Don't expose email delivery failures to the caller.
      logger.error(
        { err: error, userId: user.id },
        "Failed to enqueue verification email",
      );
    }
  }

  private async createUserSession(
    user: User,
    metadata: SessionMetadata,
  ): Promise<string> {
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);

    const { browser, device, os } = parseUserAgent(metadata.userAgent ?? "");

    await this.authRepository.createSession(this.db, {
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      browserName: browser.name,
      deviceType: resolveDeviceType(device.type),
      osName: os.name,
    });

    return token;
  }
}
