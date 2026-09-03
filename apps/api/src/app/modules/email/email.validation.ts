import { z } from "zod";

const updateEmailSettingZodSchema = z.object({
  body: z.object({
    provider: z.enum(["smtp", "resend"]).optional().default("smtp"),
    host: z.string().min(1, "SMTP Host is required").optional().nullable(),
    port: z.number().int().positive().optional().nullable(),
    secure: z.boolean().optional().default(false),
    user: z.string().optional().nullable(),
    pass: z.string().optional().nullable(),
    fromEmail: z.string().email("Invalid sender email address").optional().nullable(),
    fromName: z.string().optional().nullable()
  })
});

const testEmailSettingZodSchema = z.object({
  body: z.object({
    toEmail: z.string().email("Valid recipient email is required to send test email"),
    provider: z.enum(["smtp", "resend"]).optional(),
    host: z.string().optional(),
    port: z.number().int().positive().optional(),
    secure: z.boolean().optional(),
    user: z.string().optional(),
    pass: z.string().optional(),
    fromEmail: z.string().email().optional(),
    fromName: z.string().optional()
  })
});

export const EmailValidation = {
  updateEmailSettingZodSchema,
  testEmailSettingZodSchema
};
