import type { Response } from "express";
import { HttpStatus } from "../../constants/http-status-codes.js";
import type {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from "../../types/request.types.js";
import { ApiResponse } from "../../utils/api-response.js";
import { getValidatedQuery } from "../../utils/request.js";
import { requireUser } from "../../utils/require-user.js";
import { toNodeResponse } from "../nodes/nodes.mapper.js";
import type { UploadsService } from "./uploads.service.js";
import type {
  CompleteMultipartUploadDto,
  CompleteMultipartUploadParams,
  GetPartsUploadUrlParams,
  GetPartsUploadUrlQuery,
  InitUploadDto,
  UploadCompleteDto,
} from "./uploads.validator.js";

export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  initUpload = async (
    req: RequestWithBody<InitUploadDto>,
    res: Response,
  ): Promise<void> => {
    const { id: userId } = requireUser(req);
    const response = await this.uploadsService.initUpload(userId, req.body);
    res
      .status(HttpStatus.OK)
      .json(ApiResponse.ok(response, "Upload initialized"));
  };

  uploadComplete = async (
    req: RequestWithBody<UploadCompleteDto>,
    res: Response,
  ): Promise<void> => {
    const { id: userId } = requireUser(req);
    const { uploadId } = req.body;
    const node = await this.uploadsService.uploadComplete(userId, { uploadId });
    res
      .status(HttpStatus.OK)
      .json(ApiResponse.ok(toNodeResponse(node), "Upload completed"));
  };

  getPartUploadUrls = async (
    req: RequestWithParams<GetPartsUploadUrlParams>,
    res: Response,
  ): Promise<void> => {
    const { id: userId } = requireUser(req);
    const { sessionId } = req.params;
    const { startPart } = getValidatedQuery<GetPartsUploadUrlQuery>(res);
    const urls = await this.uploadsService.getPartUploadUrls(
      userId,
      sessionId,
      startPart,
    );
    res
      .status(HttpStatus.OK)
      .json(ApiResponse.ok(urls, "Part upload URLs retrieved"));
  };

  completeMultipartUpload = async (
    req: RequestWithParamsAndBody<
      CompleteMultipartUploadParams,
      CompleteMultipartUploadDto
    >,
    res: Response,
  ): Promise<void> => {
    const { id: userId } = requireUser(req);
    const { sessionId } = req.params;
    const { parts } = req.body;
    const node = await this.uploadsService.completeMultipartUpload(userId, {
      parts,
      sessionId,
    });
    res
      .status(HttpStatus.OK)
      .json(ApiResponse.ok(toNodeResponse(node), "Multipart upload completed"));
  };
}
