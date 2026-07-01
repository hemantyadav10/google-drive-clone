import type { Request, Response } from "express";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from "../../config/cookies.js";
import { HttpStatus } from "../../constants/http-status-codes.js";
import type {
  RequestWithBody,
  RequestWithParams,
} from "../../types/request.types.js";
import { ApiResponse, requireUser } from "../../utils/index.js";
import type { LoginDto, RegisterDto, SessionIdParams } from "./auth.schema.js";
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
    const { sessionToken } = await this.authService.login(req.body, {
      userAgent: req.get("user-agent") ?? null,
      ipAddress: req.ip ?? null,
    });
    res
      .cookie(SESSION_COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS)
      .status(HttpStatus.OK)
      .json(ApiResponse.ok(null, "Login successful"));
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
}
