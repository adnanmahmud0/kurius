/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../../shared/catchAsync";
import { getSingleFilePath } from "../../../shared/getFilePath";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsersToDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Users retrieved successfully",
    pagination: result.meta,
    data: result.result
  });
});

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { ...userData } = req.body;
  const result = await UserService.createUserToDB(userData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User created successfully",
    data: result
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Profile data retrieved successfully",
    data: result
  });
});

//update profile
const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  let bodyData = req.body;

  if (typeof req.body.data === "string") {
    try {
      bodyData = JSON.parse(req.body.data);
    } catch {
      bodyData = req.body;
    }
  }

  // Check for uploaded image file
  let imageFile: Express.Multer.File | undefined;
  if (req.files) {
    const files = req.files as Record<string, Express.Multer.File[]>;
    if (files.image && files.image[0]) {
      imageFile = files.image[0];
    } else if (files.avatar && files.avatar[0]) {
      imageFile = files.avatar[0];
    } else if (files.file && files.file[0]) {
      imageFile = files.file[0];
    }
  } else if (req.file) {
    imageFile = req.file;
  }

  let imageUrl: string | undefined;
  if (imageFile) {
    const { StorageAdapter } = await import("../../../helpers/storageAdapter");
    const uploadResult = await StorageAdapter.uploadFile(imageFile, "users");
    imageUrl = uploadResult.url;
  }

  const payload: Record<string, any> = {
    ...bodyData
  };

  if (imageUrl) {
    payload.image = imageUrl;
    payload.avatar = imageUrl;
  }

  const result = await UserService.updateProfileToDB(user, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Profile updated successfully",
    data: result
  });
});

const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  await UserService.deleteAccountFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User deleted successfully"
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserByIdFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User detail retrieved successfully",
    data: result
  });
});

const deleteUserByAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteUserByAdminFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result
  });
});

const toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.toggleUserStatusByAdminFromDB(req.params.id, req.body?.status);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result
  });
});

export const UserController = {
  getAllUsers,
  getUserById,
  createUser,
  getUserProfile,
  updateProfile,
  deleteAccount,
  deleteUserByAdmin,
  toggleUserStatus
};
