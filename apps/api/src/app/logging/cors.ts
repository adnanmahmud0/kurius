// Allowed origins for CORS
export const allowedOrigins: string[] = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "https://admin.kuriusapp.cloud",
  "https://api.kuriusapp.cloud",
  "https://kuriusapp.cloud",
  "https://www.kuriusapp.cloud"
];

export const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) return true; // allow non-browser clients (Postman/mobile/server-to-server)
  if (allowedOrigins.includes(origin)) return true;

  // NOTE: previously this also accepted any origin containing "kuriusapp.cloud"
  // as a substring (origin.includes(...)), which let an attacker-controlled
  // domain like "https://kuriusapp.cloud.evil.com" or "https://evilkuriusapp.cloud"
  // pass the check. All legitimate production origins are already listed in
  // allowedOrigins above, so the exact-match check is sufficient — removed the
  // substring fallback instead of trying to patch it with endsWith().

  // Allow local network origins in development (10.x.x.x, 192.168.x.x, 172.x.x.x, localhost)
  if (process.env.NODE_ENV !== "production") {
    if (
      origin.startsWith("http://10.") ||
      origin.startsWith("https://10.") ||
      origin.startsWith("http://192.168.") ||
      origin.startsWith("https://192.168.") ||
      origin.startsWith("http://172.") ||
      origin.startsWith("https://172.") ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:")
    ) {
      return true;
    }
  }

  return false;
};
