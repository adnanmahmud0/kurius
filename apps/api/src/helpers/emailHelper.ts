import nodemailer from "nodemailer";

import config from "../config";
import { errorLogger, logger } from "../shared/logger";
import prisma from "../shared/prisma";
import { ISendEmail } from "../types/email";

export type IEmailConfig = {
  provider?: string;
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  fromEmail: string;
  fromName: string;
};

let cachedEmailConfig: IEmailConfig | null = null;
let lastEmailConfigFetch = 0;
const EMAIL_CONFIG_CACHE_TTL = 60 * 1000; // 60s cache

export const clearEmailSettingCache = () => {
  cachedEmailConfig = null;
  lastEmailConfigFetch = 0;
};

export const getActiveEmailConfig = async (): Promise<IEmailConfig> => {
  const now = Date.now();
  if (cachedEmailConfig && now - lastEmailConfigFetch < EMAIL_CONFIG_CACHE_TTL) {
    return cachedEmailConfig;
  }

  try {
    const setting = await prisma.emailSetting.findFirst();
    if (setting) {
      cachedEmailConfig = {
        provider: setting.provider || "smtp",
        host: setting.host || config.email.host || "smtp.resend.com",
        port: setting.port ? Number(setting.port) : Number(config.email.port) || 587,
        secure: setting.secure ?? false,
        user: setting.user || config.email.user || "resend",
        pass: setting.pass || config.email.pass || "",
        fromEmail: setting.fromEmail || config.email.from || "no-reply@kurius.cloud",
        fromName: setting.fromName || config.branding.projectName || "Kurius"
      };
      lastEmailConfigFetch = now;
      return cachedEmailConfig;
    }
  } catch (err) {
    errorLogger.error("Failed to load EmailSetting from DB, falling back to env", err);
  }

  // Fallback to process.env / config
  cachedEmailConfig = {
    provider: "smtp",
    host: config.email.host || "smtp.resend.com",
    port: Number(config.email.port) || 587,
    secure: Number(config.email.port) === 465,
    user: config.email.user || "resend",
    pass: config.email.pass || "",
    fromEmail: config.email.from || "no-reply@kurius.cloud",
    fromName: config.branding.projectName || "Kurius"
  };
  lastEmailConfigFetch = now;
  return cachedEmailConfig;
};

const createTransporter = (cfg: IEmailConfig) => {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth:
      cfg.user || cfg.pass
        ? {
            user: cfg.user,
            pass: cfg.pass
          }
        : undefined
  });
};

const sendEmail = async (values: ISendEmail) => {
  try {
    const emailConfig = await getActiveEmailConfig();

    if (!emailConfig.pass && !emailConfig.user) {
      logger.warn("Email credentials not configured yet. Skipping send.");
      return;
    }

    const transporter = createTransporter(emailConfig);
    const fromHeader = `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`;

    const info = await transporter.sendMail({
      from: fromHeader,
      to: values.to,
      subject: values.subject,
      html: values.html
    });

    logger.info("Mail sent successfully", info.accepted);
    return info;
  } catch (error) {
    errorLogger.error("Email send failed", error);
  }
};

const sendTestEmail = async (toEmail: string, customConfig?: Partial<IEmailConfig>) => {
  const baseConfig = await getActiveEmailConfig();
  const testConfig: IEmailConfig = {
    ...baseConfig,
    ...customConfig,
    port: customConfig?.port ? Number(customConfig.port) : baseConfig.port,
    secure: customConfig?.secure !== undefined ? Boolean(customConfig.secure) : baseConfig.secure
  };

  const transporter = createTransporter(testConfig);
  const fromHeader = `"${testConfig.fromName}" <${testConfig.fromEmail}>`;

  const info = await transporter.sendMail({
    from: fromHeader,
    to: toEmail,
    subject: `Test Email from ${testConfig.fromName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">Email Configuration Successful!</h2>
        <p>This is a test email sent from your <strong>${testConfig.fromName}</strong> platform.</p>
        <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-size: 13px; color: #374151;">
          <p style="margin: 4px 0;"><strong>Host:</strong> ${testConfig.host}</p>
          <p style="margin: 4px 0;"><strong>Port:</strong> ${testConfig.port} (${testConfig.secure ? "SSL/TLS" : "STARTTLS"})</p>
          <p style="margin: 4px 0;"><strong>From:</strong> ${fromHeader}</p>
          <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">If you received this email, your SMTP / Resend configuration is working correctly.</p>
      </div>
    `
  });

  return info;
};

export const emailHelper = {
  sendEmail,
  sendTestEmail,
  getActiveEmailConfig,
  clearEmailSettingCache
};
