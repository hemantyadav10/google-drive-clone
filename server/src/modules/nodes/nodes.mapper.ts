import type { Node } from "../../db/schema.js";

function toFolderResponse(node: Node) {
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    description: node.description,
    parentId: node.parentId,
    path: node.path,
    folderColor: node.folderColor,
    isTrashed: node.isTrashed,
    trashedAt: node.trashedAt,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
  };
}

function toFileResponse(node: Node) {
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    description: node.description,
    parentId: node.parentId,
    path: node.path,
    mimeType: node.mimeType,
    sizeBytes: node.sizeBytes,
    fileThumbnailUrl: node.fileThumbnailUrl,
    contentModifiedAt: node.contentModifiedAt,
    width: node.width,
    height: node.height,
    duration: node.duration,
    isTrashed: node.isTrashed,
    trashedAt: node.trashedAt,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
  };
}

export function toNodeResponse(node: Node) {
  return node.type === "folder" ? toFolderResponse(node) : toFileResponse(node);
}
