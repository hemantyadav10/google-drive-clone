import type { Request, Response } from "express";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from "../../config/cookies.js";
import { HttpStatus } from "../../constants/http-status-codes.js";
import type { RequestWithBody } from "../../types/express.js";
import { ApiResponse } from "../../utils/index.js";
import type { LoginDto, RegisterDto } from "./auth.schema.js";
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
      .sendStatus(HttpStatus.NO_CONTENT);
  };
}
