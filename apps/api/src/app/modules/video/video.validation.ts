import { z } from "zod";

const createVideoZodSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "Title is required" })
      .min(1, "Title must be at least 1 character"),
    subtitle: z.string().optional().default(""),
    categoryId: z.string({ required_error: "Category ID is required" }),
    hashtags: z
      .union([z.array(z.string()), z.string()])
      .optional()
      .transform((val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          return val
            .split(",")
            .map((s) => s.trim().replace(/^#/, ""))
            .filter(Boolean);
        }
        return [];
      }),
    videoUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional()
  })
});

const updateVideoZodSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    subtitle: z.string().optional(),
    categoryId: z.string().optional(),
    hashtags: z
      .union([z.array(z.string()), z.string()])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        if (Array.isArray(val)) return val;
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          return val
            .split(",")
            .map((s) => s.trim().replace(/^#/, ""))
            .filter(Boolean);
        }
        return undefined;
      }),
    status: z.enum(["active", "delete"]).optional(),
    videoUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional()
  })
});

export const VideoValidation = {
  createVideoZodSchema,
  updateVideoZodSchema
};
