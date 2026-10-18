import * as z from "zod";
import { MAX_NAME_LENGTH } from "../../constants/node.js";

export const createFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(MAX_NAME_LENGTH, "Folder name is too long")
    .refine(
      (name) => !/[/\\:*?"<>|]/.test(name),
      'Folder name cannot contain: / \\ : * ? " < > |',
    ),
  description: z.string().max(1000).optional(),
  parentId: z.uuid().nullable(),
  folderColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .optional(),
});

export const getNodesQuerySchema = z.object({
  parentId: z.uuid({ version: "v7" }).optional(),
});

export const getNodeDetailsParamsSchema = z.object({
  nodeId: z.uuidv7("Invalid Node Id"),
});

export const getNodeChildrenParamsSchema = z.object({
  nodeId: z.uuidv7("Invalid Node Id"),
});

export const getNodeChildrenQuerySchema = z.object({
  sortField: z.enum(["name", "size", "createdAt"]).default("name"),
  isAscending: z
    .string()
    .toLowerCase()
    .transform((v) => {
      return v === "true";
    })
    .pipe(z.boolean())
    .default(false),
  type: z.enum(["folder", "file"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

const baseCursor = {
  type: z.enum(["folder", "file"]),
  id: z.uuidv7("Invalid id"),
};

export const cursorSchema = z.discriminatedUnion("sort", [
  z.object({
    ...baseCursor,
    sort: z.literal("name"),
    value: z.string().max(MAX_NAME_LENGTH),
  }),
  z.object({
    ...baseCursor,
    sort: z.literal("sizeBytes"),
    value: z
      .string()
      .regex(/^\d{1,16}$/)
      .refine((v) => Number.isSafeInteger(Number(v)), "out of range"),
  }),
  z.object({
    ...baseCursor,
    sort: z.literal("createdAt"),
    value: z.iso.datetime(),
  }),
]);

export type CreateFolderDto = z.infer<typeof createFolderSchema>;
export type GetNodesQuery = z.infer<typeof getNodesQuerySchema>;
export type GetNodeDetailsParams = z.infer<typeof getNodeDetailsParamsSchema>;
export type GetNodeChildrenParams = z.infer<typeof getNodeChildrenParamsSchema>;
export type GetNodeChildrenQuery = z.infer<typeof getNodeChildrenQuerySchema>;
export type Cursor = z.infer<typeof cursorSchema>;
