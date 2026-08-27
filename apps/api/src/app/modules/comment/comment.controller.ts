import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CommentService } from "./comment.service";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const videoId = req.params.videoId || req.params.id;
  const result = await CommentService.createCommentToDB(user.id, videoId, req.body.commentText);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Comment posted successfully.",
    data: result
  });
});

const getVideoComments = catchAsync(async (req: Request, res: Response) => {
  const videoId = req.params.videoId || req.params.id;
  const result = await CommentService.getVideoCommentsFromDB(videoId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Comments retrieved successfully.",
    meta: result.meta,
    data: result.data
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await CommentService.deleteCommentFromDB(req.params.id, user.id, user.role);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Comment deleted successfully.",
    data: result
  });
});

export const CommentController = {
  createComment,
  getVideoComments,
  deleteComment
};
