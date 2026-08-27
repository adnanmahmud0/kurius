import { z } from "zod";

const recordViewZodSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Video ID is required" })
  })
});

const toggleLikeZodSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Video ID is required" })
  })
});

export const EngagementValidation = {
  recordViewZodSchema,
  toggleLikeZodSchema
};
