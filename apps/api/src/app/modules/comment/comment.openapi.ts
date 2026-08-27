import { z } from "zod";

import {
  bearerAuth,
  createErrorResponseSchema,
  createSuccessResponseSchema,
  registry
} from "../../../docs/openapi-registry";
import { CursorPaginationMetaSchema } from "../video/video.openapi";
import { CommentValidation } from "./comment.validation";

// Request Schemas
export const CreateCommentRequestSchema =
  CommentValidation.createCommentZodSchema.shape.body.openapi({
    description: "Post comment payload",
    example: {
      commentText: "This is a great video!"
    }
  });

// Response Schemas
export const CommentResponseDataSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    videoId: z.string(),
    commentText: z.string(),
    status: z.string(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
    user: z
      .object({
        id: z.string(),
        name: z.string(),
        avatar: z.string().nullable().optional()
      })
      .optional()
  })
  .openapi("CommentResponseData");

// 1. POST /videos/{id}/comments
registry.registerPath({
  method: "post",
  path: "/videos/{id}/comments",
  summary: "Post Comment on Video",
  description: "Creates a new comment on the specified video for the authenticated user.",
  tags: ["Comments"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Video ID" })
    }),
    body: {
      content: {
        "application/json": {
          schema: CreateCommentRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: "Comment posted successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(CommentResponseDataSchema)
        }
      }
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});

// 2. GET /videos/{id}/comments
registry.registerPath({
  method: "get",
  path: "/videos/{id}/comments",
  summary: "Get Comments for Video",
  description: "Retrieves cursor-paginated comments on the specified video.",
  tags: ["Comments"],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Video ID" })
    }),
    query: z.object({
      limit: z.string().optional(),
      cursor: z.string().optional()
    })
  },
  responses: {
    200: {
      description: "Comments retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(z.array(CommentResponseDataSchema), {
            metaSchema: CursorPaginationMetaSchema
          })
        }
      }
    }
  }
});

// 3. DELETE /comments/{id}
registry.registerPath({
  method: "delete",
  path: "/comments/{id}",
  summary: "Delete Comment",
  description: "Deletes a comment (Author or Admin).",
  tags: ["Comments"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Comment ID" })
    })
  },
  responses: {
    200: {
      description: "Comment deleted successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(CommentResponseDataSchema)
        }
      }
    }
  }
});
