import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import multer, { FileFilterCallback } from "multer";

import ApiError from "../../errors/ApiError";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",
  "video/avi",
  "video/msvideo",
  "video/webm",
  "video/ogg",
  "video/x-matroska",
  "video/mkv",
  "video/x-m4v",
  "video/3gpp",
  "video/3gpp2",
  "video/x-flv",
  "video/x-ms-wmv",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp"
];

const allowedExtensions = [
  ".mp4",
  ".mkv",
  ".mov",
  ".webm",
  ".avi",
  ".m4v",
  ".flv",
  ".wmv",
  ".3gp",
  ".ogg",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".bmp"
];

const videoFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = file.originalname
    ? file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase()
    : "";
  const isAllowedMime =
    allowedMimeTypes.includes(file.mimetype) ||
    file.mimetype.startsWith("video/") ||
    file.mimetype.startsWith("image/");
  const isAllowedExt = allowedExtensions.includes(ext);

  if (isAllowedMime || isAllowedExt) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        `Invalid file type: ${file.mimetype}. Only videos (mp4, mkv, mov, webm, avi) and images (jpg, png, webp) are allowed.`
      )
    );
  }
};

export const uploadVideoFiles = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500 MB max
  }
}).fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 }
]);

export const uploadSingleVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024
  }
}).single("video");
