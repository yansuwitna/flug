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
  const isGuruRoute = pathname.startsWith("/guru") || pathname.startsWith("/teacher");
  const isSiswaRoute = pathname.startsWith("/siswa") || pathname.startsWith("/student");

  // Kompatibilitas redirect url lama ke url baru bahasa indonesia
  if (pathname === "/admin/dashboard") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (pathname === "/teacher/dashboard" || pathname === "/teacher") {
    return NextResponse.redirect(new URL("/guru", request.url));
  }
  if (pathname.startsWith("/teacher/")) {
    return NextResponse.redirect(new URL(pathname.replace("/teacher/", "/guru/"), request.url));
  }
  if (pathname === "/student/dashboard" || pathname === "/student" || pathname === "/siswa/dashboard") {
    return NextResponse.redirect(new URL("/siswa", request.url));
  }
  if (pathname.startsWith("/student/")) {
    return NextResponse.redirect(new URL(pathname.replace("/student/", "/siswa/"), request.url));
  }

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
      session = null;
    }
  }

  // Jika sudah login dan mencoba mengakses route auth (/login), redirect ke dashboard role-nya
  if (isAuthRoute && session) {
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else if (session.role === "GURU") {
      return NextResponse.redirect(new URL("/guru", request.url));
    } else {
      return NextResponse.redirect(new URL("/siswa", request.url));
    }
  }

  // Rute terlindungi butuh login
  const isProtectedRoute = isAdminRoute || isGuruRoute || isSiswaRoute;

  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // RBAC checks
  if (isAdminRoute && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isGuruRoute && session?.role !== "GURU" && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isSiswaRoute && session?.role !== "SISWA" && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/guru/:path*",
    "/siswa/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/login",
  ],
};
