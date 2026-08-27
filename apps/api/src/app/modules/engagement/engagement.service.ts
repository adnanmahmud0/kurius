import { StatusCodes } from "http-status-codes";

import ApiError from "../../../errors/ApiError";
import prisma from "../../../shared/prisma";

// Record video view with 24-hour deduplication window
const recordViewToDB = async (userId: string, videoId: string) => {
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Video not found!");
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Check if this user already viewed this video in the last 24 hours
  const recentView = await prisma.videoView.findFirst({
    where: {
      userId,
      videoId,
      viewedAt: { gte: twentyFourHoursAgo }
    }
  });

  if (recentView) {
    return {
      recorded: false,
      message: "View already counted for this 24-hour window."
    };
  }

  await prisma.videoView.create({
    data: {
      userId,
      videoId
    }
  });

  return {
    recorded: true,
    message: "View recorded successfully."
  };
};

// Like Video (Idempotent with DB unique constraint)
const likeVideoInDB = async (userId: string, videoId: string) => {
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Video not found!");
  }

  const existingLike = await prisma.videoLike.findUnique({
    where: {
      userId_videoId: { userId, videoId }
    }
  });

  if (existingLike) {
    return {
      isLiked: true,
      message: "Video already liked."
    };
  }

  await prisma.videoLike.create({
    data: {
      userId,
      videoId
    }
  });

  return {
    isLiked: true,
    message: "Video liked successfully."
  };
};

// Unlike Video
const unlikeVideoInDB = async (userId: string, videoId: string) => {
  const existingLike = await prisma.videoLike.findUnique({
    where: {
      userId_videoId: { userId, videoId }
    }
  });

  if (existingLike) {
    await prisma.videoLike.delete({
      where: {
        userId_videoId: { userId, videoId }
      }
    });
  }

  return {
    isLiked: false,
    message: "Video unliked successfully."
  };
};

export const EngagementService = {
  recordViewToDB,
  likeVideoInDB,
  unlikeVideoInDB
};
