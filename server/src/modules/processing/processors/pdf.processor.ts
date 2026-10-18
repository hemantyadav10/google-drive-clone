import { createWriteStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { pdf } from "pdf-to-img";
import sharp from "sharp";
import { env } from "../../../config/env.js";
import type { Node } from "../../../db/schema.js";
import type { IStorageService } from "../../storage/storage.interface.js";
import {
  THUMBNAIL_MEDIUM,
  THUMBNAIL_SMALL,
  THUMBNAIL_WEBP_QUALITY,
} from "../processing.constants.js";
import type { ProcessingResult } from "../processing.types.js";

const MAX_PDF_SIZE_FOR_THUMBNAIL = 100 * 1024 * 1024; // 100MB

export class PdfProcessor {
  constructor(private readonly storageService: IStorageService) {}

  async process(node: Node): Promise<ProcessingResult> {
    if (!node.storageKey) throw new Error(`Node ${node.id} has no storageKey`);

    const result = await this.storageService.getObject({
      Bucket: env.S3_BUCKET_NAME,
      Key: node.storageKey,
    });
    if (!result.Body) throw new Error(`Object not found: ${node.storageKey}`);

    const bodyStream = result.Body as NodeJS.ReadableStream;

    const contentLength = result.ContentLength;
    if (
      contentLength === undefined ||
      contentLength > MAX_PDF_SIZE_FOR_THUMBNAIL
    ) {
      (
        bodyStream as NodeJS.ReadableStream & { destroy?: () => void }
      ).destroy?.();
      throw new Error(
        `PDF ${node.id} is too large or has unknown size for thumbnail generation (ContentLength: ${contentLength})`,
      );
    }

    const tmpDir = await mkdtemp(path.join(tmpdir(), "pdf-"));
    const tmpPath = path.join(tmpDir, "input.pdf");

    try {
      await pipeline(bodyStream, createWriteStream(tmpPath));

      const document = await pdf(tmpPath, { scale: 1, format: "jpg" });
      const pageCount = document.length;

      let firstPageBuffer: Buffer;
      try {
        firstPageBuffer = await document.getPage(1);
      } finally {
        document.destroy();
      }

      // Read the rendered page's own dimensions once, from the same decoded
      // source both thumbnail pipelines will branch from — avoids decoding
      // the JPEG a third time just to ask sharp for its metadata.
      const pageMetadata = await sharp(firstPageBuffer).metadata();

      const [thumbnailSmallResult, thumbnailMediumResult] = await Promise.all([
        sharp(firstPageBuffer)
          .resize(THUMBNAIL_SMALL.width, THUMBNAIL_SMALL.height, {
            fit: "cover",
            position: "centre",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .webp({ quality: THUMBNAIL_WEBP_QUALITY })
          .toBuffer({ resolveWithObject: true }),
        sharp(firstPageBuffer)
          .resize(THUMBNAIL_MEDIUM.width, THUMBNAIL_MEDIUM.height, {
            fit: "contain",
            position: "centre",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .webp({ quality: THUMBNAIL_WEBP_QUALITY })
          .toBuffer({ resolveWithObject: true }),
      ]);

      return {
        width: pageMetadata.width,
        height: pageMetadata.height,
        thumbnailSmall: thumbnailSmallResult.data,
        thumbnailMedium: thumbnailMediumResult.data,
        pageCount,
      };
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  }
}
