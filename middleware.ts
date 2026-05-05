import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Production host pairs that should collapse to one canonical host (from NEXT_PUBLIC_SITE_URL / SITE_URL).
 * Mixed www/apex causes cross-origin RSC fetches and Safari/WebKit "access control checks" failures.
 * `/api/*` is excluded: redirecting POST/fetch (e.g. invoice-extract) across hosts triggers CORS failures.
 */
const PROD_HOSTS = new Set(["depropertypro.com", "www.depropertypro.com"]);

function canonicalHostname(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "https://depropertypro.com";
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return "depropertypro.com";
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Skip excluded paths
  if (pathname === "/login" || pathname.startsWith("/api") || pathname.startsWith("/_next") || /\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next();
  }

  const reqHost = request.headers.get("host");
  const want = canonicalHostname();
  if (!reqHost) return NextResponse.next();

  // Already on canonical host -> no redirect
  if (reqHost === want) {
    return NextResponse.next();
  }

  // Host differs -> redirect
  const url = request.nextUrl.clone();
  url.hostname = want;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Pages only: skip /login, /api, /_next internals, and common static assets.
     */
    "/((?!login(?:/|$)|api(?:/|$)|_next(?:/|$)|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|json|woff|woff2|ttf)$).*)"
  ]
};
