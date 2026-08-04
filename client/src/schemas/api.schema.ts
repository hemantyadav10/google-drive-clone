import * as z from "zod";

export const ApiResponseSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: schema,
  });
