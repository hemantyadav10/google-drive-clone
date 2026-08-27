import { Router } from "express";
import { userController } from "../../container.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";

const userRouter = Router();

userRouter.get("/me", authenticate, userController.getCurrentUser);

export { userRouter };
