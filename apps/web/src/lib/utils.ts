import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export type MediaUrlOptions = {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "mp4";
  asThumbnail?: boolean;
};

export function getMediaUrl(path?: string | null, options?: MediaUrlOptions): string {
  if (!path) return "";

  if (path.startsWith("blob:")) {
    return path;
  }

  let resolvedUrl = path;

  if (!path.startsWith("http://") && !path.startsWith("https://")) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const origin = apiBase.replace(/\/api\/v1\/?$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    resolvedUrl = `${origin}${cleanPath}`;
  }

  // Cloudinary dynamic optimization injection
  if (resolvedUrl.includes("res.cloudinary.com") && resolvedUrl.includes("/upload/")) {
    // If it's a video and thumbnail is requested
    if (options?.asThumbnail) {
      resolvedUrl = resolvedUrl.replace(/\.(mp4|webm|mkv|mov|avi|m4v)(\?.*)?$/i, ".jpg");
      const transformParams = ["so_0", "f_auto", "q_auto"];
      if (options?.width) transformParams.push(`w_${options.width}`);
      if (options?.height) transformParams.push(`h_${options.height}`);

      const transformStr = `${transformParams.join(",")}/`;
      if (!resolvedUrl.includes("f_auto,q_auto") && !resolvedUrl.includes("so_0")) {
        resolvedUrl = resolvedUrl.replace("/upload/", `/upload/${transformStr}`);
      }
      return resolvedUrl;
    }

    // Default fast auto-format and auto-quality
    const transformParams: string[] = ["f_auto", "q_auto"];
    if (options?.width) transformParams.push(`w_${options.width}`);
    if (options?.height) transformParams.push(`h_${options.height}`);

    const transformStr = `${transformParams.join(",")}/`;
    if (!resolvedUrl.includes("f_auto,q_auto") && !resolvedUrl.includes("q_auto")) {
      resolvedUrl = resolvedUrl.replace("/upload/", `/upload/${transformStr}`);
    }
  }

  return resolvedUrl;
}

export function getVideoThumbnail(
  videoUrl?: string | null,
  customThumbnailUrl?: string | null
): string {
  if (customThumbnailUrl) {
    return getMediaUrl(customThumbnailUrl, { width: 400 });
  }
  if (videoUrl && videoUrl.includes("res.cloudinary.com")) {
    return getMediaUrl(videoUrl, { asThumbnail: true, width: 400 });
  }
  return "";
}
