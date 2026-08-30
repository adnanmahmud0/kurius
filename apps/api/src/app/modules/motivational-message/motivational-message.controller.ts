import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { MotivationalMessageService } from "./motivational-message.service";

const createMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await MotivationalMessageService.createMessageToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Motivational message created successfully.",
    data: result
  });
});

const createBulkMessages = catchAsync(async (req: Request, res: Response) => {
  const result = await MotivationalMessageService.createBulkMessagesToDB(req.body.messages);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Motivational messages imported successfully.",
    data: result
  });
});

const getRandomMessage = catchAsync(async (_req: Request, res: Response) => {
  const result = await MotivationalMessageService.getRandomMessageFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Random motivational message retrieved successfully.",
    data: result
  });
});

const getAllMessages = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string,
    status: req.query.status as any
  };

  const paginationOptions = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20
  };

  const result = await MotivationalMessageService.getAllMessagesFromDB(filters, paginationOptions);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Motivational messages retrieved successfully.",
    pagination: result.meta,
    data: result.data
  });
});

const getMessageById = catchAsync(async (req: Request, res: Response) => {
  const result = await MotivationalMessageService.getMessageByIdFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Motivational message retrieved successfully.",
    data: result
  });
});

const updateMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await MotivationalMessageService.updateMessageInDB(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Motivational message updated successfully.",
    data: result
  });
});

const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await MotivationalMessageService.deleteMessageFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Motivational message deleted permanently.",
    data: result
  });
});

export const MotivationalMessageController = {
  createMessage,
  createBulkMessages,
  getRandomMessage,
  getAllMessages,
  getMessageById,
  updateMessage,
  deleteMessage
};
