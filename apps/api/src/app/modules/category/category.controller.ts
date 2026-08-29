import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { StorageAdapter } from "../../../helpers/storageAdapter";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CategoryService } from "./category.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  let thumbnail = req.body.thumbnail || null;
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const singleFile = (req as any).file || files?.image?.[0] || files?.thumbnail?.[0];

  if (singleFile) {
    const uploadResult = await StorageAdapter.uploadFile(singleFile, "categories");
    thumbnail = uploadResult.url;
  }

  const result = await CategoryService.createCategoryToDB({
    name: req.body.name,
    thumbnail
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Category created successfully.",
    data: result
  });
});

const getAllCategories = catchAsync(async (_req: Request, res: Response) => {
  const result = await CategoryService.getAllCategoriesFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Categories retrieved successfully.",
    data: result
  });
});

const getAdminCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getAdminCategoriesFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Admin categories retrieved successfully.",
    meta: result.meta,
    data: result.data
  });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategoryByIdFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Category retrieved successfully.",
    data: result
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  let thumbnail = req.body.thumbnail;
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const singleFile = (req as any).file || files?.image?.[0] || files?.thumbnail?.[0];

  if (singleFile) {
    const uploadResult = await StorageAdapter.uploadFile(singleFile, "categories");
    thumbnail = uploadResult.url;
  }

  const result = await CategoryService.updateCategoryInDB(req.params.id, {
    ...req.body,
    ...(thumbnail !== undefined ? { thumbnail } : {})
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Category updated successfully.",
    data: result
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.deleteCategoryFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Category deleted permanently.",
    data: result
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  getAdminCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
