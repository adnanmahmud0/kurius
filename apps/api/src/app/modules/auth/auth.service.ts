import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { JwtPayload, Secret } from "jsonwebtoken";

import config from "../../../config";
import { USER_ROLES } from "../../../enums/user";
import ApiError from "../../../errors/ApiError";
import { emailHelper } from "../../../helpers/emailHelper";
import { jwtHelper } from "../../../helpers/jwtHelper";
import { emailTemplate } from "../../../shared/emailTemplate";
import prisma from "../../../shared/prisma";
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IRegisterData,
  IVerifyEmail
} from "../../../types/auth";
import cryptoToken from "../../../util/cryptoToken";
import generateOTP from "../../../util/generateOTP";

//register
const registerUserToDB = async (payload: IRegisterData) => {
  const { name, email, password } = payload;
  const isExistUser = await prisma.user.findUnique({ where: { email } });
  if (isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User with this email already exists!");
  }

  const hashPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
  const otp = generateOTP();

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      role: USER_ROLES.USER,
      verified: false,
      authOneTimeCode: otp,
      authExpireAt: new Date(Date.now() + 3 * 60000)
    }
  });

  const values = {
    name: newUser.name,
    otp,
    email: newUser.email
  };
  const accountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(accountTemplate);

  return {
    email: newUser.email,
    message: "Registration successful! Please check your email for the verification OTP."
  };
};

//login
const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;
  const isExistUser = await prisma.user.findUnique({ where: { email } });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //check match password
  if (password && !(await bcrypt.compare(password, isExistUser.password || ""))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password is incorrect!");
  }

  //check verified and status
  if (!isExistUser.verified) {
    // Resend a fresh OTP
    const otp = generateOTP();
    await prisma.user.update({
      where: { id: isExistUser.id },
      data: {
        authOneTimeCode: otp,
        authExpireAt: new Date(Date.now() + 3 * 60000)
      }
    });

    const values = {
      name: isExistUser.name,
      otp,
      email: isExistUser.email
    };
    const resendTemplate = emailTemplate.createAccount(values);
    emailHelper.sendEmail(resendTemplate);

    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Please verify your account. A new verification OTP has been sent to your email."
    );
  }

  //check user status
  if (isExistUser.status === "delete") {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You don’t have permission to access this content. It looks like your account has been deactivated."
    );
  }

  //create access token
  const accessToken = jwtHelper.createToken(
    { id: isExistUser.id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  //create refresh token
  const refreshToken = jwtHelper.createToken(
    { id: isExistUser.id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expire_in as string
  );

  return { accessToken, refreshToken };
};

//forget password
const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await prisma.user.findUnique({ where: { email } });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: isExistUser.email
  };
  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  await prisma.user.update({
    where: { email },
    data: {
      authOneTimeCode: otp,
      authExpireAt: new Date(Date.now() + 3 * 60000)
    }
  });
};

//verify email
const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  const isExistUser = await prisma.user.findUnique({ where: { email } });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const now = new Date();

  // Check account lockout
  if (isExistUser.authLockUntil && now < isExistUser.authLockUntil) {
    const remainingMinutes = Math.ceil(
      (isExistUser.authLockUntil.getTime() - now.getTime()) / 60000
    );
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Too many failed OTP attempts. Account is temporarily locked. Please try again in ${remainingMinutes} minute(s).`
    );
  }

  if (!oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Please provide the OTP code sent to your email.");
  }

  // Verify OTP match
  if (isExistUser.authOneTimeCode !== oneTimeCode) {
    const currentAttempts = (isExistUser.authOneTimeCodeAttempts || 0) + 1;
    const maxAttempts = 5;

    if (currentAttempts >= maxAttempts) {
      // Lock account for 15 minutes and invalidate current OTP
      await prisma.user.update({
        where: { id: isExistUser.id },
        data: {
          authOneTimeCode: null,
          authExpireAt: null,
          authOneTimeCodeAttempts: currentAttempts,
          authLockUntil: new Date(Date.now() + 15 * 60 * 1000)
        }
      });
      throw new ApiError(
        StatusCodes.TOO_MANY_REQUESTS,
        "Maximum OTP attempts exceeded. Your account has been temporarily locked for 15 minutes for your security."
      );
    }

    await prisma.user.update({
      where: { id: isExistUser.id },
      data: {
        authOneTimeCodeAttempts: currentAttempts
      }
    });

    const remainingAttempts = maxAttempts - currentAttempts;
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Invalid OTP. You have ${remainingAttempts} attempt(s) remaining.`
    );
  }

  // Check expiration
  if (isExistUser.authExpireAt && now > isExistUser.authExpireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "OTP has expired. Please request a new verification code."
    );
  }

  let message;
  let data;

  if (!isExistUser.verified) {
    await prisma.user.update({
      where: { id: isExistUser.id },
      data: {
        verified: true,
        authOneTimeCode: null,
        authExpireAt: null,
        authOneTimeCodeAttempts: 0,
        authLockUntil: null
      }
    });
    message = "Email verified successfully";
  } else {
    await prisma.user.update({
      where: { id: isExistUser.id },
      data: {
        authIsResetPassword: true,
        authOneTimeCode: null,
        authExpireAt: null,
        authOneTimeCodeAttempts: 0,
        authLockUntil: null
      }
    });

    //create token ;
    const createToken = cryptoToken();
    await prisma.resetToken.create({
      data: {
        userId: isExistUser.id,
        token: createToken,
        expireAt: new Date(Date.now() + 5 * 60000)
      }
    });
    message =
      "Verification Successful: Please securely store and utilize this code for reset password";
    data = createToken;
  }
  return { data, message };
};

//forget password
const resetPasswordToDB = async (token: string, payload: IAuthResetPassword) => {
  const { newPassword, confirmPassword } = payload;

  const isExistToken = await prisma.resetToken.findFirst({
    where: { token }
  });

  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
  }

  const isExistUser = await prisma.user.findUnique({
    where: { id: isExistToken.userId }
  });

  if (!isExistUser?.authIsResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'"
    );
  }

  //validity check
  if (isExistToken.expireAt < new Date()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Token expired, Please click again to the forget password"
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "New password and Confirm password doesn't match!");
  }

  const hashPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

  await prisma.user.update({
    where: { id: isExistToken.userId },
    data: {
      password: hashPassword,
      authIsResetPassword: false
    }
  });
};

const changePasswordToDB = async (user: JwtPayload, payload: IChangePassword) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (currentPassword && !(await bcrypt.compare(currentPassword, isExistUser.password || ""))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password is incorrect");
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please give different password from current password"
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password and Confirm password doesn't matched");
  }

  //hash password
  const hashPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashPassword }
  });
};

// resend otp
const resendOtpToDB = async (email: string) => {
  const isExistUser = await prisma.user.findUnique({ where: { email } });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //generate new otp
  const otp = generateOTP();
  const values = {
    name: isExistUser.name,
    otp,
    email: isExistUser.email
  };

  const resendTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(resendTemplate);

  //save otp to DB
  await prisma.user.update({
    where: { id: isExistUser.id },
    data: {
      authOneTimeCode: otp,
      authExpireAt: new Date(Date.now() + 3 * 60000) // 3 minutes expiry
    }
  });

  return { message: "OTP resent successfully, please check your email" };
};

export const AuthService = {
  registerUserToDB,
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  resendOtpToDB
};
