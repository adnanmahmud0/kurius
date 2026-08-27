import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import multer, { FileFilterCallback } from "multer";

import ApiError from "../../errors/ApiError";

const storage = multer.memoryStorage();

const videoFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimeTypes = [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    "video/ogg",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        `Invalid file type: ${file.mimetype}. Only videos (mp4, mkv, mov, webm) and images (jpg, png, webp) are allowed.`
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
