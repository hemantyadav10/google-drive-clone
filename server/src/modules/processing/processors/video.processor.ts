import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import ffmpeg from "fluent-ffmpeg";
import { createWriteStream } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
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

const resolvedFfmpegPath = ffmpegPath as unknown as string;
const resolvedFfprobePath = ffprobeStatic.path as unknown as string;

ffmpeg.setFfmpegPath(resolvedFfmpegPath);
ffmpeg.setFfprobePath(resolvedFfprobePath);

const MAX_VIDEO_SIZE_FOR_PROCESSING = 500 * 1024 * 1024; // 500MB
const FFMPEG_TIMEOUT_MS = 15_000;

export class VideoProcessor {
  constructor(private readonly storageService: IStorageService) {}

  async process(node: Node): Promise<ProcessingResult> {
    if (!node.storageKey) throw new Error(`Node ${node.id} has no storageKey`);

    const result = await this.storageService.getObject({
      Bucket: env.S3_BUCKET_NAME,
      Key: node.storageKey,
    });
    if (!result.Body) throw new Error(`Object not found: ${node.storageKey}`);

    const bodyStream = result.Body as Readable;

    const contentLength = result.ContentLength;
    if (
      contentLength === undefined ||
      contentLength > MAX_VIDEO_SIZE_FOR_PROCESSING
    ) {
      // Deliberate skip, not a failure: no thumbnails, but still a valid result.
      bodyStream.destroy();
      return {};
    }

    const tmpDir = await mkdtemp(path.join(tmpdir(), "video-"));
    const tmpInputPath = path.join(tmpDir, "input");
    const framePath = path.join(tmpDir, "frame.jpg");

    try {
      await pipeline(bodyStream, createWriteStream(tmpInputPath));

      const metadata = await this.probeMetadata(tmpInputPath);
      const durationSeconds = metadata.format.duration;
      if (durationSeconds === undefined) {
        throw new Error(`Could not determine duration for node ${node.id}`);
      }

      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === "video",
      );
      const width = videoStream?.width ?? null;
      const height = videoStream?.height ?? null;
      if (!width || !height) throw new Error("Failed to read video metadata");

      const thumbnailTime = Math.min(1, durationSeconds * 0.1);
      await this.extractFrame(tmpInputPath, framePath, thumbnailTime);

      const rawFrameBuffer = await readFile(framePath);

      const [thumbnailSmallResult, thumbnailMediumResult] = await Promise.all([
        sharp(rawFrameBuffer)
          .resize(THUMBNAIL_SMALL.width, THUMBNAIL_SMALL.height, {
            fit: "cover",
            position: "centre",
            background: { r: 0, g: 0, b: 0, alpha: 1 },
          })
          .webp({ quality: THUMBNAIL_WEBP_QUALITY })
          .toBuffer({ resolveWithObject: true }),
        sharp(rawFrameBuffer)
          .resize(THUMBNAIL_MEDIUM.width, THUMBNAIL_MEDIUM.height, {
            fit: "contain",
            position: "centre",
            background: { r: 0, g: 0, b: 0, alpha: 1 },
          })
          .webp({ quality: THUMBNAIL_WEBP_QUALITY })
          .toBuffer({ resolveWithObject: true }),
      ]);

      return {
        durationSeconds: Math.floor(durationSeconds),
        width,
        height,
        thumbnailSmall: thumbnailSmallResult.data,
        thumbnailMedium: thumbnailMediumResult.data,
      };
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  }

  private probeMetadata(filePath: string): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata);
      });
    });
  }

  private extractFrame(
    inputPath: string,
    outputPath: string,
    seekSeconds: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        command.kill("SIGKILL");
        reject(
          new Error(
            `ffmpeg frame extraction timed out after ${FFMPEG_TIMEOUT_MS}ms`,
          ),
        );
      }, FFMPEG_TIMEOUT_MS);

      const command = ffmpeg(inputPath)
        .seekInput(seekSeconds)
        .outputOptions(["-frames:v", "1", "-vf", "scale=400:-2", "-q:v", "4"])
        .output(outputPath)
        .on("end", () => {
          clearTimeout(timeoutHandle);
          resolve();
        })
        .on("error", (err) => {
          clearTimeout(timeoutHandle);
          reject(err);
        });

      command.run();
    });
  }
}
