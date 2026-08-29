import { z } from "zod";

const createMessageZodSchema = z.object({
  body: z.object({
    message: z
      .string({ required_error: "Message text is required" })
      .min(3, "Message must be at least 3 characters"),
    author: z.string().optional().nullable()
  })
});

const bulkCreateMessagesZodSchema = z.object({
  body: z.object({
    messages: z
      .array(
        z.object({
          message: z.string().min(3, "Message must be at least 3 characters"),
          author: z.string().optional().nullable()
        })
      )
      .min(1, "At least one message is required")
  })
});

const updateMessageZodSchema = z.object({
  body: z.object({
    message: z.string().min(3, "Message must be at least 3 characters").optional(),
    author: z.string().optional().nullable(),
    status: z.enum(["active", "delete"]).optional()
  })
});

export const MotivationalMessageValidation = {
  createMessageZodSchema,
  bulkCreateMessagesZodSchema,
  updateMessageZodSchema
};
