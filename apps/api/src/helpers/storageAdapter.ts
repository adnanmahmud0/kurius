import fs from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";

import { errorLogger, logger } from "../shared/logger";
import prisma from "../shared/prisma";
import { CloudinaryHelper } from "./cloudinaryHelper";

export type UploadResult = {
  url: string;
  publicId?: string;
  storageType: "local" | "cloudinary";
};

/**
 * Ensures a directory exists
 */
const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

let cachedStorageProvider: "local" | "cloudinary" = "local";
let lastStorageSettingFetch = 0;
const STORAGE_SETTING_CACHE_TTL = 60 * 1000; // 60 seconds

export const clearStorageSettingCache = () => {
  lastStorageSettingFetch = 0;
};

const getActiveStorageProvider = async (): Promise<"local" | "cloudinary"> => {
  const now = Date.now();
  if (now - lastStorageSettingFetch < STORAGE_SETTING_CACHE_TTL) {
    return cachedStorageProvider;
  }
  try {
    const setting = await prisma.storageSetting.findFirst();
    cachedStorageProvider = setting?.provider === "cloudinary" ? "cloudinary" : "local";
    lastStorageSettingFetch = now;
  } catch {
    cachedStorageProvider = "local";
  }
  return cachedStorageProvider;
};

/**
 * Dynamic Storage Adapter:
 * Uploads a file buffer or disk file to either Local Storage or Cloudinary
 * based on the active StorageSetting in the database.
 */
export const uploadFile = async (
  file: Express.Multer.File,
  folder = "videos"
): Promise<UploadResult> => {
  // Check active storage setting from cache/database
  const provider = await getActiveStorageProvider();

  // 1. Cloudinary upload
  if (provider === "cloudinary") {
    try {
      const buffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
      if (!buffer) {
        throw new Error("File buffer is empty");
      }
      const isVideo =
        file.mimetype.startsWith("video/") ||
        /\.(mp4|mkv|mov|webm|avi|flv|m4v|wmv)$/i.test(file.originalname || "");
      const result = await CloudinaryHelper.uploadToCloudinary(
        buffer,
        `kurius/${folder}`,
        isVideo ? "video" : "image"
      );

      // If a temporary local file existed, remove it
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        storageType: "cloudinary"
      };
    } catch (err) {
      errorLogger.error("Cloudinary upload failed, falling back to local storage", err);
      // Fall through to local storage
    }
  }

  // 2. Local Disk Storage
  const isVideo =
    file.mimetype.startsWith("video/") ||
    /\.(mp4|mkv|mov|webm|avi|flv|m4v|wmv)$/i.test(file.originalname || "");
  const ext = path.extname(file.originalname || "") || (isVideo ? ".mp4" : ".jpg");
  const filename = `${uuidv4()}${ext}`;
  const targetDir = path.join(process.cwd(), "uploads", folder);
  ensureDir(targetDir);

  const targetPath = path.join(targetDir, filename);

  if (file.buffer) {
    await fs.promises.writeFile(targetPath, file.buffer);
  } else if (file.path) {
    await fs.promises.copyFile(file.path, targetPath);
    if (file.path !== targetPath && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }

  const relativeUrl = `/uploads/${folder}/${filename}`;
  const fullUrl = formatFileUrl(relativeUrl);
  logger.info(`File saved locally: ${relativeUrl} -> ${fullUrl}`);

  return {
    url: fullUrl || relativeUrl,
    publicId: `${folder}/${filename}`,
    storageType: "local"
  };
};

/**
 * Resolves a stored file path to a fully-qualified public HTTP/HTTPS URL
 */
export const formatFileUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const apiBase =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.SERVER_URL ||
    "https://api.kuriusapp.cloud";
  const cleanBase = apiBase.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};

/**
 * Delete a file from local storage or Cloudinary
 */
export const deleteFile = async (publicId: string, storageType = "local"): Promise<void> => {
  if (!publicId) return;

  if (storageType === "cloudinary") {
    await CloudinaryHelper.deleteFromCloudinary(publicId);
  } else {
    try {
      const cleanPath = publicId.replace(/^\/?uploads\/?/, "");
      const localPath = path.join(process.cwd(), "uploads", cleanPath);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        logger.info(`Deleted local file: ${localPath}`);
      } else {
        const altPath = path.resolve(__dirname, "../uploads", cleanPath);
        if (fs.existsSync(altPath)) {
          fs.unlinkSync(altPath);
          logger.info(`Deleted local file: ${altPath}`);
        }
      }
    } catch (error) {
      errorLogger.error("Local file delete error", error);
    }
  }
};

export const StorageAdapter = {
  uploadFile,
  deleteFile,
  formatFileUrl,
  clearStorageSettingCache
};
