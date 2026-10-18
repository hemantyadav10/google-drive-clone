import { Router } from "express";
import { sseService } from "../../container.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { requireUser } from "../../utils/require-user.js";

const sseRouter = Router();

sseRouter.get("/", authenticate, (req, res) => {
  const { id: userId } = requireUser(req);
  sseService.addClient(userId, res);
});

export { sseRouter };
