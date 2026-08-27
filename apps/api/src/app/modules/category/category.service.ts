import { StatusCodes } from "http-status-codes";

import ApiError from "../../../errors/ApiError";
import prisma from "../../../shared/prisma";

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// Create category (Admin)
const createCategoryToDB = async (name: string) => {
  const slug = generateSlug(name);

  const isExist = await prisma.category.findFirst({
    where: {
      OR: [{ name: { equals: name, mode: "insensitive" } }, { slug }]
    }
  });

  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category with this name already exists!");
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      status: "active"
    }
  });

  return category;
};

// Get public active categories (User / Flutter / Web)
const getAllCategoriesFromDB = async () => {
  const categories = await prisma.category.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { videos: true }
      }
    }
  });

  return categories;
};

// Get admin categories with pagination and search
const getAdminCategoriesFromDB = async (query: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = query.search || "";

  const whereClause: any = {};
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } }
    ];
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { videos: true }
        }
      }
    }),
    prisma.category.count({ where: whereClause })
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit)
    },
    data: categories
  };
};

// Get single category by ID or Slug
const getCategoryByIdFromDB = async (idOrSlug: string) => {
  const category = await prisma.category.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }]
    },
    include: {
      _count: {
        select: { videos: true }
      }
    }
  });

  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
  }

  return category;
};

// Update category (Admin)
const updateCategoryInDB = async (
  id: string,
  payload: { name?: string; status?: "active" | "delete" }
) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
  }

  const updateData: any = {};
  if (payload.name) {
    updateData.name = payload.name;
    updateData.slug = generateSlug(payload.name);

    // Check conflict
    const isConflict = await prisma.category.findFirst({
      where: {
        id: { not: id },
        OR: [{ name: { equals: payload.name, mode: "insensitive" } }, { slug: updateData.slug }]
      }
    });

    if (isConflict) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Another category with this name already exists!"
      );
    }
  }

  if (payload.status) {
    updateData.status = payload.status;
  }

  const updated = await prisma.category.update({
    where: { id },
    data: updateData
  });

  return updated;
};

// Soft delete category (Admin)
const deleteCategoryFromDB = async (id: string) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
  }

  const deleted = await prisma.category.update({
    where: { id },
    data: { status: "delete" }
  });

  return deleted;
};

export const CategoryService = {
  createCategoryToDB,
  getAllCategoriesFromDB,
  getAdminCategoriesFromDB,
  getCategoryByIdFromDB,
  updateCategoryInDB,
  deleteCategoryFromDB
};
