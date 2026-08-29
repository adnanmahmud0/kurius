import { z } from "zod";

import {
  bearerAuth,
  createErrorResponseSchema,
  createSuccessResponseSchema,
  registry
} from "../../../docs/openapi-registry";
import { MotivationalMessageValidation } from "./motivational-message.validation";

// Request Schemas
export const CreateMotivationalMessageRequestSchema =
  MotivationalMessageValidation.createMessageZodSchema.shape.body.openapi({
    description: "Create motivational message payload",
    example: {
      message: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    }
  });

export const BulkCreateMotivationalMessageRequestSchema =
  MotivationalMessageValidation.bulkCreateMessagesZodSchema.shape.body.openapi({
    description: "Bulk create motivational messages payload",
    example: {
      messages: [
        {
          message: "Believe you can and you're halfway there.",
          author: "Theodore Roosevelt"
        },
        {
          message: "Act as if what you do makes a difference. It does.",
          author: "William James"
        }
      ]
    }
  });

export const UpdateMotivationalMessageRequestSchema =
  MotivationalMessageValidation.updateMessageZodSchema.shape.body.openapi({
    description: "Update motivational message payload",
    example: {
      message:
        "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      author: "Winston Churchill",
      status: "active"
    }
  });

// Response Schemas
export const MotivationalMessageResponseDataSchema = z
  .object({
    id: z.string(),
    message: z.string(),
    author: z.string().nullable().optional(),
    status: z.string(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date())
  })
  .openapi("MotivationalMessageResponseData");

// 1. GET /motivational-messages/random (Public)
registry.registerPath({
  method: "get",
  path: "/motivational-messages/random",
  summary: "Get Random Motivational Message",
  description:
    "Retrieves a single random active motivational message for displaying in mobile feeds or home cards.",
  tags: ["Motivational Quotes"],
  responses: {
    200: {
      description: "Random motivational message retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(MotivationalMessageResponseDataSchema)
        }
      }
    },
    404: {
      description: "No active motivational messages found",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});

// 2. GET /motivational-messages (Admin / List)
registry.registerPath({
  method: "get",
  path: "/motivational-messages",
  summary: "Get Motivational Messages List",
  description: "Retrieves paginated motivational messages with optional search and status filter.",
  tags: ["Motivational Quotes (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    query: z.object({
      page: z.string().optional().openapi({ example: "1", description: "Page number" }),
      limit: z.string().optional().openapi({ example: "20", description: "Items per page" }),
      search: z.string().optional().openapi({ example: "success", description: "Search keyword" }),
      status: z.enum(["active", "delete"]).optional().openapi({ example: "active" })
    })
  },
  responses: {
    200: {
      description: "Motivational messages retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(z.array(MotivationalMessageResponseDataSchema))
        }
      }
    }
  }
});

// 3. POST /motivational-messages/admin (Admin)
registry.registerPath({
  method: "post",
  path: "/motivational-messages/admin",
  summary: "Create Single Motivational Message (Admin)",
  description: "Creates a single new motivational quote (Admin only).",
  tags: ["Motivational Quotes (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateMotivationalMessageRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: "Motivational message created successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(MotivationalMessageResponseDataSchema)
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

// 4. POST /motivational-messages/admin/bulk (Admin)
registry.registerPath({
  method: "post",
  path: "/motivational-messages/admin/bulk",
  summary: "Bulk Create Motivational Messages (Admin)",
  description: "Creates multiple motivational quotes at once in a batch (Admin only).",
  tags: ["Motivational Quotes (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: BulkCreateMotivationalMessageRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: "Motivational messages imported successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.object({
              count: z.number().openapi({ example: 10 })
            })
          )
        }
      }
    }
  }
});

// 5. GET /motivational-messages/admin/:id (Admin)
registry.registerPath({
  method: "get",
  path: "/motivational-messages/admin/{id}",
  summary: "Get Motivational Message By ID (Admin)",
  description: "Retrieves a single motivational message by ID (Admin only).",
  tags: ["Motivational Quotes (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Message ID" })
    })
  },
  responses: {
    200: {
      description: "Motivational message retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(MotivationalMessageResponseDataSchema)
        }
      }
    },
    404: {
      description: "Motivational message not found",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});

// 6. PUT /motivational-messages/admin/:id (Admin)
registry.registerPath({
  method: "put",
  path: "/motivational-messages/admin/{id}",
  summary: "Update Motivational Message (Admin)",
  description: "Updates an existing motivational message or its author/status (Admin only).",
  tags: ["Motivational Quotes (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Message ID" })
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateMotivationalMessageRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Motivational message updated successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(MotivationalMessageResponseDataSchema)
        }
      }
    },
    404: {
      description: "Motivational message not found",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});

// 7. DELETE /motivational-messages/admin/:id (Admin)
registry.registerPath({
  method: "delete",
  path: "/motivational-messages/admin/{id}",
  summary: "Delete Motivational Message Permanently (Admin)",
  description: "Permanently deletes a motivational message from the database (Admin only).",
  tags: ["Motivational Quotes (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Message ID" })
    })
  },
  responses: {
    200: {
      description: "Motivational message deleted successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(MotivationalMessageResponseDataSchema)
        }
      }
    },
    404: {
      description: "Motivational message not found",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});
