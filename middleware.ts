import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/)
  ) {
    return NextResponse.next();
  }

  // Production-safe: keep middleware minimal for Vercel Edge runtime.
  // Auth/session checks are handled per-page using Supabase SSR.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

