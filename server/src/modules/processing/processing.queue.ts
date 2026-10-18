import { Queue } from "bullmq";
import { queueRedis } from "../../config/redis.js";
import {
  type ProcessingJob,
  ProcessingJobName,
  ProcessingQueueName,
} from "./processing.types.js";

export class ProcessingQueue {
  private readonly queue: Queue<ProcessingJob["data"], void, ProcessingJobName>;

  constructor() {
    this.queue = new Queue(ProcessingQueueName, {
      connection: queueRedis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 },
      },
    });
  }

  async enqueueFileForProcessing(
    data: Extract<
      ProcessingJob,
      { name: typeof ProcessingJobName.PROCESS_FILE }
    >["data"],
  ) {
    await this.queue.add(ProcessingJobName.PROCESS_FILE, data, {
      jobId: `process-file-${data.nodeId}`,
    });
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
