import { PassThrough } from "node:stream";
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

export class ImageProcessor {
  constructor(private readonly storageService: IStorageService) {}

  async process(node: Node): Promise<ProcessingResult> {
    if (!node.storageKey) throw new Error(`Node ${node.id} has no storageKey`);

    const result = await this.storageService.getObject({
      Bucket: env.S3_BUCKET_NAME,
      Key: node.storageKey,
    });
    if (!result.Body) throw new Error(`Object not found: ${node.storageKey}`);

    const bodyStream = result.Body as NodeJS.ReadableStream;

    const metaStream = new PassThrough();
    const thumbStream = new PassThrough();
    const thumbMediumStream = new PassThrough();
    bodyStream.pipe(metaStream);
    bodyStream.pipe(thumbStream);
    bodyStream.pipe(thumbMediumStream);

    const metaPipeline = sharp({ limitInputPixels: 268402689 });
    metaStream.pipe(metaPipeline);

    const thumbPipeline = sharp({ limitInputPixels: 268402689 })
      .resize(THUMBNAIL_SMALL.width, THUMBNAIL_SMALL.height, {
        fit: "cover",
        position: "centre",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        withoutEnlargement: true,
      })
      .webp({ quality: THUMBNAIL_WEBP_QUALITY });
    thumbStream.pipe(thumbPipeline);

    const thumbMediumPipeline = sharp({ limitInputPixels: 268402689 })
      .resize(THUMBNAIL_MEDIUM.width, THUMBNAIL_MEDIUM.height, {
        fit: "contain",
        position: "centre",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        withoutEnlargement: true,
      })
      .webp({ quality: THUMBNAIL_WEBP_QUALITY });
    thumbMediumStream.pipe(thumbMediumPipeline);

    const [metadata, thumbnailResult, thumbnailMediumResult] =
      await Promise.all([
        metaPipeline.metadata(),
        thumbPipeline.toBuffer({ resolveWithObject: true }),
        thumbMediumPipeline.toBuffer({ resolveWithObject: true }),
      ]);

    if (!metadata.width || !metadata.height)
      throw new Error("Failed to read image metadata");

    return {
      width: metadata.width,
      height: metadata.height,
      thumbnailSmall: thumbnailResult.data,
      thumbnailMedium: thumbnailMediumResult.data,
    };
  }
}
