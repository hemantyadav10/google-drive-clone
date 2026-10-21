import { PDFiumLibrary } from "@hyzyla/pdfium";
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

const MAX_PDF_BYTES = 100 * 1024 * 1024;
const MAX_RENDERED_PIXELS = 8_000_000;
const RENDER_SAFETY_FACTOR = 0.99;

export class PdfProcessor {
  constructor(private readonly storageService: IStorageService) {}

  async process(node: Node): Promise<ProcessingResult> {
    if (!node.storageKey)
      throw new UnrecoverableError(`Node ${node.id} has no storageKey`);

    const result = await this.storageService.getObject({
      Bucket: env.S3_BUCKET_NAME,
      Key: node.storageKey,
    });
    if (!result.Body)
      throw new Error(`Object has no response body: ${node.storageKey}`);

    const body = result.Body as NodeJS.ReadableStream &
      AsyncIterable<Uint8Array | string> & {
        destroy?: (error?: Error) => void;
      };

    const size = result.ContentLength;

    if (
      typeof size !== "number" ||
      !Number.isSafeInteger(size) ||
      size <= 0 ||
      size > MAX_PDF_BYTES
    ) {
      body.destroy?.();
      throw new UnrecoverableError(
        `PDF ${node.id} has an invalid or unsupported size (ContentLength: ${size})`,
      );
    }

    const pdf = Buffer.allocUnsafe(size);
    let offset = 0;

    try {
      for await (const chunk of body) {
        const bytes = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
        if (offset + bytes.byteLength > size) {
          throw new Error(
            `PDF ${node.id} exceeded its declared content length`,
          );
        }
        pdf.set(bytes, offset);
        offset += bytes.byteLength;
      }
    } catch (error) {
      body.destroy?.();
      throw error;
    }

    if (offset !== size)
      throw new Error(
        `PDF ${node.id} download was truncated (expected ${size}, received ${offset})`,
      );

    const library = await PDFiumLibrary.init();

    try {
      let document: Awaited<ReturnType<typeof library.loadDocument>>;
      try {
        document = await library.loadDocument(pdf);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new UnrecoverableError(
          `PDF ${node.id} could not be loaded (corrupt, unsupported or password-protected): ${reason}`,
        );
      }

      try {
        const pageCount = document.getPageCount();
        if (pageCount < 1) {
          throw new UnrecoverableError(`PDF ${node.id} has no pages`);
        }

        let pixels: Buffer | undefined;
        let width = 0;
        let height = 0;

        // First page only.
        for (const page of document.pages()) {
          try {
            const { originalWidth, originalHeight } = page.getOriginalSize();

            if (
              !Number.isFinite(originalWidth) ||
              !Number.isFinite(originalHeight) ||
              originalWidth <= 0 ||
              originalHeight <= 0
            ) {
              throw new UnrecoverableError(
                `PDF ${node.id} has invalid page dimensions`,
              );
            }

            // Clamp BEFORE rendering so a huge page can't allocate a giant
            // bitmap first. Never upscale.
            const area = originalWidth * originalHeight;
            const scale =
              area > MAX_RENDERED_PIXELS
                ? Math.sqrt(MAX_RENDERED_PIXELS / area) * RENDER_SAFETY_FACTOR
                : 1;

            const rendered = await page.render({
              scale,
              render: async ({ data }) => Buffer.from(data),
            });

            pixels = Buffer.from(rendered.data);
            width = rendered.width;
            height = rendered.height;
          } finally {
            page.close();
          }
          break;
        }

        if (!pixels)
          throw new UnrecoverableError(`PDF ${node.id} has no renderable page`);

        if (
          width <= 0 ||
          height <= 0 ||
          width * height > MAX_RENDERED_PIXELS ||
          pixels.byteLength !== width * height * 4
        ) {
          throw new UnrecoverableError(
            `PDF ${node.id} produced an invalid bitmap (${width}x${height}, ${pixels.byteLength} bytes)`,
          );
        }

        const raw = { width, height, channels: 4 as const };

        const small = await sharp(pixels, { raw })
          .resize(THUMBNAIL_SMALL.width, THUMBNAIL_SMALL.height, {
            fit: "cover",
            position: "centre",
          })
          .webp({ quality: THUMBNAIL_WEBP_QUALITY })
          .toBuffer();

        const medium = await sharp(pixels, { raw })
          .resize(THUMBNAIL_MEDIUM.width, THUMBNAIL_MEDIUM.height, {
            fit: "contain",
            position: "centre",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .webp({ quality: THUMBNAIL_WEBP_QUALITY })
          .toBuffer();

        return {
          width,
          height,
          thumbnailSmall: small,
          thumbnailMedium: medium,
          pageCount,
        };
      } finally {
        document.destroy();
      }
    } finally {
      library.destroy();
    }
  }
}
