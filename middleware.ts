import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/login", "/register", "/auth/callback"];

function getSupabaseEdgeEnv() {
  // Support both naming conventions to avoid production misconfig.
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPERBASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPERBASE_ANON_KEY;

  return { url, anonKey };
}

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

  const { url, anonKey } = getSupabaseEdgeEnv();
  // If env vars are missing in the Edge runtime, don't crash the middleware.
  // Let the request through so the app can surface a clearer error.
  if (!url || !anonKey) {
    return NextResponse.next();
  }

  // Supabase SSR middleware pattern (Edge-safe)
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!session && !isPublic) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/fase-1", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

