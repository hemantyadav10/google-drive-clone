import { Router } from "express";
import { uploadsController } from "../../container.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate-request.middleware.js";
import {
  completeMultipartUploadBodySchema,
  completeMultipartUploadParamsSchema,
  getPartsUploadUrlParamsSchema,
  getPartsUploadUrlQuerySchema,
  initUploadSchema,
  uploadCompleteSchema,
} from "./uploads.validator.js";

const uploadsRouter = Router();

uploadsRouter.post(
  "/init",
  authenticate,
  validate("body", initUploadSchema),
  uploadsController.initUpload,
);

uploadsRouter.post(
  "/complete",
  authenticate,
  validate("body", uploadCompleteSchema),
  uploadsController.uploadComplete,
);

uploadsRouter.get(
  "/:sessionId/parts",
  authenticate,
  validate("params", getPartsUploadUrlParamsSchema),
  validate("query", getPartsUploadUrlQuerySchema),
  uploadsController.getPartUploadUrls,
);

uploadsRouter.post(
  "/:sessionId/complete-multipart",
  authenticate,
  validate("params", completeMultipartUploadParamsSchema),
  validate("body", completeMultipartUploadBodySchema),
  uploadsController.completeMultipartUpload,
);

export { uploadsRouter };
