import { StatusCodes } from "http-status-codes";

import config from "../../../config";
import ApiError from "../../../errors/ApiError";
import { emailHelper } from "../../../helpers/emailHelper";
import prisma from "../../../shared/prisma";

type IEmailSettingUpdate = {
  provider?: string;
  host?: string | null;
  port?: number | null;
  secure?: boolean;
  user?: string | null;
  pass?: string | null;
  fromEmail?: string | null;
  fromName?: string | null;
};

type IEmailSettingTest = {
  toEmail: string;
  provider?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  fromEmail?: string;
  fromName?: string;
};

const getEmailSettingFromDB = async () => {
  let setting = await prisma.emailSetting.findFirst();

  if (!setting) {
    setting = await prisma.emailSetting.create({
      data: {
        provider: "smtp",
        host: config.email.host || "smtp.resend.com",
        port: Number(config.email.port) || 587,
        secure: Number(config.email.port) === 465,
        user: config.email.user || "resend",
        pass: config.email.pass || "",
        fromEmail: config.email.from || "no-reply@kurius.cloud",
        fromName: config.branding.projectName || "Kurius"
      }
    });
  }

  return {
    id: setting.id,
    provider: setting.provider,
    host: setting.host,
    port: setting.port,
    secure: setting.secure,
    user: setting.user,
    fromEmail: setting.fromEmail,
    fromName: setting.fromName,
    hasPassword: Boolean(setting.pass),
    updatedAt: setting.updatedAt
  };
};

const updateEmailSettingInDB = async (payload: IEmailSettingUpdate) => {
  const existing = await prisma.emailSetting.findFirst();

  const updateData: {
    provider?: string;
    host?: string | null;
    port?: number | null;
    secure?: boolean;
    user?: string | null;
    pass?: string;
    fromEmail?: string | null;
    fromName?: string | null;
  } = {
    provider: payload.provider || "smtp",
    host: payload.host,
    port: payload.port,
    secure: payload.secure,
    user: payload.user,
    fromEmail: payload.fromEmail,
    fromName: payload.fromName
  };

  if (payload.pass !== undefined && payload.pass !== null && payload.pass.trim() !== "") {
    updateData.pass = payload.pass;
  }

  let updated;
  if (existing) {
    updated = await prisma.emailSetting.update({
      where: { id: existing.id },
      data: updateData
    });
  } else {
    updated = await prisma.emailSetting.create({
      data: {
        provider: payload.provider || "smtp",
        host: payload.host || "smtp.resend.com",
        port: payload.port || 587,
        secure: payload.secure || false,
        user: payload.user || "resend",
        pass: payload.pass || "",
        fromEmail: payload.fromEmail || "no-reply@kurius.cloud",
        fromName: payload.fromName || "Kurius"
      }
    });
  }

  emailHelper.clearEmailSettingCache();

  return {
    id: updated.id,
    provider: updated.provider,
    host: updated.host,
    port: updated.port,
    secure: updated.secure,
    user: updated.user,
    fromEmail: updated.fromEmail,
    fromName: updated.fromName,
    hasPassword: Boolean(updated.pass),
    updatedAt: updated.updatedAt
  };
};

const testEmailSettingInDB = async (payload: IEmailSettingTest) => {
  try {
    const existing = await prisma.emailSetting.findFirst();

    const testConfig = {
      provider: payload.provider || existing?.provider || "smtp",
      host: payload.host || existing?.host || config.email.host || "smtp.resend.com",
      port: payload.port
        ? Number(payload.port)
        : existing?.port || Number(config.email.port) || 587,
      secure: payload.secure !== undefined ? Boolean(payload.secure) : (existing?.secure ?? false),
      user:
        payload.user !== undefined ? payload.user : existing?.user || config.email.user || "resend",
      pass:
        payload.pass && payload.pass.trim() !== ""
          ? payload.pass
          : existing?.pass || config.email.pass || "",
      fromEmail:
        payload.fromEmail || existing?.fromEmail || config.email.from || "no-reply@kurius.cloud",
      fromName: payload.fromName || existing?.fromName || config.branding.projectName || "Kurius"
    };

    if (!testConfig.pass && !testConfig.user) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Cannot send test email without SMTP/Resend credentials."
      );
    }

    const result = await emailHelper.sendTestEmail(payload.toEmail, testConfig);

    return {
      status: "sent",
      message: `Test email sent successfully to ${payload.toEmail}! Check your inbox.`,
      accepted: result?.accepted
    };
  } catch (error: any) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Email connection failed: ${error?.message || "Invalid SMTP/Resend credentials"}`
    );
  }
};

export const EmailService = {
  getEmailSettingFromDB,
  updateEmailSettingInDB,
  testEmailSettingInDB
};
