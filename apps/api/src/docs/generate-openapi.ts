import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import config from "../config";
import { registry } from "./openapi-registry";
// Ensure all module OpenAPI definitions are imported and registered
import "../app/modules/auth/auth.openapi";
import "../app/modules/category/category.openapi";
import "../app/modules/video/video.openapi";
import "../app/modules/engagement/engagement.openapi";
import "../app/modules/comment/comment.openapi";
import "../app/modules/storage/storage.openapi";
import "../app/modules/user/user.openapi";
import "../app/modules/legal/legal.openapi";
import "../app/modules/motivational-message/motivational-message.openapi";

export const generateOpenApiDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: `${config.branding.projectName || "Kurius Video Platform"} API Docs`,
      version: "1.0.0",
      description:
        "Comprehensive REST API documentation generated directly from Zod validation schemas for Kurius Video Platform."
    },
    servers: [
      {
        url: "/api/v1",
        description: "API Version 1 Base Path"
      }
    ]
  });
};
