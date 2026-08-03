import { Queue } from "bullmq";
import { queueRedis } from "../../config/redis.js";
import { EmailJobName, type EmailJob } from "./email.types.js";

export class EmailQueue {
  private readonly queue: Queue<EmailJob["data"], void, EmailJobName>;

  constructor() {
    this.queue = new Queue("email", {
      connection: queueRedis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 },
      },
    });
  }

  async enqueueVerificationEmail(
    data: Extract<
      EmailJob,
      { name: typeof EmailJobName.VERIFY_ACCOUNT }
    >["data"],
  ): Promise<void> {
    await this.queue.add(EmailJobName.VERIFY_ACCOUNT, data);
  }

  async enqueuePasswordResetEmail(
    data: Extract<
      EmailJob,
      { name: typeof EmailJobName.PASSWORD_RESET }
    >["data"],
  ): Promise<void> {
    await this.queue.add(EmailJobName.PASSWORD_RESET, data);
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
