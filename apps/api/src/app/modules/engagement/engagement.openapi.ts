import { z } from "zod";

import {
  bearerAuth,
  createErrorResponseSchema,
  createSuccessResponseSchema,
  registry
} from "../../../docs/openapi-registry";

// 1. POST /videos/{id}/view
registry.registerPath({
  method: "post",
  path: "/videos/{id}/view",
  summary: "Record Video View",
  description:
    "Records a video view from the authenticated user with a 24-hour deduplication window.",
  tags: ["Engagement"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Video ID" })
    })
  },
  responses: {
    200: {
      description: "View recorded or already counted in current window",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.object({
              recorded: z.boolean(),
              message: z.string()
            })
          )
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

// 2. POST /videos/{id}/like
registry.registerPath({
  method: "post",
  path: "/videos/{id}/like",
  summary: "Like Video",
  description: "Likes a video for the authenticated user (idempotent).",
  tags: ["Engagement"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Video ID" })
    })
  },
  responses: {
    200: {
      description: "Video liked successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.object({
              isLiked: z.boolean(),
              message: z.string()
            })
          )
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

// 3. DELETE /videos/{id}/like
registry.registerPath({
  method: "delete",
  path: "/videos/{id}/like",
  summary: "Unlike Video",
  description: "Removes a like on a video for the authenticated user.",
  tags: ["Engagement"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Video ID" })
    })
  },
  responses: {
    200: {
      description: "Video unliked successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.object({
              isLiked: z.boolean(),
              message: z.string()
            })
          )
        }
      }
    }
  }
});
