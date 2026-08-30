import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host") || "";

  // If visited on admin subdomain, redirect public legal pages to main domain
  if (host.startsWith("admin.kuriusapp.cloud")) {
    if (pathname === "/privacy") {
      return NextResponse.redirect(new URL("https://kuriusapp.cloud/privacy"), 301);
    }
    if (pathname === "/terms") {
      return NextResponse.redirect(new URL("https://kuriusapp.cloud/terms"), 301);
    }
  }

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
  const isAuthRoute = pathname === "/login";

  if (pathname === "/register") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/register", "/privacy", "/terms"]
};
