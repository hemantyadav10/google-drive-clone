import type { Node } from "../../db/schema.js";
import type { NodeWithThumbnail } from "./nodes.types.js";

export function toNodeResponseWithThumbnail(node: NodeWithThumbnail) {
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    parentId: node.parentId,
    folderColor: node.folderColor,
    mimeType: node.mimeType,
    sizeBytes: node.sizeBytes,
    contentModifiedAt: node.contentModifiedAt,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    processingStatus: node.processingStatus,
    thumbnailSmallUrl: node.thumbnailSmallUrl,
  };
}

export function toNodeResponse(node: Node) {
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    parentId: node.parentId,
    folderColor: node.folderColor,
    mimeType: node.mimeType,
    sizeBytes: node.sizeBytes,
    contentModifiedAt: node.contentModifiedAt,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    processingStatus: node.processingStatus,
  };
}

export function toNodeSummaryResponse(node: Node) {
  return {
    id: node.id,
    name: node.name,
    folderColor: node.folderColor,
  };
}
