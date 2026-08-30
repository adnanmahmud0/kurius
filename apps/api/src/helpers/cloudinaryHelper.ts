import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { StatusCodes } from "http-status-codes";

import ApiError from "../errors/ApiError";
import { errorLogger, logger } from "../shared/logger";
import prisma from "../shared/prisma";

export type CloudinaryConfigOptions = {
  cloudName?: string | null;
  apiKey?: string | null;
  apiSecret?: string | null;
};

/**
 * Configure Cloudinary instance dynamically from DB or env fallback
 */
export const configureCloudinary = async (customConfig?: CloudinaryConfigOptions) => {
  let cloud_name = customConfig?.cloudName;
  let api_key = customConfig?.apiKey;
  let api_secret = customConfig?.apiSecret;

  if (!cloud_name || !api_key || !api_secret) {
    // Try to read active StorageSetting from DB
    try {
      const setting = await prisma.storageSetting.findFirst();
      if (setting && setting.provider === "cloudinary") {
        cloud_name = setting.cloudName || undefined;
        api_key = setting.apiKey || undefined;
        api_secret = setting.apiSecret || undefined;
      }
    } catch {
      // Fallback if table not ready yet
    }
  }

  // Fallback to process.env if still missing
  cloud_name = cloud_name || process.env.CLOUDINARY_CLOUD_NAME;
  api_key = api_key || process.env.CLOUDINARY_API_KEY;
  api_secret = api_secret || process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Cloudinary credentials are not configured in Storage Settings."
    );
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true
  });

  return cloudinary;
};

/**
 * Upload a file buffer (e.g. video or image) to Cloudinary
 */
export const uploadToCloudinary = async (
  buffer: Buffer,
  folder = "kurius/videos",
  resourceType: "video" | "image" | "auto" = "video"
): Promise<UploadApiResponse> => {
  await configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        chunk_size: 6000000 // 6MB chunks for videos
      },
      (error: any, result: any) => {
        if (error || !result) {
          errorLogger.error("Cloudinary upload error", error);
          return reject(
            new ApiError(
              StatusCodes.INTERNAL_SERVER_ERROR,
              error?.message || "Cloudinary upload failed"
            )
          );
        }

        logger.info("Cloudinary upload successful", result.secure_url);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by public ID
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "video" | "image" = "video"
) => {
  try {
    await configureCloudinary();
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    errorLogger.error("Cloudinary delete error", error);
  }
};

/**
 * Test Cloudinary connection with provided credentials
 */
export const testCloudinaryConnection = async (configOptions: CloudinaryConfigOptions) => {
  const client = await configureCloudinary(configOptions);
  // Ping API
  const result = await client.api.ping();
  return result;
};

export const CloudinaryHelper = {
  configureCloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  testCloudinaryConnection
};
