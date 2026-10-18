import { Router } from "express";
import { nodesController } from "../../container.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate-request.middleware.js";
import {
  createFolderSchema,
  getNodeChildrenParamsSchema,
  getNodeChildrenQuerySchema,
  getNodeDetailsParamsSchema,
} from "./nodes.validator.js";

export const nodesRouter = Router();

nodesRouter
  .route("/")
  .post(
    authenticate,
    validate("body", createFolderSchema),
    nodesController.createFolder,
  );

nodesRouter
  .route("/root/children")
  .get(
    authenticate,
    validate("query", getNodeChildrenQuerySchema),
    nodesController.getRootChildren,
  );

nodesRouter
  .route("/:nodeId/children")
  .get(
    authenticate,
    validate("params", getNodeChildrenParamsSchema),
    validate("query", getNodeChildrenQuerySchema),
    nodesController.getNodeChildren,
  );

nodesRouter
  .route("/:nodeId")
  .get(
    authenticate,
    validate("params", getNodeDetailsParamsSchema),
    nodesController.getNodeDetails,
  );
