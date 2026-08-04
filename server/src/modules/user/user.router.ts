import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { userController } from "../../container.js";

const userRouter = Router();

userRouter.get("/me", authenticate, userController.getCurrentUser);

export { userRouter };
