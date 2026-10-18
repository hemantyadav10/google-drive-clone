export type InitUploadResponse =
  | {
      uploadType: "single";
      sessionId: string;
      uploadUrl: string;
      expiresIn: number;
    }
  | {
      uploadType: "multipart";
      sessionId: string;
      uploadId: string;
      partSize: number;
      totalParts: number;
      expiresIn: number;
    };

export type GetPartsUploadUrlResponse = { partNumber: number; url: string }[];
