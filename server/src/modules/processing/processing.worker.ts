import { Worker } from "bullmq";
import { queueRedis } from "../../config/redis.js";
import { logger } from "../../utils/logger.js";
import type { ProcessingService } from "./processing.service.js";
import {
  ProcessingJobName,
  ProcessingQueueName,
  type ProcessingJob,
} from "./processing.types.js";

export class ProcessingWorker {
  private readonly worker: Worker<
    ProcessingJob["data"],
    void,
    ProcessingJobName
  >;

  constructor(private readonly processingService: ProcessingService) {
    this.worker = new Worker(
      ProcessingQueueName,
      async (job) => {
        switch (job.name) {
          case ProcessingJobName.PROCESS_FILE:
            await this.processingService.processFile({
              fileId: job.data.nodeId,
              userId: job.data.userId,
            });
            break;

          default:
            throw new Error(`Unknown job name: ${job.name satisfies never}`);
        }
      },
      {
        connection: queueRedis,
        concurrency: 4,
      },
    );

    this.registerListeners();
  }

  private registerListeners() {
    this.worker.on("completed", (job) => {
      logger.info(
        { jobId: job.id, name: job.name },
        "Processing job completed",
      );
    });

    this.worker.on("failed", (job, err) => {
      logger.error(
        { jobId: job?.id, name: job?.name, err },
        "processing job failed",
      );
    });

    this.worker.on("error", (err) => {
      logger.error({ err }, "Worker connection error");
    });
  }

  async close(): Promise<void> {
    await this.worker.close();
  }
}
