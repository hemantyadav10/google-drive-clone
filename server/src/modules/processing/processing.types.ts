export const ProcessingJobName = {
  PROCESS_FILE: "processing:process-file",
} as const;

export type ProcessingJobName =
  (typeof ProcessingJobName)[keyof typeof ProcessingJobName];

interface ProcessFilePayload {
  name: typeof ProcessingJobName.PROCESS_FILE;
  data: { nodeId: string; userId: string };
}

export type ProcessingJob = ProcessFilePayload;

export const ProcessingQueueName = "processing";

export type ProcessingResult = {
  thumbnailSmall?: Buffer;
  thumbnailMedium?: Buffer;
  width?: number;
  height?: number;
  durationSeconds?: number;
  pageCount?: number;
};
