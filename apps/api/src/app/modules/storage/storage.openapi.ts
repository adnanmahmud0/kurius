import { z } from "zod";

import {
  bearerAuth,
  createErrorResponseSchema,
  createSuccessResponseSchema,
  registry
} from "../../../docs/openapi-registry";
import { StorageValidation } from "./storage.validation";

// Request Schemas
export const UpdateStorageSettingRequestSchema =
  StorageValidation.updateStorageSettingZodSchema.shape.body.openapi({
    description: "Storage provider configuration payload",
    example: {
      provider: "cloudinary",
      cloudName: "my-cloud",
      apiKey: "123456789",
      apiSecret: "secret_abc"
    }
  });

export const TestStorageSettingRequestSchema =
  StorageValidation.testStorageSettingZodSchema.shape.body.openapi({
    description: "Cloudinary credentials test payload",
    example: {
      cloudName: "my-cloud",
      apiKey: "123456789",
      apiSecret: "secret_abc"
    }
  });

// Response Schemas
export const StorageSettingResponseDataSchema = z
  .object({
    id: z.string(),
    provider: z.string(),
    cloudName: z.string().nullable().optional(),
    apiKey: z.string().nullable().optional(),
    hasApiSecret: z.boolean(),
    updatedAt: z.string().or(z.date())
  })
  .openapi("StorageSettingResponseData");

// Paths
registry.registerPath({
  method: "get",
  path: "/admin/storage",
  summary: "Get Storage Settings",
  description: "Retrieves current active storage provider settings (admin only).",
  tags: ["Storage Settings (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: "Storage settings retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(StorageSettingResponseDataSchema)
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

registry.registerPath({
  method: "put",
  path: "/admin/storage",
  summary: "Update Storage Settings",
  description: "Updates storage provider (local or cloudinary) and credentials (admin only).",
  tags: ["Storage Settings (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateStorageSettingRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Storage settings updated successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(StorageSettingResponseDataSchema)
        }
      }
    },
    400: {
      description: "Invalid request payload",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/admin/storage/test",
  summary: "Test Storage Connection",
  description: "Tests connectivity with the specified Cloudinary credentials (admin only).",
  tags: ["Storage Settings (Admin)"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: TestStorageSettingRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Connection successful",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.object({
              status: z.string(),
              message: z.string()
            })
          )
        }
      }
    },
    400: {
      description: "Connection failed",
      content: {
        "application/json": {
          schema: createErrorResponseSchema()
        }
      }
    }
  }
});
