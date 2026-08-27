import { z } from "zod";

import {
  bearerAuth,
  createErrorResponseSchema,
  createSuccessResponseSchema,
  registry
} from "../../../docs/openapi-registry";

// Response Schemas
export const VideoStatsSchema = z
  .object({
    viewsCount: z.number(),
    likesCount: z.number(),
    commentsCount: z.number()
  })
  .openapi("VideoStats");

export const VideoResponseDataSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    subtitle: z.string(),
    videoUrl: z.string(),
    thumbnailUrl: z.string().nullable().optional(),
    categoryId: z.string(),
    hashtags: z.array(z.string()),
    status: z.string(),
    createdBy: z.string(),
    storageType: z.string(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
    isLiked: z.boolean().optional(),
    category: z
      .object({
        id: z.string(),
        name: z.string(),
        slug: z.string().optional()
      })
      .optional(),
    creator: z
      .object({
        id: z.string(),
        name: z.string(),
        avatar: z.string().nullable().optional()
      })
      .optional(),
    stats: VideoStatsSchema.optional()
  })
  .openapi("VideoResponseData");

export const CursorPaginationMetaSchema = z
  .object({
    limit: z.number(),
    nextCursor: z.string().nullable(),
    hasNextPage: z.boolean()
  })
  .openapi("CursorPaginationMeta");

// 1. GET /videos (Cursor-paginated feed)
registry.registerPath({
  method: "get",
  path: "/videos",
  summary: "Get Video Feed (Cursor-paginated)",
  description:
    "Retrieves active video list using cursor-based pagination for Flutter / Web clients.",
  tags: ["Videos"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    query: z.object({
      limit: z.string().optional().openapi({ description: "Items per page (max 50, default 20)" }),
      cursor: z.string().optional().openapi({ description: "Cursor ID for next page" }),
      search: z
        .string()
        .optional()
        .openapi({ description: "Search query for title/subtitle/tags" }),
      categoryId: z.string().optional().openapi({ description: "Filter by category ID" })
    })
  },
  responses: {
    200: {
      description: "Videos retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(z.array(VideoResponseDataSchema), {
            metaSchema: CursorPaginationMetaSchema
          })
        }
      }
    }
  }
});

// 2. GET /videos/:id
registry.registerPath({
  method: "get",
  path: "/videos/{id}",
  summary: "Get Video by ID",
  description: "Retrieves full details for a single video including stats and isLiked flag.",
  tags: ["Videos"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Video ID" })
    })
  },
  responses: {
    200: {
      description: "Video retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(VideoResponseDataSchema)
        }
      }
    },
    404: {
      description: "Video not found",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});

// 3. GET /videos/category/:categoryId
registry.registerPath({
  method: "get",
  path: "/videos/category/{categoryId}",
  summary: "Get Videos by Category",
  description: "Retrieves cursor-paginated videos belonging to a specific category.",
  tags: ["Videos"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      categoryId: z.string().openapi({ description: "Category ID" })
    }),
    query: z.object({
      limit: z.string().optional(),
      cursor: z.string().optional()
    })
  },
  responses: {
    200: {
      description: "Category videos retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(z.array(VideoResponseDataSchema), {
            metaSchema: CursorPaginationMetaSchema
          })
        }
      }
    }
  }
});

// 4. POST /videos/admin (Multipart upload)
registry.registerPath({
  method: "post",
  path: "/videos/admin",
  summary: "Upload Video (Admin)",
  description:
    "Uploads video and optional thumbnail file, saves to local storage or Cloudinary (Admin only).",
  tags: ["Videos (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            title: z.string(),
            subtitle: z.string(),
            categoryId: z.string(),
            hashtags: z
              .string()
              .optional()
              .openapi({ description: "Comma-separated or JSON array string" }),
            video: z.any().openapi({ type: "string", format: "binary", description: "Video file" }),
            thumbnail: z
              .any()
              .optional()
              .openapi({ type: "string", format: "binary", description: "Thumbnail image file" })
          })
        }
      }
    }
  },
  responses: {
    201: {
      description: "Video uploaded and created successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(VideoResponseDataSchema)
        }
      }
    },
    400: {
      description: "Validation error or upload failure",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});
