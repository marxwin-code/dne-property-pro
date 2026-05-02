"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LangSwitch } from "./lang-switch";
import { useSiteText } from "@/lib/i18n/use-site-text";

export function Navbar() {
  const pathname = usePathname();
  const t = useSiteText();

  const navItems = [
    { label: t.nav.nav_home, href: "/" },
    { label: t.nav.nav_about, href: "/about" },
    { label: t.nav.nav_services, href: "/services" },
    { label: t.nav.nav_projects, href: "/projects" },
    { label: t.nav.nav_properties, href: "/properties" },
    { label: t.nav.nav_risk_report, href: "/risk-report" },
    { label: t.nav.nav_house_package, href: "/house-package" },
    { label: t.nav.nav_labs, href: "/labs" },
    { label: t.nav.nav_contact, href: "/contact" }
  ];

  const labsSectionActive =
    pathname.startsWith("/labs") ||
    pathname.startsWith("/compare") ||
    pathname.startsWith("/personality");
  const propertiesActive =
    pathname === "/properties" || pathname.startsWith("/properties/");
  const packageActive =
    pathname === "/house-package" || pathname.startsWith("/house-package/");

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-lux-surface/95 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="group flex flex-col items-center sm:items-start">
          <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-lux-gold">
            {t.brand.de}
          </span>
          <span className="text-base font-semibold tracking-tight text-white transition group-hover:text-lux-gold sm:text-lg">
            {t.brand.product}
          </span>
        </Link>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-5">
          <nav aria-label={t.nav.mainAria}>
            <ul className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:gap-x-2">
              {navItems.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : item.href === "/house-package"
                      ? packageActive
                      : item.href === "/properties"
                        ? propertiesActive
                        : item.href === "/labs"
                          ? labsSectionActive
                          : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`relative px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lux-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-surface sm:text-[13px] ${
                        active ? "text-white" : "text-lux-muted hover:text-white"
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

          <div className="flex items-center gap-3 sm:gap-4">
            <LangSwitch />
            <Link
              href="/#interactive-360-home"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-900/30 transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-surface sm:text-sm"
            >
              {t.nav.button_start}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
