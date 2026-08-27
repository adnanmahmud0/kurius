import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { LegalService } from "./legal.service";

const getLegalPolicy = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.params;
  const result = await LegalService.getLegalPolicy(type as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${type === "terms" ? "Terms of Service" : "Privacy Policy"} fetched successfully`,
    data: result
  });
});

const updateLegalPolicy = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.params;
  const result = await LegalService.updateLegalPolicy(type as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${type === "terms" ? "Terms of Service" : "Privacy Policy"} updated successfully`,
    data: result
  });
});

export const LegalController = {
  getLegalPolicy,
  updateLegalPolicy
};
