import { StatusCodes } from "http-status-codes";

import ApiError from "../../../errors/ApiError";
import { StorageAdapter } from "../../../helpers/storageAdapter";
import prisma from "../../../shared/prisma";

interface ICreateVideoPayload {
  title: string;
  subtitle: string;
  categoryId: string;
  hashtags?: string[] | string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

interface IUpdateVideoPayload {
  title?: string;
  subtitle?: string;
  categoryId?: string;
  hashtags?: string[] | string;
  status?: "active" | "delete";
  videoUrl?: string;
  thumbnailUrl?: string;
}

const parseHashtags = (input: unknown): string[] => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((tag) => String(tag).trim().replace(/^#/, "")).filter(Boolean);
  }
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        return parsed.map((tag) => String(tag).trim().replace(/^#/, "")).filter(Boolean);
      }
    } catch {
      // Not a JSON string
    }
    return input
      .split(/[,\s]+/)
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean);
  }
  return [];
};

// 1. Get Public / Flutter Feed with Cursor-based Pagination
const getAllVideosFromDB = async (
  query: {
    limit?: number;
    cursor?: string;
    search?: string;
    categoryId?: string;
  },
  currentUserId?: string
) => {
  const limit = Math.min(Number(query.limit) || 20, 50);
  const cursor = query.cursor;
  const search = query.search || "";
  const categoryId = query.categoryId;

  const whereClause: any = {
    status: "active"
  };

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { subtitle: { contains: search, mode: "insensitive" } },
      { hashtags: { has: search.replace(/^#/, "") } }
    ];
  }

  const queryArgs: any = {
    where: whereClause,
    take: limit + 1,
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: { id: true, name: true, slug: true }
      },
      creator: {
        select: { id: true, name: true, avatar: true }
      },
      _count: {
        select: {
          views: true,
          likes: true,
          comments: true
        }
      },
      ...(currentUserId && {
        likes: {
          where: { userId: currentUserId },
          select: { id: true }
        }
      })
    }
  };

  if (cursor) {
    queryArgs.cursor = { id: cursor };
    queryArgs.skip = 1;
  }

  const items = await prisma.video.findMany(queryArgs);

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem ? nextItem.id : null;
  }

  const formattedVideos = items.map((video: any) => {
    const isLiked = currentUserId ? Boolean(video.likes?.length > 0) : false;
    const { likes, _count, ...rest } = video;
    return {
      ...rest,
      videoUrl: StorageAdapter.formatFileUrl(rest.videoUrl),
      thumbnailUrl: StorageAdapter.formatFileUrl(rest.thumbnailUrl),
      category: rest.category
        ? {
            ...rest.category,
            thumbnail: StorageAdapter.formatFileUrl(rest.category.thumbnail)
          }
        : rest.category,
      creator: rest.creator
        ? {
            ...rest.creator,
            avatar: StorageAdapter.formatFileUrl(rest.creator.avatar)
          }
        : rest.creator,
      isLiked,
      stats: {
        viewsCount: _count?.views || 0,
        likesCount: _count?.likes || 0,
        commentsCount: _count?.comments || 0
      }
    };
  });

  return {
    data: formattedVideos,
    meta: {
      limit,
      nextCursor,
      hasNextPage: Boolean(nextCursor)
    }
  };
};

// 2. Get Single Video by ID
const getVideoByIdFromDB = async (id: string, currentUserId?: string) => {
  const video: any = await prisma.video.findUnique({
    where: { id },
    include: {
      category: true,
      creator: {
        select: { id: true, name: true, avatar: true }
      },
      _count: {
        select: {
          views: true,
          likes: true,
          comments: true
        }
      },
      ...(currentUserId && {
        likes: {
          where: { userId: currentUserId },
          select: { id: true }
        }
      })
    }
  });

  if (!video) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Video not found!");
  }

  const isLiked = currentUserId ? Boolean(video.likes?.length > 0) : false;
  const { likes, _count, ...rest } = video;

  return {
    ...rest,
    videoUrl: StorageAdapter.formatFileUrl(rest.videoUrl),
    thumbnailUrl: StorageAdapter.formatFileUrl(rest.thumbnailUrl),
    category: rest.category
      ? {
          ...rest.category,
          thumbnail: StorageAdapter.formatFileUrl(rest.category.thumbnail)
        }
      : rest.category,
    creator: rest.creator
      ? {
          ...rest.creator,
          avatar: StorageAdapter.formatFileUrl(rest.creator.avatar)
        }
      : rest.creator,
    isLiked,
    stats: {
      viewsCount: _count?.views || 0,
      likesCount: _count?.likes || 0,
      commentsCount: _count?.comments || 0
    }
  };
};

