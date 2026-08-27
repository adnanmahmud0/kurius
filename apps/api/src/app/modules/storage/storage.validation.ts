import { z } from "zod";

const updateStorageSettingZodSchema = z.object({
  body: z.object({
    provider: z.enum(["local", "cloudinary"], {
      required_error: "Provider must be either 'local' or 'cloudinary'"
    }),
    cloudName: z.string().optional().nullable(),
    apiKey: z.string().optional().nullable(),
    apiSecret: z.string().optional().nullable()
  })
});

const testStorageSettingZodSchema = z.object({
  body: z.object({
    cloudName: z.string({ required_error: "Cloud Name is required for testing" }),
    apiKey: z.string({ required_error: "API Key is required for testing" }),
    apiSecret: z.string({ required_error: "API Secret is required for testing" })
  })
});

export const StorageValidation = {
  updateStorageSettingZodSchema,
  testStorageSettingZodSchema
};
