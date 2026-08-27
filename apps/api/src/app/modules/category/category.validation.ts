import { z } from "zod";

const createCategoryZodSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Category name is required" })
      .min(2, "Category name must be at least 2 characters")
  })
});

const updateCategoryZodSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name must be at least 2 characters").optional(),
    status: z.enum(["active", "delete"]).optional()
  })
});

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema
};
