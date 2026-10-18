import type { CreateNodeData, Node, NodeType } from "../../db/schema.js";
import type { GetNodeChildrenQuery } from "./nodes.validator.js";

export type CreateNewFolderData = Pick<
  CreateNodeData,
  | "name"
  | "parentId"
  | "createdBy"
  | "description"
  | "folderColor"
  | "path"
  | "type"
  | "processingStatus"
> & { id: string };

export type CreateFileNodeRecord = {
  id: string;
  type: "file";
  name: string;
  parentId: string | null;
  path: string;
  createdBy: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  sha256Checksum?: string;
  contentModifiedAt: Date;
};

export type CreateFileData = {
  name: string;
  parentId: string | null;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  sha256Checksum?: string;
  contentModifiedAt: Date;
};

export type Ancestor = Pick<Node, "id" | "name" | "folderColor">;

export interface NodeWithThumbnail extends Node {
  thumbnailSmallUrl: string | null;
}

export interface NodeChildren {
  currentFolder: Node | null;
  ancestors: Ancestor[];
  children: NodeWithThumbnail[];
  hasMore: boolean;
  nextCursor: string | null;
}

export type UpdateProcessingResultData = Pick<
  Node,
  | "thumbnailSmallKey"
  | "thumbnailMediumKey"
  | "width"
  | "height"
  | "duration"
  | "pageCount"
>;

export type DbSortFields = Pick<Node, "name" | "sizeBytes" | "createdAt">;
export type DbSortField = keyof DbSortFields;

export type Cursor = {
  type: NodeType;
  value: string | number;
  id: string;
  sort: DbSortField;
};

export type FindNodesParams = {
  userId: string;
  parentId: string | null;
  limit: number;
  cursor?: Cursor | undefined;
  type?: NodeType | undefined;
  isAscending: boolean;
  sortField: DbSortField;
};

export type ClientSortField = GetNodeChildrenQuery["sortField"];

export type NodeChildrenParams = {
  nodeId?: string | undefined;
  limit: number;
  cursor?: string | undefined;
  type?: NodeType | undefined;
  isAscending: boolean;
  sortField: ClientSortField;
};

export const SORT_FIELDS_MAPPER = {
  createdAt: "createdAt",
  name: "name",
  size: "sizeBytes",
} satisfies Record<ClientSortField, DbSortField>;
