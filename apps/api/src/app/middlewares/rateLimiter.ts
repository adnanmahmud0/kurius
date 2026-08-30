import rateLimit from "express-rate-limit";

/**
 * General API rate limiter
 * Allows 300 requests per minute per IP
 */
export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again in a minute."
  }
});

/**
 * Strict rate limiter for Authentication and OTP routes
 * Protects against brute-force password and OTP cracking
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes."
  }
});

/**
 * OTP Verification specific rate limiter
 * Maximum 10 OTP validation attempts per 15 minutes
 */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP verification attempts. Please wait 15 minutes."
  }
});
