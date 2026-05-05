import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Production host pairs that should collapse to one canonical host (from NEXT_PUBLIC_SITE_URL / SITE_URL).
 * Mixed www/apex causes cross-origin RSC fetches and Safari/WebKit "access control checks" failures.
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
  const reqHost = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  if (!PROD_HOSTS.has(reqHost)) {
    return NextResponse.next();
  }

  const want = canonicalHostname();
  if (reqHost === want) {
    return NextResponse.next();
  }

  const dest = request.nextUrl.clone();
  dest.hostname = want;
  dest.protocol = "https:";
  return NextResponse.redirect(dest, 308);
}

export const config = {
  matcher: [
    /*
     * All paths except Next internals and static assets (same pattern as Next docs).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
  ]
};
