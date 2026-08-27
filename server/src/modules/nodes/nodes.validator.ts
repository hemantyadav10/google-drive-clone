import * as z from "zod";

export const createFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(255, "Folder name is too long")
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

export type CreateFolderDto = z.infer<typeof createFolderSchema>;
export type GetNodesQuery = z.infer<typeof getNodesQuerySchema>;
