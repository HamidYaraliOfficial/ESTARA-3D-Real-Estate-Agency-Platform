import { locales, isLocale, localeDirection, defaultLocale } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/locale-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Navbar } from "@/components/layout/navbar";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dir = localeDirection[locale];

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LocaleProvider locale={locale}>
            <Navbar />
            <main className="min-h-screen pt-20">{children}</main>
            <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted">
              ESTARA © {new Date().getFullYear()} — all rights reserved.
            </footer>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
