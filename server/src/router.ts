import { Router } from "express";
import { authRouter } from "./modules/auth/auth.routes.js";
import { nodesRouter } from "./modules/nodes/nodes.routes.js";
import { userRouter } from "./modules/user/user.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/nodes", nodesRouter);

export default router;
