import { StatusCodes } from "http-status-codes";

import ApiError from "../../../errors/ApiError";
import prisma from "../../../shared/prisma";

// Create comment on video
const createCommentToDB = async (userId: string, videoId: string, commentText: string) => {
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Video not found!");
  }

  const comment = await prisma.comment.create({
    data: {
      userId,
      videoId,
      commentText: commentText.trim(),
      status: "active"
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  });

  return comment;
};

// Get cursor-paginated comments for a video
const getVideoCommentsFromDB = async (
  videoId: string,
  query: { limit?: number; cursor?: string }
) => {
  const limit = Math.min(Number(query.limit) || 20, 50);
  const cursor = query.cursor;

  const whereClause = {
    videoId,
    status: "active" as const
  };

  const queryArgs: any = {
    where: whereClause,
    take: limit + 1,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  };

  if (cursor) {
    queryArgs.cursor = { id: cursor };
    queryArgs.skip = 1;
  }

  const items = await prisma.comment.findMany(queryArgs);

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem ? nextItem.id : null;
  }

  return {
    data: items,
    meta: {
      limit,
      nextCursor,
      hasNextPage: Boolean(nextCursor)
    }
  };
};

// Delete comment (User can delete own; Admin can delete any)
const deleteCommentFromDB = async (commentId: string, userId: string, userRole?: string) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found!");
  }

  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  if (comment.userId !== userId && !isAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You do not have permission to delete this comment!");
  }

  const deleted = await prisma.comment.update({
    where: { id: commentId },
    data: { status: "delete" }
  });

  return deleted;
};

export const CommentService = {
  createCommentToDB,
  getVideoCommentsFromDB,
  deleteCommentFromDB
};
