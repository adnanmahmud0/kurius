import { z } from "zod";

export const updateLegalPolicyZodSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").optional(),
    content: z.string().min(1, "Content is required")
  })
});
