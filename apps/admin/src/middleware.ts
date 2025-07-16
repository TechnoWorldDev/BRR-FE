import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Skip API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isAuthPath = pathname.startsWith("/auth");
  const isLoginPage = pathname === "/auth/login";
  const isRoot = pathname === "/";

  const userLoggedIn =
    request.cookies.get("userLoggedIn")?.value === "true";
  const bbrSession = request.cookies.get("bbr-session")?.value;
  const isLoggedIn = userLoggedIn && bbrSession;

  // ✅ Allow unauthenticated users to remain on login page
  if (!isLoggedIn && isLoginPage) {
    return NextResponse.next();
  }

  // ✅ Redirect UNAUTHENTICATED user to login if accessing protected routes
  if (!isLoggedIn && !isAuthPath && !isRoot) {
    url.pathname = "/auth/login";
    url.search = `callbackUrl=${encodeURIComponent(pathname + search)}`;
    const response = NextResponse.redirect(url);
    response.cookies.delete("userLoggedIn");
    response.cookies.delete("bbr-session");
    return response;
  }

  // ✅ Redirect AUTHENTICATED user away from auth pages
  if (isLoggedIn && isAuthPath) {
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // ✅ Handle root path once
  if (isRoot) {
    if (isLoggedIn) {
      url.pathname = "/dashboard";
    } else {
      url.pathname = "/auth/login";
    }
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/brands/:path*",
    "/rankings/:path*",
    "/residences/:path*",
    "/user-management/:path*",
    "/career/:path*",
    "/bugs-and-features/:path*",
    "/auth/:path*",
    "/",
  ],
};
