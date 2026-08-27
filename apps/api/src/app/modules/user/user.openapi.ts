import { z } from "zod";

import {
  bearerAuth,
  createErrorResponseSchema,
  createSuccessResponseSchema,
  registry
} from "../../../docs/openapi-registry";

export const UserStatsSchema = z
  .object({
    videosCreated: z.number(),
    viewsCount: z.number(),
    likesCount: z.number(),
    commentsCount: z.number()
  })
  .openapi("UserEngagementStats");

export const UserResponseDataSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    email: z.string(),
    role: z.string(),
    contact: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
    status: z.string(),
    verified: z.boolean(),
    provider: z.string(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
    stats: UserStatsSchema.optional()
  })
  .openapi("UserResponseData");

// 1. GET /user/profile
registry.registerPath({
  method: "get",
  path: "/user/profile",
  summary: "Get Current User Profile",
  description: "Retrieves the authenticated user's profile.",
  tags: ["User Profile"],
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: "Profile retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(UserResponseDataSchema)
        }
      }
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});

// 2. GET /user (Admin - list users with search/pagination)
registry.registerPath({
  method: "get",
  path: "/user",
  summary: "Get Users List (Admin)",
  description:
    "Retrieves a paginated list of users with engagement stats and search filtering (Admin only).",
  tags: ["Users (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    query: z.object({
      searchTerm: z
        .string()
        .optional()
        .openapi({ description: "Search by name, email, or contact" }),
      page: z.string().optional().openapi({ description: "Page number" }),
      limit: z.string().optional().openapi({ description: "Items per page" }),
      sort: z.string().optional().openapi({ description: "Sort field (e.g. -createdAt)" })
    })
  },
  responses: {
    200: {
      description: "Users list retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(z.array(UserResponseDataSchema))
        }
      }
    }
  }
});

// 3. GET /user/:id (Admin - single user detail + stats)
registry.registerPath({
  method: "get",
  path: "/user/{id}",
  summary: "Get User Detail by ID (Admin)",
  description: "Retrieves complete user detail with full engagement metrics (Admin only).",
  tags: ["Users (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "User ID" })
    })
  },
  responses: {
    200: {
      description: "User details retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(UserResponseDataSchema)
        }
      }
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});
