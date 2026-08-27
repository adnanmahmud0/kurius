import express from "express";

import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";

const router = express.Router();

// Public endpoints
router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);

// Admin endpoints
router.get(
  "/admin/all",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  CategoryController.getAdminCategories
);

router.post(
  "/admin",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(CategoryValidation.createCategoryZodSchema),
  CategoryController.createCategory
);

router
  .route("/admin/:id")
  .put(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(CategoryValidation.updateCategoryZodSchema),
    CategoryController.updateCategory
  )
  .delete(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), CategoryController.deleteCategory);

export const CategoryRoutes = router;
