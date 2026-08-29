import { z } from "zod";

import {
  bearerAuth,
  createErrorResponseSchema,
  createSuccessResponseSchema,
  registry
} from "../../../docs/openapi-registry";
import { CategoryValidation } from "./category.validation";

// Request Schemas
export const CreateCategoryRequestSchema =
  CategoryValidation.createCategoryZodSchema.shape.body.openapi({
    description: "Create category payload",
    example: {
      name: "Technology"
    }
  });

export const UpdateCategoryRequestSchema =
  CategoryValidation.updateCategoryZodSchema.shape.body.openapi({
    description: "Update category payload",
    example: {
      name: "Tech & Innovation",
      status: "active"
    }
  });

// Response Schemas
export const CategoryResponseDataSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    thumbnail: z.string().nullable().optional(),
    status: z.string(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
    _count: z
      .object({
        videos: z.number()
      })
      .optional()
  })
  .openapi("CategoryResponseData");

// 1. GET /categories (Public)
registry.registerPath({
  method: "get",
  path: "/categories",
  summary: "Get Active Categories",
  description: "Retrieves all public active video categories with video counts.",
  tags: ["Categories"],
  responses: {
    200: {
      description: "Categories retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(z.array(CategoryResponseDataSchema))
        }
      }
    }
  }
});

// 2. GET /categories/:id (Public)
registry.registerPath({
  method: "get",
  path: "/categories/{id}",
  summary: "Get Category By ID or Slug",
  description: "Retrieves a single category by its ID or slug.",
  tags: ["Categories"],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Category ID or Slug" })
    })
  },
  responses: {
    200: {
      description: "Category retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(CategoryResponseDataSchema)
        }
      }
    },
    404: {
      description: "Category not found",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});

// 3. POST /categories/admin (Admin)
registry.registerPath({
  method: "post",
  path: "/categories/admin",
  summary: "Create Category (Admin)",
  description: "Creates a new video category (Admin only).",
  tags: ["Categories (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCategoryRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: "Category created successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(CategoryResponseDataSchema)
        }
      }
    },
    400: {
      description: "Validation error or category name already exists",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});

// 4. PUT /categories/admin/:id (Admin)
registry.registerPath({
  method: "put",
  path: "/categories/admin/{id}",
  summary: "Update Category (Admin)",
  description: "Updates an existing category name or status (Admin only).",
  tags: ["Categories (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Category ID" })
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateCategoryRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Category updated successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(CategoryResponseDataSchema)
        }
      }
    },
    404: {
      description: "Category not found",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});

// 5. DELETE /categories/admin/:id (Admin)
registry.registerPath({
  method: "delete",
  path: "/categories/admin/{id}",
  summary: "Delete / Deactivate Category (Admin)",
  description: "Soft deletes a category by setting status to delete (Admin only).",
  tags: ["Categories (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Category ID" })
    })
  },
  responses: {
    200: {
      description: "Category deactivated successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(CategoryResponseDataSchema)
        }
      }
    },
    404: {
      description: "Category not found",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});
