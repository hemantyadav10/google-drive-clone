import { Router } from "express";
import { authRouter } from "./modules/auth/auth.routes.js";
import { sseRouter } from "./modules/events/sse.routes.js";
import { nodesRouter } from "./modules/nodes/nodes.routes.js";
import { uploadsRouter } from "./modules/uploads/uploads.routes.js";
import { userRouter } from "./modules/user/user.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/nodes", nodesRouter);
router.use("/uploads", uploadsRouter);
router.use("/events", sseRouter);

export default router;
