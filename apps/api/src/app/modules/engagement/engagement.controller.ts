import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { EngagementService } from "./engagement.service";

const recordView = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await EngagementService.recordViewToDB(user.id, req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result
  });
});

const likeVideo = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await EngagementService.likeVideoInDB(user.id, req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result
  });
});

const unlikeVideo = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await EngagementService.unlikeVideoInDB(user.id, req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result
  });
});

export const EngagementController = {
  recordView,
  likeVideo,
  unlikeVideo
};
