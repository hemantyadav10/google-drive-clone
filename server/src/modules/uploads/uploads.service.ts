import { env } from "../../config/env.js";
import type { Database } from "../../db/index.js";
import type { Node, UploadSession } from "../../db/schema.js";
import {
  ApiError,
  BadRequestError,
  NotFoundError,
} from "../../utils/api-error.js";
import { generateObjectKey, getMultipartPlan } from "../../utils/helper.js";
import { logger } from "../../utils/logger.js";
import type { NodesService } from "../nodes/nodes.service.js";
import type { ProcessingQueue } from "../processing/processing.queue.js";
import type { IStorageService } from "../storage/storage.interface.js";
import {
  ACTIVE_UPLOAD_STATUSES,
  BATCH_SIZE,
  MULTIPART_UPLOAD_EXPIRY_SECONDS,
  MULTIPART_UPLOAD_THRESHOLD,
  PRESIGNED_URL_EXPIRY_SECONDS,
} from "./uploads.constants.js";
import type { UploadsRepository } from "./uploads.repository.js";
import type {
  GetPartsUploadUrlResponse,
  InitUploadResponse,
} from "./uploads.types.js";
import type { InitUploadDto, UploadCompleteDto } from "./uploads.validator.js";

export class UploadsService {
  constructor(
    private readonly db: Database,
    private readonly uploadsRepository: UploadsRepository,
    private readonly nodesService: NodesService,
    private readonly processingQueue: ProcessingQueue,
    private readonly storageService: IStorageService,
  ) {}

  async initUpload(
    userId: string,
    dto: InitUploadDto,
  ): Promise<InitUploadResponse> {
    const { parentId, size, mimeType, fileName } = dto;

    if (parentId) {
      const folder = await this.nodesService.findFolderById(userId, parentId);
      if (!folder) throw new NotFoundError("Parent folder not found");
    }

    const objectKey = generateObjectKey(userId, dto.fileName);

    if (size >= MULTIPART_UPLOAD_THRESHOLD) {
      const { partSize, totalParts } = getMultipartPlan(size);

      const multipartUploadResponse =
        await this.storageService.createMultipartUpload({
          Bucket: env.S3_BUCKET_NAME,
          Key: objectKey,
          ContentType: mimeType,
        });

      const uploadId = multipartUploadResponse.UploadId;
      if (!uploadId) throw new ApiError("Failed to create multipart upload");

      const uploadSession = await this.uploadsRepository.createUploadSession({
        uploadType: "multipart",
        userId,
        parentId,
        fileName,
        mimeType,
        totalSize: size,
        objectKey,
        s3UploadId: uploadId,
        totalParts,
        partSize,
      });
      if (!uploadSession) {
        // TODO: Abort Multipart Upload
        throw new ApiError("Failed to create upload session");
      }

      return {
        sessionId: uploadSession.id,
        uploadType: "multipart",
        uploadId,
        partSize,
        totalParts,
        expiresIn: MULTIPART_UPLOAD_EXPIRY_SECONDS,
      };
    } else {
      const uploadUrl = await this.storageService.getPresignedUploadUrl({
        Bucket: env.S3_BUCKET_NAME,
        Key: objectKey,
        ContentType: mimeType,
        ContentLength: size,
      });

      const uploadSession = await this.uploadsRepository.createUploadSession({
        userId,
        parentId,
        fileName,
        mimeType,
        totalSize: size,
        objectKey,
      });
      if (!uploadSession) throw new ApiError("Failed to create upload session");

      return {
        sessionId: uploadSession.id,
        uploadType: "single",
        uploadUrl,
        expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
      };
    }
  }

  async uploadComplete(userId: string, dto: UploadCompleteDto): Promise<Node> {
    const uploadSession =
      await this.uploadsRepository.findUploadSessionByIdAndUserId({
        uploadId: dto.uploadId,
        userId,
      });
    if (!uploadSession) throw new NotFoundError("Upload session not found");

    if (uploadSession.status === "completed") {
      const node = await this.nodesService.findNodeById(
        userId,
        uploadSession.nodeId!,
      );

      if (!node) throw new ApiError("Completed upload has no associated node");

      return node;
    }

    if (uploadSession.status !== "initiated")
      throw new BadRequestError(
        `Cannot complete an upload in status "${uploadSession.status}"`,
      );

    if (uploadSession.expiresAt < new Date())
      throw new BadRequestError("Upload session has expired");

    const headObjectResult = await this.storageService.getObjectHead({
      Bucket: env.S3_BUCKET_NAME,
      Key: uploadSession.objectKey,
    });

    const contentLength = headObjectResult.ContentLength;

    if (contentLength !== uploadSession.totalSize)
      throw new BadRequestError(
        "Uploaded file size does not match the expected size",
      );

    if (headObjectResult.ContentType !== uploadSession.mimeType)
      throw new BadRequestError(
        "Uploaded file type does not match the expected file type",
      );

    const fileNode = await this.finalizeUpload({
      userId,
      uploadSession,
    });

    return fileNode;
  }

