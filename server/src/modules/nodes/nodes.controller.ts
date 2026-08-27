import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/http-status-codes.js";
import type { RequestWithBody } from "../../types/request.types.js";
import { ApiResponse } from "../../utils/api-response.js";
import { getValidatedQuery } from "../../utils/request.js";
import { requireUser } from "../../utils/require-user.js";
import { toNodeResponse } from "./nodes.mapper.js";
import type { NodesService } from "./nodes.service.js";
import type { CreateFolderDto, GetNodesQuery } from "./nodes.validator.js";

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

  getNodes = async (req: Request, res: Response): Promise<void> => {
    const { id: userId } = requireUser(req);
    const { parentId } = getValidatedQuery<GetNodesQuery>(res);
    const nodes = await this.nodesService.getNodes(userId, parentId ?? null);
    res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.ok(
          nodes.map(toNodeResponse),
          "Nodes retrieved successfully",
        ),
      );
  };
}
