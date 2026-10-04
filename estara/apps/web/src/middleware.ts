import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./i18n/config";

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (pathnameHasLocale) return NextResponse.next();

  const preferred =
    request.cookies.get("ESTARA_LOCALE")?.value ??
    request.headers.get("accept-language")?.split(",")[0]?.split("-")[0] ??
    defaultLocale;

  const locale = (locales as readonly string[]).includes(preferred) ? preferred : defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}
