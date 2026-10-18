import type { UploadStatus } from "../../db/schema.js";

export const MULTIPART_UPLOAD_THRESHOLD = 50 * 1024 * 1024; // 50 MB
export const PRESIGNED_URL_EXPIRY_SECONDS = 30 * 60;
export const PRESIGNED_DOWNLOAD_URL_EXPIRY_SECONDS = 3600;
export const MULTIPART_UPLOAD_EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours
export const ACTIVE_UPLOAD_STATUSES: UploadStatus[] = [
  "initiated",
  "uploading",
];
export const BATCH_SIZE = 5;