// 3. Create / Upload Video (Admin)
const createVideoToDB = async (
  payload: ICreateVideoPayload,
  files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] } | undefined,
  creatorId: string
) => {
  // Validate category exists
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId }
  });

  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Selected category does not exist!");
  }

  let finalVideoUrl = payload.videoUrl;
  let finalThumbnailUrl = payload.thumbnailUrl;
  let storageType = "local";
  let publicId: string | undefined;

  // Handle video file upload
  if (files?.video && files.video.length > 0) {
    const uploadResult = await StorageAdapter.uploadFile(files.video[0], "videos");
    finalVideoUrl = uploadResult.url;
    storageType = uploadResult.storageType;
    publicId = uploadResult.publicId;
  }

  // Handle thumbnail file upload
  if (files?.thumbnail && files.thumbnail.length > 0) {
    const thumbResult = await StorageAdapter.uploadFile(files.thumbnail[0], "thumbnails");
    finalThumbnailUrl = thumbResult.url;
  }

  if (!finalVideoUrl) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "A video file or valid video URL must be provided."
    );
  }

  const video = await prisma.video.create({
    data: {
      title: payload.title,
      subtitle: payload.subtitle,
      videoUrl: finalVideoUrl,
      thumbnailUrl: finalThumbnailUrl || null,
      categoryId: payload.categoryId,
      hashtags: parseHashtags(payload.hashtags),
      status: "active",
      createdBy: creatorId,
      storageType,
      publicId: publicId || null
    },
    include: {
      category: true
    }
  });

  return video;
};

// 4. Admin Video Table with page/limit Pagination
const getAdminVideosFromDB = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = query.search || "";
  const categoryId = query.categoryId;
  const status = query.status as "active" | "delete" | undefined;

  const whereClause: any = {};

  if (status) {
    whereClause.status = status;
  }

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { subtitle: { contains: search, mode: "insensitive" } }
    ];
  }

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true
          }
        }
      }
    }),
    prisma.video.count({ where: whereClause })
  ]);

  const formatted = videos.map((v: any) => ({
    ...v,
    videoUrl: StorageAdapter.formatFileUrl(v.videoUrl),
    thumbnailUrl: StorageAdapter.formatFileUrl(v.thumbnailUrl),
    stats: {
      viewsCount: v._count?.views || 0,
      likesCount: v._count?.likes || 0,
      commentsCount: v._count?.comments || 0
    }
  }));

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit)
    },
    data: formatted
  };
};

// 5. Update Video (Admin)
const updateVideoInDB = async (
  id: string,
  payload: IUpdateVideoPayload,
  files?: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] }
) => {
  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Video not found!");
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId }
    });
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
    }
  }

  const updateData: any = {};
  if (payload.title) updateData.title = payload.title;
  if (payload.subtitle) updateData.subtitle = payload.subtitle;
  if (payload.categoryId) updateData.categoryId = payload.categoryId;
  if (payload.hashtags !== undefined) updateData.hashtags = parseHashtags(payload.hashtags);
  if (payload.status) updateData.status = payload.status;
  if (payload.videoUrl) updateData.videoUrl = payload.videoUrl;
  if (payload.thumbnailUrl) updateData.thumbnailUrl = payload.thumbnailUrl;

  // If new video uploaded
  if (files?.video && files.video.length > 0) {
    const uploadResult = await StorageAdapter.uploadFile(files.video[0], "videos");
    updateData.videoUrl = uploadResult.url;
    updateData.storageType = uploadResult.storageType;
    updateData.publicId = uploadResult.publicId;

    // Delete old file asynchronously if replacing
    if (existing.publicId) {
      StorageAdapter.deleteFile(existing.publicId, existing.storageType);
    }
  }

  // If new thumbnail uploaded
  if (files?.thumbnail && files.thumbnail.length > 0) {
    const thumbResult = await StorageAdapter.uploadFile(files.thumbnail[0], "thumbnails");
    updateData.thumbnailUrl = thumbResult.url;
  }

  const updated = await prisma.video.update({
    where: { id },
    data: updateData,
    include: {
      category: true
    }
  });

  return updated;
};

// 6. Delete Video (Database + Physical Storage)
const deleteVideoInDB = async (id: string) => {
  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Video not found!");
  }

  // 1. Delete physical video file from storage
  if (existing.publicId) {
    await StorageAdapter.deleteFile(existing.publicId, existing.storageType);
  } else if (existing.videoUrl) {
    await StorageAdapter.deleteFile(existing.videoUrl, existing.storageType);
  }

  // 2. Delete physical thumbnail file from storage
  if (existing.thumbnailUrl) {
    await StorageAdapter.deleteFile(existing.thumbnailUrl, existing.storageType);
  }

  // 3. Remove all views, likes, comments, and the video record from database
  await prisma.$transaction([
    prisma.videoView.deleteMany({ where: { videoId: id } }),
    prisma.videoLike.deleteMany({ where: { videoId: id } }),
    prisma.comment.deleteMany({ where: { videoId: id } }),
    prisma.video.delete({ where: { id } })
  ]);

  return { id, message: "Video and associated files deleted from database and storage." };
};

export const VideoService = {
  getAllVideosFromDB,
  getVideoByIdFromDB,
  createVideoToDB,
  getAdminVideosFromDB,
  updateVideoInDB,
  deleteVideoInDB
};
