import { z } from "zod";

const createCommentZodSchema = z.object({
  body: z.object({
    commentText: z
      .string({ required_error: "Comment text is required" })
      .min(1, "Comment cannot be empty")
      .max(1000, "Comment cannot exceed 1000 characters")
  })
});

export const CommentValidation = {
  createCommentZodSchema
};
