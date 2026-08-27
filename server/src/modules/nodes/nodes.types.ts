import type { CreateNodeData } from "../../db/schema.js";

export type CreateNewFolderData = Pick<
  CreateNodeData,
  | "name"
  | "parentId"
  | "createdBy"
  | "description"
  | "folderColor"
  | "path"
  | "type"
> & { id: string };
