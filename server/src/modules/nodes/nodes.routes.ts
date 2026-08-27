import { Router } from "express";
import { nodesController } from "../../container.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate-request.middleware.js";
import { createFolderSchema, getNodesQuerySchema } from "./nodes.validator.js";

export const nodesRouter = Router();

nodesRouter
  .route("/folders")
  .post(
    authenticate,
    validate("body", createFolderSchema),
    nodesController.createFolder,
  );

nodesRouter
  .route("/")
  .get(
    authenticate,
    validate("query", getNodesQuerySchema),
    nodesController.getNodes,
  );
