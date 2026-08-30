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

export const UserResponseDataSchema = z.object({
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
});
export const UpdateUserProfileRequestSchema = z
  .object({
    name: z.string().optional().openapi({ example: "Alex Smith" }),
    firstName: z.string().optional().openapi({ example: "Alex" }),
    lastName: z.string().optional().openapi({ example: "Smith" }),
    contact: z.string().optional().openapi({ example: "+1234567890" }),
    location: z.string().optional().openapi({ example: "New York, USA" }),
    image: z.string().optional().openapi({ description: "Image URL or Multipart file" }),
    avatar: z.string().optional().openapi({ description: "Avatar URL or Multipart file" })
  })
  .openapi("UpdateUserProfileRequest");

// 1. GET /user/profile
registry.registerPath({
  method: "get",
  path: "/user/profile",
  summary: "Get Current User Profile",
  description: "Retrieves the authenticated user's profile with personal engagement stats.",
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

// 2. PATCH /user/profile
registry.registerPath({
  method: "patch",
  path: "/user/profile",
  summary: "Update Current User Profile",
  description:
    "Updates profile details (name, contact, location, avatar/image). Accepts JSON or multipart/form-data with file upload.",
  tags: ["User Profile"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateUserProfileRequestSchema
        },
        "multipart/form-data": {
          schema: z.object({
            name: z.string().optional().openapi({ example: "Alex Smith" }),
            contact: z.string().optional().openapi({ example: "+1234567890" }),
            location: z.string().optional().openapi({ example: "New York, USA" }),
            image: z
              .string()
              .optional()
              .openapi({ format: "binary", description: "Avatar Image file (JPG/PNG/WEBP)" })
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: "Profile updated successfully",
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

// 2.5 POST /user/profile/image (Dedicated avatar image upload)
registry.registerPath({
  method: "post",
  path: "/user/profile/image",
  summary: "Update Profile Image / Avatar (Dedicated)",
  description:
    "Dedicated endpoint to upload or update user avatar/profile picture. Accepts multipart file upload (under key 'image', 'avatar', or 'file') or JSON with image URL.",
  tags: ["User Profile"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            image: z
              .string()
              .openapi({ format: "binary", description: "Avatar image file (.jpg, .png, .webp)" })
          })
        },
        "application/json": {
          schema: z.object({
            image: z.string().openapi({ example: "https://example.com/avatar.jpg" })
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: "Profile image updated successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(UserResponseDataSchema)
        }
      }
    },
    400: {
      description: "No image file or URL provided",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
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

// 3. DELETE /user/profile
registry.registerPath({
  method: "delete",
  path: "/user/profile",
  summary: "Delete / Close User Account",
  description: "Permanently deletes the currently authenticated user account and associated data.",
  tags: ["User Profile"],
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: "Account deleted successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.object({
              message: z.string().openapi({ example: "User deleted successfully" })
            })
          )
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
