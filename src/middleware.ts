import { UserRole } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleRoutes: Record<string, UserRole[]> = {
  "/super-admin": [UserRole.SUPER_ADMIN],
  "/admin": [UserRole.RESTAURANT_ADMIN],
  "/waiter": [UserRole.WAITER],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/order/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/public")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const matchedPrefix = Object.keys(roleRoutes).find((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!matchedPrefix && !pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/api/super-admin") && token.role !== UserRole.SUPER_ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (pathname.startsWith("/api/admin") && token.role !== UserRole.RESTAURANT_ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (pathname.startsWith("/api/waiter") && token.role !== UserRole.WAITER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allowedRoles = roleRoutes[matchedPrefix ?? ""];
  if (matchedPrefix && allowedRoles && !allowedRoles.includes(token.role as UserRole)) {
    if (token.role === UserRole.SUPER_ADMIN) {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    }
    if (token.role === UserRole.RESTAURANT_ADMIN) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/waiter", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/admin/:path*",
    "/waiter/:path*",
    "/api/admin/:path*",
    "/api/super-admin/:path*",
    "/api/waiter/:path*",
  ],
};
