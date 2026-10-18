import { env } from "../../config/env.js";
import type { Node } from "../../db/schema.js";
import { BadRequestError, NotFoundError } from "../../utils/api-error.js";
import type { SseService } from "../events/sse.service.js";
import type { NodesService } from "../nodes/nodes.service.js";
import type { IStorageService } from "../storage/storage.interface.js";
import type { ProcessingResult } from "./processing.types.js";
import type { ImageProcessor } from "./processors/image.processor.js";
import type { PdfProcessor } from "./processors/pdf.processor.js";
import { VideoProcessor } from "./processors/video.processor.js";

export class ProcessingService {
  constructor(
    private readonly nodesService: NodesService,
    private readonly imageProcessor: ImageProcessor,
    private readonly pdfProcessor: PdfProcessor,
    private readonly videoProcessor: VideoProcessor,
    private readonly storageService: IStorageService,
    private readonly sseService: SseService,
  ) {}
  async processFile(data: { fileId: string; userId: string }): Promise<void> {
    const node = await this.nodesService.findNodeById(data.userId, data.fileId);

    if (!node) throw new NotFoundError("File not found");
    if (node.type !== "file") throw new BadRequestError("Node is not a file");

    const result = await this.runProcessor(node);
    const keys = await this.uploadResult(node.id, result);

    const updated = await this.nodesService.markProcessingComplete(node.id, {
      thumbnailSmallKey: keys["thumbnailSmallKey"] ?? null,
      thumbnailMediumKey: keys["thumbnailMediumKey"] ?? null,
      width: result.width ?? null,
      height: result.height ?? null,
      duration: result.durationSeconds ?? null,
      pageCount: result.pageCount ?? null,
    });

    this.sseService.emitToUser(data.userId, "node:processed", {
      nodeId: node.id,
      status: "complete",
      ...updated,
    });
  }

  private async runProcessor(node: Node): Promise<ProcessingResult> {
    if (node.mimeType?.startsWith("image/"))
      return this.imageProcessor.process(node);
    if (node.mimeType === "application/pdf")
      return this.pdfProcessor.process(node);
    if (node.mimeType?.startsWith("video/"))
      return this.videoProcessor.process(node);
    return {};
  }

  private async uploadResult(nodeId: string, result: ProcessingResult) {
    const uploads: Record<string, string> = {};
    if (result.thumbnailSmall) {
      const key = `thumbnails/${nodeId}/small.webp`;
      await this.storageService.uploadObject({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
        ContentType: "image/webp",
        Body: result.thumbnailSmall,
      });
      uploads["thumbnailSmallKey"] = key;
    }

    if (result.thumbnailMedium) {
      const key = `thumbnails/${nodeId}/medium.webp`;
      await this.storageService.uploadObject({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
        ContentType: "image/webp",
        Body: result.thumbnailMedium,
      });
      uploads["thumbnailMediumKey"] = key;
    }

    return uploads;
  }
}
