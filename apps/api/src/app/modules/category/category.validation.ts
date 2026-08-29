import { z } from "zod";

const createCategoryZodSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Category name is required" })
      .min(2, "Category name must be at least 2 characters"),
    thumbnail: z.string().optional().nullable()
  })
});

const updateCategoryZodSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name must be at least 2 characters").optional(),
    thumbnail: z.string().optional().nullable(),
    status: z.enum(["active", "delete"]).optional()
  })
});

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema
};
