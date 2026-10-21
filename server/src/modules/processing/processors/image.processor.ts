import { UnrecoverableError } from "bullmq";
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

const MAX_IMAGE_BYTES = 100 * 1024 * 1024;
const MAX_INPUT_PIXELS = 50_000_000;

export class ImageProcessor {
  constructor(private readonly storageService: IStorageService) {}

  async process(node: Node): Promise<ProcessingResult> {
    if (!node.storageKey) {
      throw new UnrecoverableError(`Node ${node.id} has no storageKey`);
    }

    const result = await this.storageService.getObject({
      Bucket: env.S3_BUCKET_NAME,
      Key: node.storageKey,
    });
    if (!result.Body) throw new Error(`Object not found: ${node.storageKey}`);

    const body = result.Body as NodeJS.ReadableStream &
      AsyncIterable<Uint8Array | string> & { destroy?: () => void };
    const size = result.ContentLength;

    if (!size || size > MAX_IMAGE_BYTES) {
      body.destroy?.();
      throw new UnrecoverableError(
        `Image ${node.id} is empty, too large, or has unknown size (ContentLength: ${size})`,
      );
    }

    // One preallocated buffer, one copy of the file.
    const input = Buffer.allocUnsafe(size);
    let offset = 0;
    try {
      for await (const chunk of body) {
        const bytes = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
        if (offset + bytes.byteLength > size) {
          throw new Error(`Image ${node.id} exceeded its declared size`);
        }
        input.set(bytes, offset);
        offset += bytes.byteLength;
      }
    } catch (error) {
      body.destroy?.();
      throw error;
    }
    if (offset !== size)
      throw new Error(`Image ${node.id} download was truncated`);

    try {
      const opts = { limitInputPixels: MAX_INPUT_PIXELS };

      const { width, height } = await sharp(input, opts).metadata();
      if (!width || !height) {
        throw new Error("Failed to read image metadata");
      }

      const thumbnailSmall = await sharp(input, opts)
        .resize(THUMBNAIL_SMALL.width, THUMBNAIL_SMALL.height, {
          fit: "cover",
          position: "centre",
          withoutEnlargement: true,
        })
        .webp({ quality: THUMBNAIL_WEBP_QUALITY })
        .toBuffer();

      const thumbnailMedium = await sharp(input, opts)
        .resize(THUMBNAIL_MEDIUM.width, THUMBNAIL_MEDIUM.height, {
          fit: "contain",
          position: "centre",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
          withoutEnlargement: true,
        })
        .webp({ quality: THUMBNAIL_WEBP_QUALITY })
        .toBuffer();

      return { width, height, thumbnailSmall, thumbnailMedium };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new UnrecoverableError(
        `Image ${node.id} could not be processed: ${reason}`,
      );
    }
  }
}
