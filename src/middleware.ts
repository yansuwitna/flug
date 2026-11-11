import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "flag_hunter_jwt_super_secret_auth_key_2026_xyz123"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/forgot-password");
  const isAdminRoute = pathname.startsWith("/admin");
  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/student");
  const isWorkspaceRoute = pathname.startsWith("/missions");

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let session: { userId: string; role: string; name: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = {
        userId: payload.userId as string,
        role: payload.role as string,
        name: payload.name as string,
      };
    } catch {
      // Invalid/expired token
      session = null;
    }
  }

  // Jika sudah login dan mencoba mengakses route auth (/login), redirect ke dashboard role-nya
  if (isAuthRoute && session) {
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (session.role === "TEACHER") {
      return NextResponse.redirect(new URL("/teacher/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  // Rute terlindungi butuh login
  const isProtectedRoute = isAdminRoute || isTeacherRoute || isStudentRoute || isWorkspaceRoute;

  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // RBAC checks
  if (isAdminRoute && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isTeacherRoute && session?.role !== "TEACHER" && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isStudentRoute && session?.role !== "STUDENT" && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/missions/:path*",
    "/login",
    "/forgot-password",
  ],
};
