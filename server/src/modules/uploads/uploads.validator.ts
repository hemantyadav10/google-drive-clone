import * as z from "zod";
import { MAX_FILE_SIZE, MAX_NAME_LENGTH } from "../../constants/node.js";

export const initUploadSchema = z.object({
  parentId: z.uuidv7("Invalid parent id").optional(),
  fileName: z
    .string()
    .min(1, "File name is required")
    .max(MAX_NAME_LENGTH, "File name is too long"),
  size: z
    .int()
    .positive("Invalid file size")
    .max(MAX_FILE_SIZE, "File size exceeds limit"),
  mimeType: z.string().min(1, "MIME type is required"),
});

export const uploadCompleteSchema = z.object({
  uploadId: z.uuid("Invalid upload id"),
});

export const getPartsUploadUrlParamsSchema = z.object({
  sessionId: z.uuidv7("Invalid session id"),
});

export const getPartsUploadUrlQuerySchema = z.object({
  startPart: z.coerce
    .number()
    .int("Part number must be an integer")
    .positive("Part number must be greater than 0"),
});

export const completeMultipartUploadParamsSchema = z.object({
  sessionId: z.uuidv7("Invalid session id"),
});

export const completeMultipartUploadBodySchema = z.object({
  parts: z.array(
    z.object({
      partNumber: z
        .number()
        .int("Part number must be an integer")
        .positive("Part number must be greater than 0"),
      etag: z.string().min(1, "Etag is required"),
    }),
  ),
});

export type InitUploadDto = z.infer<typeof initUploadSchema>;
export type UploadCompleteDto = z.infer<typeof uploadCompleteSchema>;
export type GetPartsUploadUrlParams = z.infer<
  typeof getPartsUploadUrlParamsSchema
>;
export type GetPartsUploadUrlQuery = z.infer<
  typeof getPartsUploadUrlQuerySchema
>;
export type CompleteMultipartUploadParams = z.infer<
  typeof completeMultipartUploadParamsSchema
>;
export type CompleteMultipartUploadDto = z.infer<
  typeof completeMultipartUploadBodySchema
>;
