// Allowed origins for CORS
export const allowedOrigins: string[] = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "https://admin.kuriusapp.cloud",
  "https://api.kuriusapp.cloud",
  "https://kuriusapp.cloud",
  "https://www.kuriusapp.cloud",
  "http://admin.kuriusapp.cloud",
  "http://api.kuriusapp.cloud",
  "http://kuriusapp.cloud",
  "http://www.kuriusapp.cloud"
];

export const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) return true; // allow non-browser clients (Postman/mobile/server-to-server)
  if (allowedOrigins.includes(origin)) return true;

  // Allow any subdomain of kuriusapp.cloud (both https and http)
  if (
    origin.endsWith(".kuriusapp.cloud") ||
    origin.includes("://admin.kuriusapp.cloud") ||
    origin.includes("://api.kuriusapp.cloud") ||
    origin.includes("://kuriusapp.cloud")
  ) {
    return true;
  }

  // Allow local network origins in development (10.x.x.x, 192.168.x.x, 172.x.x.x)
  if (process.env.NODE_ENV === "development") {
    if (
      origin.startsWith("http://10.") ||
      origin.startsWith("https://10.") ||
      origin.startsWith("http://192.168.") ||
      origin.startsWith("https://192.168.") ||
      origin.startsWith("http://172.") ||
      origin.startsWith("https://172.")
    ) {
      return true;
    }
  }

  return false;
};
