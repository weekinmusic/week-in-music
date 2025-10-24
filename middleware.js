import { NextResponse } from "next/server";

// Match /admin and /api/week routes
export const config = {
  matcher: ["/admin/:path*", "/api/week/:path*"],
};

export function middleware(req) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("session-token");

  // If not logged in and accessing admin, redirect to login
  if (!token && url.pathname.startsWith("/admin")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // For API access, require a valid session token
  if (!token && url.pathname.startsWith("/api/week")) {
    return new Response("Unauthorized", { status: 401 });
  }

  return NextResponse.next();
}
