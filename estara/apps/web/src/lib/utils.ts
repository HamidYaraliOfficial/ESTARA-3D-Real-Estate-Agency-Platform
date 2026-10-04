import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD", locale = "en"): string {
  try {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale === "zh" ? "zh-CN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatDateTime(iso: string, locale = "en"): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : locale === "zh" ? "zh-CN" : "en-US", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(date);
}
