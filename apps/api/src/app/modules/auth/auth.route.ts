import express from "express";

import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import { authLimiter, otpLimiter } from "../../middlewares/rateLimiter";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validateRequest(AuthValidation.createRegisterZodSchema),
  AuthController.registerUser
);

router.post(
  "/login",
  authLimiter,
  validateRequest(AuthValidation.createLoginZodSchema),
  AuthController.loginUser
);

router.post(
  "/forget-password",
  authLimiter,
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.forgetPassword
);

router.post(
  "/verify-email",
  otpLimiter,
  validateRequest(AuthValidation.createVerifyEmailZodSchema),
  AuthController.verifyEmail
);

router.post(
  "/reset-password",
  authLimiter,
  validateRequest(AuthValidation.createResetPasswordZodSchema),
  AuthController.resetPassword
);

router.post(
  "/change-password",
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  authLimiter,
  validateRequest(AuthValidation.createChangePasswordZodSchema),
  AuthController.changePassword
);

router.post("/resend-otp", authLimiter, auth(USER_ROLES.USER), AuthController.resendOtp);

export const AuthRoutes = router;
