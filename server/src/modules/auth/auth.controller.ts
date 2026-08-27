import type { Request, Response } from "express";
import {
  COOKIE_NAMES,
  GOOGLE_OAUTH_COOKIE_OPTIONS,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from "../../config/cookies.js";
import { env } from "../../config/env.js";
import { ErrorCodes } from "../../constants/error-codes.js";
import { HttpStatus } from "../../constants/http-status-codes.js";
import type {
  RequestWithBody,
  RequestWithParams,
} from "../../types/request.types.js";
import {
  ApiError,
  ApiResponse,
  logger,
  requireUser,
} from "../../utils/index.js";
import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResendVerificationEmailDto,
  ResetPasswordDto,
  SessionIdParams,
  VerifyEmailDto,
} from "./auth.validator.js";
import type { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (
    req: RequestWithBody<RegisterDto>,
    res: Response,
  ): Promise<void> => {
    await this.authService.registerUser(req.body);
    res
      .status(HttpStatus.CREATED)
      .json(
        ApiResponse.created(
          null,
          "A link to activate your account has been emailed to the address provided.",
        ),
      );
  };

  login = async (
    req: RequestWithBody<LoginDto>,
    res: Response,
  ): Promise<void> => {
    const { sessionToken, user } = await this.authService.login(req.body, {
      userAgent: req.get("user-agent") ?? null,
      ipAddress: req.ip ?? null,
    });
    res
      .cookie(SESSION_COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS)
      .status(HttpStatus.OK)
      .json(ApiResponse.ok(user, "Login successful"));
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const sessionToken: unknown = req.cookies[SESSION_COOKIE_NAME];
    if (sessionToken && typeof sessionToken === "string") {
      await this.authService.logout(sessionToken);
    }
    res
      .clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS)
      .status(HttpStatus.OK)
      .json(ApiResponse.ok(null, "Logged out successfully"));
  };

  logoutAll = async (req: Request, res: Response): Promise<void> => {
    const { id: userId } = requireUser(req);
    await this.authService.logoutAll(userId);
    res
      .clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS)
      .status(HttpStatus.OK)
      .json(ApiResponse.ok(null, "Logged out from all devices successfully"));
  };

  listSessions = async (req: Request, res: Response): Promise<void> => {
    const { id: userId, sessionId } = requireUser(req);
    const sessions = await this.authService.listSessions(userId, sessionId);
    res
      .status(HttpStatus.OK)
      .json(ApiResponse.ok(sessions, "Sessions retrieved successfully"));
  };

  revokeSession = async (
    req: RequestWithParams<SessionIdParams>,
    res: Response,
  ): Promise<void> => {
    const { id: userId } = requireUser(req);
    const { sessionId } = req.params;
    await this.authService.revokeSession(sessionId, userId);
    res.sendStatus(HttpStatus.NO_CONTENT);
  };

  verifyEmail = async (
    req: RequestWithBody<VerifyEmailDto>,
    res: Response,
  ): Promise<void> => {
    await this.authService.verifyEmail(req.body.token);
    res
      .status(HttpStatus.OK)
      .json(ApiResponse.ok(null, "Email verified successfully"));
  };

  forgotPassword = async (
    req: RequestWithBody<ForgotPasswordDto>,
    res: Response,
  ): Promise<void> => {
    await this.authService.forgotPassword(req.body.email);
    res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.ok(
          null,
          "If an account exists for this email, password reset instructions have been sent.",
        ),
      );
  };

  resetPassword = async (
    req: RequestWithBody<ResetPasswordDto>,
    res: Response,
  ): Promise<void> => {
    await this.authService.resetPassword(req.body);
    res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.ok(
          null,
          "Password reset successfully. Please log in with your new password.",
        ),
      );
  };

  changePassword = async (
    req: RequestWithBody<ChangePasswordDto>,
    res: Response,
  ): Promise<void> => {
    const { id: userId, sessionId } = requireUser(req);
    await this.authService.changePassword(userId, sessionId, req.body);
    res
      .status(HttpStatus.OK)
      .json(ApiResponse.ok(null, "Password changed successfully."));
  };

  googleLogin = (_req: Request, res: Response): void => {
    const { codeVerifier, state, url } = this.authService.googleLogin();
    res
      .cookie(
        COOKIE_NAMES.GOOGLE_OAUTH_STATE,
        state,
        GOOGLE_OAUTH_COOKIE_OPTIONS,
      )
      .cookie(
        COOKIE_NAMES.GOOGLE_CODE_VERIFIER,
        codeVerifier,
        GOOGLE_OAUTH_COOKIE_OPTIONS,
      )
      .redirect(url);
  };

  googleCallback = async (req: Request, res: Response): Promise<void> => {
    const code = req.query["code"] as string | undefined;
    const state = req.query["state"] as string | undefined;

    const storedState = req.cookies[COOKIE_NAMES.GOOGLE_OAUTH_STATE] as
      | string
      | undefined;
    const codeVerifier = req.cookies[COOKIE_NAMES.GOOGLE_CODE_VERIFIER] as
      | string
      | undefined;

    try {
      const { sessionToken } = await this.authService.googleCallback({
        code,
        state,
        storedState,
        codeVerifier,
        userAgent: req.get("user-agent") ?? null,
        ipAddress: req.ip ?? null,
      });

      res
        .clearCookie(COOKIE_NAMES.GOOGLE_OAUTH_STATE)
        .clearCookie(COOKIE_NAMES.GOOGLE_CODE_VERIFIER)
        .cookie(SESSION_COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS)
        .redirect(`${env.CLIENT_URL}/home`);
    } catch (error: unknown) {
      res.clearCookie(COOKIE_NAMES.GOOGLE_OAUTH_STATE);
      res.clearCookie(COOKIE_NAMES.GOOGLE_CODE_VERIFIER);

      if (error instanceof ApiError) {
        switch (error.code) {
          case ErrorCodes.OAUTH_EMAIL_UNVERIFIED:
            return res.redirect(
              `${env.CLIENT_URL}/login?error=unverified_email`,
            );

          case ErrorCodes.OAUTH_STATE_MISMATCH:
            return res.redirect(`${env.CLIENT_URL}/login?error=invalid_state`);

          case ErrorCodes.OAUTH_MISSING_PARAMS:
            return res.redirect(`${env.CLIENT_URL}/login?error=missing_params`);

          case ErrorCodes.OAUTH_CODE_INVALID:
            return res.redirect(`${env.CLIENT_URL}/login?error=code_expired`);

          case ErrorCodes.OAUTH_PROVIDER_ERROR:
            return res.redirect(`${env.CLIENT_URL}/login?error=provider_down`);
        }
      }

      logger.error({ err: error }, "OAuth Callback Unhandled Error");
      res.redirect(`${env.CLIENT_URL}/login?error=oauth_failed`);
    }
  };

  resendVerificationEmail = async (
    req: RequestWithBody<ResendVerificationEmailDto>,
    res: Response,
  ): Promise<void> => {
    await this.authService.resendVerificationEmail(req.body.email);
    res.status(HttpStatus.OK).json({
      success: true,
      message:
        "If an account with that email exists, a verification link has been sent.",
    });
  };
}
