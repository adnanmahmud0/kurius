import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CategoryService } from "./category.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategoryToDB(req.body.name);

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
  const result = await CategoryService.updateCategoryInDB(req.params.id, req.body);

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
    message: "Category deactivated successfully.",
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
