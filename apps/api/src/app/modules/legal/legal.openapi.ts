import { z } from "zod";

import { registry } from "../../../docs/openapi-registry";

export const LegalPolicySchema = registry.register(
  "LegalPolicy",
  z.object({
    id: z.string().uuid(),
    type: z.string(),
    title: z.string(),
    content: z.string(),
    updatedAt: z.string().datetime(),
    createdAt: z.string().datetime()
  })
);

registry.registerPath({
  method: "get",
  path: "/legal/{type}",
  summary: "Get legal policy content (privacy or terms)",
  tags: ["Legal Policies"],
  request: {
    params: z.object({
      type: z.enum(["privacy", "terms"])
    })
  },
  responses: {
    200: {
      description: "Legal policy retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            statusCode: z.number(),
            success: z.boolean(),
            message: z.string(),
            data: LegalPolicySchema
          })
        }
      }
    }
  }
});

registry.registerPath({
  method: "put",
  path: "/legal/{type}",
  summary: "Update legal policy content (Admin)",
  tags: ["Legal Policies"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      type: z.enum(["privacy", "terms"])
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            title: z.string().optional(),
            content: z.string()
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: "Legal policy updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            statusCode: z.number(),
            success: z.boolean(),
            message: z.string(),
            data: LegalPolicySchema
          })
        }
      }
    }
  }
});
