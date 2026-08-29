import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

import config from "../../../config";
import { USER_ROLES } from "../../../enums/user";
import ApiError from "../../../errors/ApiError";
import { emailHelper } from "../../../helpers/emailHelper";
import { emailTemplate } from "../../../shared/emailTemplate";
import prisma from "../../../shared/prisma";
import unlinkFile from "../../../shared/unlinkFile";
import generateOTP from "../../../util/generateOTP";

const getAllUsersToDB = async (query: Record<string, unknown>) => {
  const { searchTerm, page, limit, sort, ...filterData } = query;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const where: Prisma.UserWhereInput = {
    role: (filterData.role as USER_ROLES) || USER_ROLES.USER
  };

  if (searchTerm) {
    where.OR = [
      { name: { contains: searchTerm as string, mode: "insensitive" } },
      { email: { contains: searchTerm as string, mode: "insensitive" } },
      { contact: { contains: searchTerm as string, mode: "insensitive" } }
    ];
  }

  const otherFilters = { ...filterData };
  delete otherFilters.role;

  if (Object.keys(otherFilters).length > 0) {
    where.AND = Object.keys(otherFilters).map((key) => ({
      [key]: otherFilters[key]
    }));
  }

  let orderBy = {};
  if (sort) {
    const sortStr = sort as string;
    const isDesc = sortStr.startsWith("-");
    const field = isDesc ? sortStr.substring(1) : sortStr;
    orderBy = { [field]: isDesc ? "desc" : "asc" };
  } else {
    orderBy = { createdAt: "desc" };
  }

  const result = await prisma.user.findMany({
    where,
    skip,
    take: limitNumber,
    orderBy,
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      contact: true,
      location: true,
      image: true,
      avatar: true,
      status: true,
      verified: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          videos: true,
          views: true,
          likes: true,
          comments: true
        }
      }
    }
  });

  const formattedResult = result.map((u: any) => ({
    ...u,
    stats: {
      videosCreated: u._count?.videos || 0,
      viewsCount: u._count?.views || 0,
      likesCount: u._count?.likes || 0,
      commentsCount: u._count?.comments || 0
    }
  }));

  const total = await prisma.user.count({ where });
  const totalPage = Math.ceil(total / limitNumber);

  return {
    result: formattedResult,
    meta: {
      total,
      limit: limitNumber,
      page: pageNumber,
      totalPage
    }
  };
};

const getUserByIdFromDB = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      contact: true,
      location: true,
      image: true,
      avatar: true,
      status: true,
      verified: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          videos: true,
          views: true,
          likes: true,
          comments: true
        }
      }
    }
  });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  const { _count, ...rest } = user;
  return {
    ...rest,
    stats: {
      videosCreated: _count?.videos || 0,
      viewsCount: _count?.views || 0,
      likesCount: _count?.likes || 0,
      commentsCount: _count?.comments || 0
    }
  };
};

const createUserToDB = async (payload: Prisma.UserCreateInput) => {
  payload.role = USER_ROLES.USER;

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds));
  }

  const createUser = await prisma.user.create({ data: payload });
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
  }

  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  await prisma.user.update({
    where: { id: createUser.id },
    data: {
      authOneTimeCode: otp,
      authExpireAt: new Date(Date.now() + 3 * 60000)
    }
  });

  return createUser;
};

const getUserProfileFromDB = async (user: JwtPayload) => {
  const { id } = user;
  const isExistUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      contact: true,
      location: true,
      image: true,
      avatar: true,
      status: true,
      verified: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          videos: true,
          views: true,
          likes: true,
          comments: true
        }
      }
    }
  });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User doesn't exist!");
  }

  const { _count, ...rest } = isExistUser;
  return {
    ...rest,
    stats: {
      videosCreated: _count?.videos || 0,
      viewsCount: _count?.views || 0,
      likesCount: _count?.likes || 0,
      commentsCount: _count?.comments || 0
    }
  };
};

const updateProfileToDB = async (user: JwtPayload, payload: Prisma.UserUpdateInput) => {
  const { id } = user;
  const isExistUser = await prisma.user.findUnique({ where: { id } });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User doesn't exist!");
  }

  // Clean up previous custom uploaded avatar/image if replacing
  const { StorageAdapter } = await import("../../../helpers/storageAdapter");
  if (
    payload.image &&
    typeof payload.image === "string" &&
    isExistUser.image &&
    !isExistUser.image.includes("ibb.co")
  ) {
    await StorageAdapter.deleteFile(isExistUser.image);
  }

  if (
    payload.avatar &&
    typeof payload.avatar === "string" &&
    isExistUser.avatar &&
    !isExistUser.avatar.includes("ibb.co") &&
    isExistUser.avatar !== isExistUser.image
  ) {
    await StorageAdapter.deleteFile(isExistUser.avatar);
  }

  await prisma.user.update({
    where: { id },
    data: payload
  });

  return getUserProfileFromDB(user);
};

const deleteAccountFromDB = async (user: JwtPayload) => {
  const { id } = user;
  const isExistUser = await prisma.user.findUnique({ where: { id } });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (isExistUser.image) {
    unlinkFile(isExistUser.image);
  }

  const deleteDoc = await prisma.user.delete({ where: { id } });
  return deleteDoc;
};

// Admin deletes user permanently and cleans up relations
const deleteUserByAdminFromDB = async (id: string) => {
  const isExistUser = await prisma.user.findUnique({ where: { id } });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  if (isExistUser.role === USER_ROLES.SUPER_ADMIN) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Cannot delete Super Admin account!");
  }

  if (isExistUser.image) {
    unlinkFile(isExistUser.image);
  }

  // Delete all user references (views, likes, comments, reset tokens) and the user record
  await prisma.$transaction([
    prisma.videoView.deleteMany({ where: { userId: id } }),
    prisma.videoLike.deleteMany({ where: { userId: id } }),
    prisma.comment.deleteMany({ where: { userId: id } }),
    prisma.resetToken.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } })
  ]);

  return { id, message: "User account and all associated activity deleted permanently." };
};

// Admin blocks / unblocks / updates user status
const toggleUserStatusByAdminFromDB = async (id: string, status?: "active" | "delete") => {
  const isExistUser = await prisma.user.findUnique({ where: { id } });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  if (isExistUser.role === USER_ROLES.SUPER_ADMIN) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Cannot alter Super Admin status!");
  }

  const nextStatus = status || (isExistUser.status === "active" ? "delete" : "active");

  const updated = await prisma.user.update({
    where: { id },
    data: { status: nextStatus }
  });

  return {
    id: updated.id,
    status: updated.status,
    message:
      nextStatus === "active"
        ? "User account unblocked and activated."
        : "User account blocked and suspended."
  };
};

export const UserService = {
  getAllUsersToDB,
  getUserByIdFromDB,
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  deleteAccountFromDB,
  deleteUserByAdminFromDB,
  toggleUserStatusByAdminFromDB
};
