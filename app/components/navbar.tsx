"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "D&E Labs", href: "/labs" },
  { label: "Contact", href: "/contact" }
];

export function Navbar() {
  const pathname = usePathname();
  const labsSectionActive =
    pathname.startsWith("/labs") ||
    pathname.startsWith("/compare") ||
    pathname.startsWith("/personality");

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-lux-surface/95 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="group flex flex-col items-center sm:items-start"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-lux-gold">
            D&amp;E
          </span>
          <span className="text-base font-semibold tracking-tight text-white transition group-hover:text-lux-gold sm:text-lg">
            Property Pro
          </span>
        </Link>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <nav aria-label="Main navigation">
            <ul className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:gap-x-2">
              {navItems.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : item.href === "/labs"
                      ? labsSectionActive
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`relative px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lux-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-surface sm:text-[13px] ${
                        active
                          ? "text-white"
                          : "text-lux-muted hover:text-white"
                      }`}
                    >
                      {item.label}
                      {active ? (
                        <span
                          className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-lux-gold to-transparent"
                          aria-hidden
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link
            href="/labs"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-lux-gold/35 bg-lux-gold/10 px-5 py-2 text-xs font-semibold text-lux-gold transition hover:border-lux-gold/60 hover:bg-lux-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lux-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-surface sm:text-sm"
          >
            Explore AI Tools
          </Link>
        </div>
      </div>
    </header>
  );
}
