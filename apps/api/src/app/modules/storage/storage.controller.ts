import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StorageService } from "./storage.service";

const getStorageSetting = catchAsync(async (_req: Request, res: Response) => {
  const result = await StorageService.getStorageSettingFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Storage settings retrieved successfully.",
    data: result
  });
});

const updateStorageSetting = catchAsync(async (req: Request, res: Response) => {
  const result = await StorageService.updateStorageSettingInDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Storage settings updated successfully.",
    data: result
  });
});

const testStorageConnection = catchAsync(async (req: Request, res: Response) => {
  const result = await StorageService.testStorageConnectionInDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result
  });
});

export const StorageController = {
  getStorageSetting,
  updateStorageSetting,
  testStorageConnection
};