  async getPartUploadUrls(
    userId: string,
    sessionId: string,
    startPart: number = 1,
  ): Promise<GetPartsUploadUrlResponse> {
    const uploadSession =
      await this.uploadsRepository.findUploadSessionByIdAndUserId({
        uploadId: sessionId,
        userId,
      });
    if (!uploadSession) throw new BadRequestError("Invalid upload session");

    if (uploadSession.uploadType !== "multipart")
      throw new BadRequestError("Invalid upload session");

    if (!ACTIVE_UPLOAD_STATUSES.includes(uploadSession.status))
      throw new BadRequestError(`Upload session is ${uploadSession.status}`);

    const { s3UploadId: uploadId, totalParts } = uploadSession;

    if (!uploadId || !totalParts)
      throw new BadRequestError("Invalid upload session");

    if (startPart > totalParts) throw new BadRequestError("Invalid part range");

    const remainingParts = totalParts - startPart + 1;
    const batchCount = Math.min(BATCH_SIZE, remainingParts);

    const partNumbers = Array.from({ length: batchCount }).map(
      (_, i) => startPart + i,
    );

    const urls = await Promise.all(
      partNumbers.map(async (partNumber) => ({
        partNumber,
        url: await this.storageService.getPresignedUploadPartUrl({
          Bucket: env.S3_BUCKET_NAME,
          Key: uploadSession.objectKey,
          UploadId: uploadId,
          PartNumber: partNumber,
        }),
      })),
    );

    return urls;
  }

  async completeMultipartUpload(
    userId: string,
    dto: { sessionId: string; parts: { partNumber: number; etag: string }[] },
  ): Promise<Node> {
    const uploadSession =
      await this.uploadsRepository.findUploadSessionByIdAndUserId({
        uploadId: dto.sessionId,
        userId,
      });
    if (!uploadSession) throw new NotFoundError("Upload session not found");

    if (uploadSession.uploadType !== "multipart")
      throw new BadRequestError("Invalid upload session");

    const nodeId = uploadSession.nodeId;
    if (uploadSession.status === "completed" && nodeId) {
      const node = await this.nodesService.findNodeById(userId, nodeId);

      if (!node) throw new ApiError("Completed upload has no associated node");
    }

    if (!ACTIVE_UPLOAD_STATUSES.includes(uploadSession.status))
      throw new BadRequestError(
        `Cannot complete an upload in status "${uploadSession.status}"`,
      );

    if (uploadSession.expiresAt < new Date())
      throw new BadRequestError("Upload session has expired");

    if (dto.parts.length !== uploadSession.totalParts)
      throw new BadRequestError(
        "Part count does not match expected total parts",
      );

    const uploadId = uploadSession.s3UploadId;
    if (!uploadId) throw new BadRequestError("Invalid upload session");

    await this.storageService.completeMultipartUpload({
      Bucket: env.S3_BUCKET_NAME,
      Key: uploadSession.objectKey,
      MultipartUpload: {
        Parts: dto.parts
          .sort((a, b) => a.partNumber - b.partNumber)
          .map((p) => ({ PartNumber: p.partNumber, ETag: p.etag })),
      },
      UploadId: uploadId,
    });

    const fileNode = await this.finalizeUpload({
      userId,
      uploadSession,
    });

    return fileNode;
  }

  private async finalizeUpload({
    userId,
    uploadSession,
  }: {
    userId: string;
    uploadSession: UploadSession;
  }): Promise<Node> {
    const headObjectResult = await this.storageService.getObjectHead({
      Bucket: env.S3_BUCKET_NAME,
      Key: uploadSession.objectKey,
    });

    const contentLength = headObjectResult.ContentLength;

    if (contentLength !== uploadSession.totalSize)
      throw new BadRequestError(
        "Uploaded file size does not match the expected size",
      );

    if (headObjectResult.ContentType !== uploadSession.mimeType)
      throw new BadRequestError(
        "Uploaded file type does not match the expected file type",
      );
    const fileNode = await this.db.transaction(async (tx) => {
      const lockedUploadSession =
        await this.uploadsRepository.findUploadSessionForUpdate(
          {
            uploadId: uploadSession.id,
          },
          tx,
        );

      if (!lockedUploadSession)
        throw new NotFoundError("Upload session not found");

      if (lockedUploadSession.status === "completed") {
        const node = await this.nodesService.findNodeById(
          userId,
          lockedUploadSession.nodeId!,
        );

        if (!node)
          throw new ApiError("Completed upload has no associated node");

        return node;
      }

      if (lockedUploadSession.status !== "initiated")
        throw new BadRequestError(
          `Cannot complete an upload in status "${lockedUploadSession.status}"`,
        );

      const node = await this.nodesService.createFileNode(
        userId,
        {
          name: lockedUploadSession.fileName,
          parentId: lockedUploadSession.parentId,
          mimeType: lockedUploadSession.mimeType,
          sizeBytes: lockedUploadSession.totalSize,
          storageKey: lockedUploadSession.objectKey,
          // sha256Checksum: headObjectResult.ChecksumSHA256 ?? null,
          contentModifiedAt: headObjectResult.LastModified ?? new Date(),
        },
        tx,
      );

      await this.uploadsRepository.markCompleted(
        {
          uploadId: lockedUploadSession.id,
          nodeId: node.id,
          uploadedSize: headObjectResult.ContentLength ?? contentLength,
        },
        tx,
      );

      // TODO: await this.userStorageRepository.incrementUsed(tx, userId, uploadSession.totalSize);

      return node;
    });

    try {
      await this.processingQueue.enqueueFileForProcessing({
        nodeId: fileNode.id,
        userId,
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to enqueue file processing job");
    }

    return fileNode;
  }
}
