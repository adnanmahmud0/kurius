import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { VideoService } from "./video.service";

const getAllVideos = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload | undefined;
  const result = await VideoService.getAllVideosFromDB(req.query, user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Videos retrieved successfully.",
    meta: result.meta,
    data: result.data
  });
});

const getVideoById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload | undefined;
  const result = await VideoService.getVideoByIdFromDB(req.params.id, user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Video retrieved successfully.",
    data: result
  });
});

const getVideosByCategory = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload | undefined;
  const result = await VideoService.getAllVideosFromDB(
    { ...req.query, categoryId: req.params.categoryId },
    user?.id
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Category videos retrieved successfully.",
    meta: result.meta,
    data: result.data
  });
});

const getAdminVideos = catchAsync(async (req: Request, res: Response) => {
  const result = await VideoService.getAdminVideosFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Admin videos retrieved successfully.",
    meta: result.meta,
    data: result.data
  });
});

const createVideo = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  // Body data may be in req.body or if multipart req.body.data JSON
  let bodyData = req.body;
  if (req.body?.data) {
    try {
      bodyData = JSON.parse(req.body.data);
    } catch {
      // keep req.body
    }
  }

  const result = await VideoService.createVideoToDB(bodyData, files, user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Video created and uploaded successfully.",
    data: result
  });
});

const updateVideo = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  let bodyData = req.body;
  if (req.body?.data) {
    try {
      bodyData = JSON.parse(req.body.data);
    } catch {
      // keep req.body
    }
  }

  const result = await VideoService.updateVideoInDB(req.params.id, bodyData, files);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Video updated successfully.",
    data: result
  });
});

const deleteVideo = catchAsync(async (req: Request, res: Response) => {
  const result = await VideoService.deleteVideoInDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Video deactivated successfully.",
    data: result
  });
});

export const VideoController = {
  getAllVideos,
  getVideoById,
  getVideosByCategory,
  getAdminVideos,
  createVideo,
  updateVideo,
  deleteVideo
};
