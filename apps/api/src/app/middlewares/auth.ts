import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Secret } from "jsonwebtoken";

import config from "../../config";
import ApiError from "../../errors/ApiError";
import { jwtHelper } from "../../helpers/jwtHelper";
import prisma from "../../shared/prisma";

// Lightweight in-memory cache for user status checks (30s TTL)
type CachedUserStatus = { status: string; role: string; timestamp: number };
const userAuthCache = new Map<string, CachedUserStatus>();
const AUTH_CACHE_TTL = 30 * 1000; // 30 seconds

export const invalidateUserAuthCache = (userId: string) => {
  userAuthCache.delete(userId);
};

const auth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;
      if (!tokenWithBearer || !tokenWithBearer.startsWith("Bearer")) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }

      const token = tokenWithBearer.split(" ")[1];

      //verify token
      const verifyUser = jwtHelper.verifyToken(token, config.jwt.jwt_secret as Secret);

      // Check user existence and active status with 30s cache
      const now = Date.now();
      const cached = userAuthCache.get(verifyUser.id);
      let userStatus: { id: string; status: string; role: string } | null = null;

      if (cached && now - cached.timestamp < AUTH_CACHE_TTL) {
        userStatus = { id: verifyUser.id, status: cached.status, role: cached.role };
      } else {
        const activeUser = await prisma.user.findUnique({
          where: { id: verifyUser.id },
          select: { id: true, status: true, role: true }
        });

        if (activeUser) {
          userAuthCache.set(verifyUser.id, {
            status: activeUser.status,
            role: activeUser.role,
            timestamp: now
          });
          userStatus = activeUser;
        }
      }

      if (!userStatus) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Account no longer exists");
      }

      if (userStatus.status === "delete") {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Your account has been suspended/blocked. Please contact support."
        );
      }

      //set user to header
      req.user = verifyUser;

      //guard user role
      if (roles.length && !roles.includes(userStatus.role)) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You don't have permission to access this api");
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export const authOptional = () => async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const tokenWithBearer = req.headers.authorization;
    if (tokenWithBearer && tokenWithBearer.startsWith("Bearer")) {
      const token = tokenWithBearer.split(" ")[1];
      if (token) {
        try {
          const verifyUser = jwtHelper.verifyToken(token, config.jwt.jwt_secret as Secret);
          req.user = verifyUser;
        } catch {
          // Proceed as unauthenticated guest
        }
      }
    }
    next();
  } catch {
    next();
  }
};

export default auth;
