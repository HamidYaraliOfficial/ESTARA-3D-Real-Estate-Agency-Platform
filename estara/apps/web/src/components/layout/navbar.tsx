"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/locale-provider";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LocaleSwitcher } from "./locale-switcher";

export function Navbar() {
  const { t, locale } = useLocale();

  const links = [
    { href: `/${locale}`, label: t("nav.discover") },
    { href: `/${locale}/properties`, label: t("nav.properties") },
    { href: `/${locale}/neighborhoods`, label: t("nav.neighborhoods") },
    { href: `/${locale}/agents`, label: t("nav.agents") },
    { href: `/${locale}/appointments`, label: t("nav.appointments") },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4">
      <nav className="mica-surface flex w-full max-w-6xl items-center justify-between rounded-win px-4 py-2">
        <Link href={`/${locale}`} className="text-lg font-semibold tracking-tight">
          ESTARA
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-foreground/80 transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeSwitcher />
        </div>
      </nav>
    </header>
  );
}
