import { StatusCodes } from "http-status-codes";

import ApiError from "../../../errors/ApiError";
import prisma from "../../../shared/prisma";
import {
  ICreateMotivationalMessagePayload,
  IMotivationalMessageFilters,
  IUpdateMotivationalMessagePayload
} from "./motivational-message.interface";

// 1. Create a single motivational message
const createMessageToDB = async (payload: ICreateMotivationalMessagePayload) => {
  const result = await prisma.motivationalMessage.create({
    data: {
      message: payload.message.trim(),
      author: payload.author?.trim() || null,
      status: "active"
    }
  });

  return result;
};

// 2. Bulk create motivational messages
const createBulkMessagesToDB = async (messages: ICreateMotivationalMessagePayload[]) => {
  const data = messages.map((m) => ({
    message: m.message.trim(),
    author: m.author?.trim() || null,
    status: "active" as const
  }));

  const result = await prisma.motivationalMessage.createMany({
    data
  });

  return result;
};

// 3. Get public random motivational message for mobile app
const getRandomMessageFromDB = async () => {
  const count = await prisma.motivationalMessage.count({
    where: { status: "active" }
  });

  if (count === 0) {
    // Return a default inspiring quote if none exist in DB yet
    return {
      id: "default-quote",
      message: "The secret of getting ahead is getting started.",
      author: "Mark Twain",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  const randomSkip = Math.floor(Math.random() * count);
  const randomMessage = await prisma.motivationalMessage.findFirst({
    where: { status: "active" },
    skip: randomSkip,
    orderBy: { createdAt: "desc" }
  });

  return randomMessage;
};

// 4. Get all messages with pagination and search (Admin)
const getAllMessagesFromDB = async (
  filters: IMotivationalMessageFilters,
  paginationOptions: { page?: number; limit?: number }
) => {
  const page = Number(paginationOptions.page) || 1;
  const limit = Number(paginationOptions.limit) || 20;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (filters.status) {
    whereClause.status = filters.status;
  }

  if (filters.search) {
    whereClause.OR = [
      { message: { contains: filters.search, mode: "insensitive" } },
      { author: { contains: filters.search, mode: "insensitive" } }
    ];
  }

  const [messages, total] = await Promise.all([
    prisma.motivationalMessage.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.motivationalMessage.count({ where: whereClause })
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit)
    },
    data: messages
  };
};

// 5. Get message by ID
const getMessageByIdFromDB = async (id: string) => {
  const message = await prisma.motivationalMessage.findUnique({
    where: { id }
  });

  if (!message) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Motivational message not found!");
  }

  return message;
};

// 6. Update message
const updateMessageInDB = async (id: string, payload: IUpdateMotivationalMessagePayload) => {
  const existing = await prisma.motivationalMessage.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Motivational message not found!");
  }

  const updateData: any = {};
  if (payload.message !== undefined) updateData.message = payload.message.trim();
  if (payload.author !== undefined) updateData.author = payload.author?.trim() || null;
  if (payload.status !== undefined) updateData.status = payload.status;

  const result = await prisma.motivationalMessage.update({
    where: { id },
    data: updateData
  });

  return result;
};

// 7. Delete message permanently
const deleteMessageFromDB = async (id: string) => {
  const existing = await prisma.motivationalMessage.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Motivational message not found!");
  }

  const result = await prisma.motivationalMessage.delete({
    where: { id }
  });

  return result;
};

// 8. Helper to seed initial 5 motivational messages if table is empty
const seedInitialMessagesIfEmpty = async () => {
  try {
    const count = await prisma.motivationalMessage.count();
    if (count === 0) {
      await prisma.motivationalMessage.createMany({
        data: [
          {
            message:
              "Success is not final, failure is not fatal: It is the courage to continue that counts.",
            author: "Winston Churchill",
            status: "active"
          },
          {
            message: "The only way to do great work is to love what you do.",
            author: "Steve Jobs",
            status: "active"
          },
          {
            message: "Believe you can and you're halfway there.",
            author: "Theodore Roosevelt",
            status: "active"
          },
          {
            message: "Act as if what you do makes a difference. It does.",
            author: "William James",
            status: "active"
          },
          {
            message: "Your time is limited, so don't waste it living someone else's life.",
            author: "Steve Jobs",
            status: "active"
          }
        ]
      });
    }
  } catch (error) {
    // Ignore seeding error if DB table is initializing
  }
};

export const MotivationalMessageService = {
  createMessageToDB,
  createBulkMessagesToDB,
  getRandomMessageFromDB,
  getAllMessagesFromDB,
  getMessageByIdFromDB,
  updateMessageInDB,
  deleteMessageFromDB,
  seedInitialMessagesIfEmpty
};
