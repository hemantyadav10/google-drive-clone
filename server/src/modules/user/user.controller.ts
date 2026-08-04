import type { Request, Response } from "express";
import { ErrorCodes } from "../../constants/error-codes.js";
import { HttpStatus } from "../../constants/http-status-codes.js";
import { UnauthorizedError } from "../../utils/api-error.js";
import { ApiResponse } from "../../utils/api-response.js";
import { requireUser } from "../../utils/require-user.js";
import type { UserService } from "./user.service.js";
import { toUserProfile } from "./user.types.js";

export class UserController {
  constructor(private readonly userService: UserService) {}

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req);
    const user = await this.userService.findUserById(id);
    if (!user) {
      throw new UnauthorizedError("User not found", ErrorCodes.SESSION_EXPIRED);
    }
    res
      .status(HttpStatus.OK)
      .json(ApiResponse.ok(toUserProfile(user), "User retrieved successfully"));
  };
}
