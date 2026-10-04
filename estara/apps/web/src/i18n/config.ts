import en from "./locales/en.json";
import fa from "./locales/fa.json";
import zh from "./locales/zh.json";

export const locales = ["en", "fa", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  fa: "rtl",
  zh: "ltr",
};

export const localeLabel: Record<Locale, string> = {
  en: "English",
  fa: "فارسی",
  zh: "中文",
};

export const dictionaries = { en, fa, zh } as const;

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Very small dot-path translator: t(dict, "appointments.title"). */
export function translate(dict: Dictionary, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], dict);
  return typeof value === "string" ? value : path;
}
