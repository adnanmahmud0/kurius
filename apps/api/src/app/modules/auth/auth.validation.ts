import { z } from "zod";

const createVerifyEmailZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }),
    oneTimeCode: z.number({ required_error: "One time code is required" })
  })
});

const createLoginZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }),
    password: z.string({ required_error: "Password is required" })
  })
});

const createForgetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" })
  })
});

const createResetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string({ required_error: "Password is required" }),
    confirmPassword: z.string({
      required_error: "Confirm Password is required"
    })
  })
});

const createChangePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: "Current Password is required"
    }),
    newPassword: z.string({ required_error: "New Password is required" }),
    confirmPassword: z.string({
      required_error: "Confirm Password is required"
    })
  })
});

const createRegisterZodSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(2, "Name must be at least 2 characters"),
    email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters")
  })
});

export const AuthValidation = {
  createRegisterZodSchema,
  createVerifyEmailZodSchema,
  createForgetPasswordZodSchema,
  createLoginZodSchema,
  createResetPasswordZodSchema,
  createChangePasswordZodSchema
};
