import { Worker } from "bullmq";
import { queueRedis } from "../../config/redis.js";
import { logger } from "../../utils/logger.js";
import type { EmailService } from "./email.service.js";
import { EmailJobName, type EmailJob } from "./email.types.js";

export class EmailWorker {
  private readonly worker: Worker<EmailJob["data"], void, EmailJobName>;

  constructor(private readonly emailService: EmailService) {
    this.worker = new Worker(
      "email",
      async (job) => {
        switch (job.name) {
          case EmailJobName.VERIFY_ACCOUNT:
            await this.emailService.sendVerificationEmail({
              email: job.data.email,
              fullName: job.data.fullName,
              token: job.data.token,
            });
            break;

          case EmailJobName.PASSWORD_RESET:
            await this.emailService.sendPasswordResetEmail({
              email: job.data.email,
              fullName: job.data.fullName,
              token: job.data.token,
            });
            break;

          default:
            throw new Error(`Unknown job name: ${job.name satisfies never}`);
        }
      },
      {
        connection: queueRedis,
        concurrency: 5,
      },
    );

    this.registerListeners();
  }

  private registerListeners() {
    this.worker.on("completed", (job) => {
      logger.info({ jobId: job.id, name: job.name }, "Email job completed");
    });

    this.worker.on("failed", (job, err) => {
      logger.error(
        { jobId: job?.id, name: job?.name, err },
        "Email job failed",
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
