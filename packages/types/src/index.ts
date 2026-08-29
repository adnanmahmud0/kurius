/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errorMessages?: Array<{
    path: string | number;
    message: string;
  }>;
  stack?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage?: number;
}

/**
 * Common User interface
 */
export interface IUser {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  avatar?: string | null;
  location?: string | null;
  contact?: string | null;
  verified?: boolean;
  provider?: string | null;
  status?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  stats?: {
    videosCreated?: number;
    viewsCount?: number;
    likesCount?: number;
    commentsCount?: number;
  };
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string | null;
  status: "active" | "delete";
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    videos: number;
  };
}

export interface IMotivationalMessage {
  id: string;
  message: string;
  author?: string | null;
  status: "active" | "delete";
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IVideo {
  id: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug?: string;
  };
  hashtags: string[];
  status: "active" | "delete";
  createdBy: string;
  creator?: {
    id: string;
    name: string;
    avatar?: string | null;
    email?: string;
  };
  storageType: "local" | "cloudinary";
  publicId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  isLiked?: boolean;
  stats?: {
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
  };
}

export interface IComment {
  id: string;
  userId: string;
  videoId: string;
  commentText: string;
  status: "active" | "delete";
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface IStorageSetting {
  id: string;
  provider: "local" | "cloudinary";
  cloudName?: string | null;
  apiKey?: string | null;
  hasApiSecret: boolean;
  updatedAt: string | Date;
}

export interface ILegalPolicy {
  id: string;
  type: "privacy" | "terms";
  title: string;
  content: string;
  updatedAt: string | Date;
  createdAt: string | Date;
}
