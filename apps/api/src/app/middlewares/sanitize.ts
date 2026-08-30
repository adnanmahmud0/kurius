import { NextFunction, Request, Response } from "express";
import xss from "xss";

/**
 * Recursively sanitizes strings in an object or array to prevent stored/reflected XSS.
 * Skips password and token fields so hashes/secrets are not altered.
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return xss(value.trim());
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      // Don't sanitize passwords, secrets, or raw code/markdown fields that need exact tokens
      if (
        key.toLowerCase().includes("password") ||
        key.toLowerCase().includes("token") ||
        key.toLowerCase().includes("secret") ||
        key === "content" // Preserve markdown in legal content
      ) {
        sanitizedObj[key] = val;
      } else {
        sanitizedObj[key] = sanitizeValue(val);
      }
    }
    return sanitizedObj;
  }
  return value;
}

export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeValue(req.query) as any;
  }
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeValue(req.params) as any;
  }
  next();
};
