import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
  type CompleteMultipartUploadCommandInput,
  type CompleteMultipartUploadCommandOutput,
  type CreateMultipartUploadCommandInput,
  type CreateMultipartUploadCommandOutput,
  type GetObjectCommandInput,
  type GetObjectCommandOutput,
  type HeadObjectCommandInput,
  type HeadObjectCommandOutput,
  type PutObjectCommandInput,
  type S3Client,
  type UploadPartCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  PRESIGNED_DOWNLOAD_URL_EXPIRY_SECONDS,
  PRESIGNED_URL_EXPIRY_SECONDS,
} from "../uploads/uploads.constants.js";
import type { IStorageService } from "./storage.interface.js";

export class StorageService implements IStorageService {
  constructor(private readonly s3Client: S3Client) {}

  getPresignedUploadUrl(input: PutObjectCommandInput): Promise<string> {
    const command = new PutObjectCommand(input);
    return getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
    });
  }

  getObjectHead(
    input: HeadObjectCommandInput,
  ): Promise<HeadObjectCommandOutput> {
    const command = new HeadObjectCommand(input);
    return this.s3Client.send(command);
  }

  getObject(input: GetObjectCommandInput): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand(input);
    return this.s3Client.send(command);
  }

  async uploadObject(input: PutObjectCommandInput): Promise<void> {
    const command = new PutObjectCommand(input);
    await this.s3Client.send(command);
  }

  getSignedDownloadUrl(
    input: GetObjectCommandInput,
    expiresInSeconds = PRESIGNED_DOWNLOAD_URL_EXPIRY_SECONDS,
  ): Promise<string> {
    const command = new GetObjectCommand(input);

    return getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  createMultipartUpload(
    input: CreateMultipartUploadCommandInput,
  ): Promise<CreateMultipartUploadCommandOutput> {
    const command = new CreateMultipartUploadCommand(input);
    return this.s3Client.send(command);
  }

  getPresignedUploadPartUrl(input: UploadPartCommandInput): Promise<string> {
    const command = new UploadPartCommand(input);
    return getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
    });
  }

  completeMultipartUpload(
    input: CompleteMultipartUploadCommandInput,
  ): Promise<CompleteMultipartUploadCommandOutput> {
    const command = new CompleteMultipartUploadCommand(input);
    return this.s3Client.send(command);
  }
}
