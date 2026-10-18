import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/http-status-codes.js";
import type {
  RequestWithBody,
  RequestWithParams,
} from "../../types/request.types.js";
import { ApiResponse } from "../../utils/api-response.js";
import { getValidatedQuery } from "../../utils/request.js";
import { requireUser } from "../../utils/require-user.js";
import {
  toNodeResponse,
  toNodeResponseWithThumbnail,
  toNodeSummaryResponse,
} from "./nodes.mapper.js";
import type { NodesService } from "./nodes.service.js";
import type {
  CreateFolderDto,
  GetNodeChildrenParams,
  GetNodeChildrenQuery,
  GetNodeDetailsParams,
} from "./nodes.validator.js";

export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  createFolder = async (
    req: RequestWithBody<CreateFolderDto>,
    res: Response,
  ): Promise<void> => {
    const { id: userId } = requireUser(req);
    const newFolder = await this.nodesService.createFolder(userId, req.body);
    res
      .status(HttpStatus.CREATED)
      .json(
        ApiResponse.created(
          toNodeResponse(newFolder),
          "Folder created successfully",
        ),
      );
  };

  getNodeDetails = async (
    req: RequestWithParams<GetNodeDetailsParams>,
    res: Response,
  ): Promise<void> => {
    const { id: userId } = requireUser(req);
    const { nodeId } = req.params;
    const node = await this.nodesService.getNodeDetails(userId, nodeId);
    res
      .status(HttpStatus.OK)
      .json(ApiResponse.ok(node, "Node details retrieved successfully"));
  };

  getNodeChildren = async (
    req: RequestWithParams<GetNodeChildrenParams>,
    res: Response,
  ): Promise<void> => {
    const { id: userId } = requireUser(req);
    const { nodeId } = req.params;
    const { isAscending, limit, sortField, cursor, type } =
      getValidatedQuery<GetNodeChildrenQuery>(res);
    await this.respondWithChildren({
      userId,
      nodeId,
      res,
      limit,
      cursor,
      type,
      sortField,
      isAscending,
    });
  };

  getRootChildren = async (req: Request, res: Response): Promise<void> => {
    const { id: userId } = requireUser(req);
    const { isAscending, limit, sortField, cursor, type } =
      getValidatedQuery<GetNodeChildrenQuery>(res);
    await this.respondWithChildren({
      userId,
      res,
      limit,
      cursor,
      type,
      isAscending,
      sortField,
    });
  };

  private respondWithChildren = async ({
    userId,
    res,
    nodeId,
    limit,
    cursor,
    type,
    isAscending,
    sortField,
  }: {
    userId: string;
    nodeId?: string;
    res: Response;
  } & GetNodeChildrenQuery): Promise<void> => {
    const { currentFolder, ancestors, children, hasMore, nextCursor } =
      await this.nodesService.getNodeChildren(userId, {
        nodeId,
        limit,
        cursor,
        type,
        isAscending,
        sortField,
      });
    res.status(HttpStatus.OK).json(
      ApiResponse.ok(
        {
          currentFolder: currentFolder && toNodeSummaryResponse(currentFolder),
          ancestors,
          children: children.map(toNodeResponseWithThumbnail),
          hasMore,
          nextCursor,
        },
        "Folder contents retrieved successfully",
      ),
    );
  };
}
