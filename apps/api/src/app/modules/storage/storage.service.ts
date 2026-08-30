import { StatusCodes } from "http-status-codes";

import ApiError from "../../../errors/ApiError";
import { CloudinaryHelper } from "../../../helpers/cloudinaryHelper";
import prisma from "../../../shared/prisma";

type IStorageSettingUpdate = {
  provider: "local" | "cloudinary";
  cloudName?: string | null;
  apiKey?: string | null;
  apiSecret?: string | null;
};

type IStorageSettingTest = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

const getStorageSettingFromDB = async () => {
  let setting = await prisma.storageSetting.findFirst();

  if (!setting) {
    setting = await prisma.storageSetting.create({
      data: {
        provider: "local"
      }
    });
  }

  return {
    id: setting.id,
    provider: setting.provider,
    cloudName: setting.cloudName,
    apiKey: setting.apiKey,
    hasApiSecret: Boolean(setting.apiSecret),
    updatedAt: setting.updatedAt
  };
};

const updateStorageSettingInDB = async (payload: IStorageSettingUpdate) => {
  const { provider, cloudName, apiKey, apiSecret } = payload;

  if (provider === "cloudinary" && (!cloudName || !apiKey)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Cloud Name and API Key are required when selecting Cloudinary storage."
    );
  }

  const existing = await prisma.storageSetting.findFirst();

  const updateData: {
    provider: string;
    cloudName?: string | null;
    apiKey?: string | null;
    apiSecret?: string;
  } = {
    provider,
    cloudName: cloudName || null,
    apiKey: apiKey || null
  };

  if (apiSecret) {
    updateData.apiSecret = apiSecret;
  }

  let updated;
  if (existing) {
    updated = await prisma.storageSetting.update({
      where: { id: existing.id },
      data: updateData
    });
  } else {
    updated = await prisma.storageSetting.create({
      data: {
        provider,
        cloudName: cloudName || null,
        apiKey: apiKey || null,
        apiSecret: apiSecret || null
      }
    });
  }

  return {
    id: updated.id,
    provider: updated.provider,
    cloudName: updated.cloudName,
    apiKey: updated.apiKey,
    hasApiSecret: Boolean(updated.apiSecret),
    updatedAt: updated.updatedAt
  };
};

const testStorageConnectionInDB = async (payload: IStorageSettingTest) => {
  try {
    const result = await CloudinaryHelper.testCloudinaryConnection({
      cloudName: payload.cloudName,
      apiKey: payload.apiKey,
      apiSecret: payload.apiSecret
    });

    return {
      status: "connected",
      message: "Successfully connected to Cloudinary!",
      result
    };
  } catch (error: any) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cloudinary connection failed: ${error?.message || "Invalid credentials"}`
    );
  }
};

export const StorageService = {
  getStorageSettingFromDB,
  updateStorageSettingInDB,
  testStorageConnectionInDB
};
