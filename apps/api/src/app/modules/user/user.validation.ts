import { z } from "zod";

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z.string({ required_error: "Email is required" }),
    password: z.string({ required_error: "Password is required" }),
    profile: z.string().optional()
  })
});

const updateUserZodSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  contact: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  avatar: z.string().nullable().optional()
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema
};
