import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { EmailService } from "./email.service";

const getEmailSetting = catchAsync(async (_req: Request, res: Response) => {
  const result = await EmailService.getEmailSettingFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Email settings retrieved successfully.",
    data: result
  });
});

const updateEmailSetting = catchAsync(async (req: Request, res: Response) => {
  const result = await EmailService.updateEmailSettingInDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Email settings updated successfully.",
    data: result
  });
});

const testEmailConnection = catchAsync(async (req: Request, res: Response) => {
  const result = await EmailService.testEmailSettingInDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result
  });
});

export const EmailController = {
  getEmailSetting,
  updateEmailSetting,
  testEmailConnection
};
