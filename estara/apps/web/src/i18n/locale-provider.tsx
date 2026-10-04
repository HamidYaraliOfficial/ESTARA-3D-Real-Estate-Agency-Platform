"use client";

import { createContext, useContext, useMemo } from "react";
import { Dictionary, Locale, getDictionary, translate } from "./config";

interface LocaleContextValue {
  locale: Locale;
  dict: Dictionary;
  t: (path: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo<LocaleContextValue>(() => {
    const dict = getDictionary(locale);
    return { locale, dict, t: (path: string) => translate(dict, path) };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
