import type {
  CompleteMultipartUploadCommandInput,
  CompleteMultipartUploadCommandOutput,
  CreateMultipartUploadCommandInput,
  CreateMultipartUploadCommandOutput,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  HeadObjectCommandInput,
  HeadObjectCommandOutput,
  PutObjectCommandInput,
  UploadPartCommandInput,
} from "@aws-sdk/client-s3";

export interface IStorageService {
  getPresignedUploadUrl(input: PutObjectCommandInput): Promise<string>;

  getObjectHead(
    input: HeadObjectCommandInput,
  ): Promise<HeadObjectCommandOutput>;

  getObject(input: GetObjectCommandInput): Promise<GetObjectCommandOutput>;

  uploadObject(input: PutObjectCommandInput): Promise<void>;

  getSignedDownloadUrl(
    input: GetObjectCommandInput,
    expiresInSeconds?: number,
  ): Promise<string>;

  createMultipartUpload(
    input: CreateMultipartUploadCommandInput,
  ): Promise<CreateMultipartUploadCommandOutput>;

  getPresignedUploadPartUrl(input: UploadPartCommandInput): Promise<string>;

  completeMultipartUpload(
    input: CompleteMultipartUploadCommandInput,
  ): Promise<CompleteMultipartUploadCommandOutput>;
}
