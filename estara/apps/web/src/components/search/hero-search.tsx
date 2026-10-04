"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/i18n/locale-provider";

const TABS = [
  { key: "buy", listingType: "BUY" },
  { key: "rent", listingType: "RENT" },
  { key: "commercial", listingType: "COMMERCIAL" },
  { key: "land", listingType: "LAND" },
  { key: "newProject", listingType: "NEW_PROJECT" },
] as const;

export function HeroSearch() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("buy");
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const listingType = TABS.find((tab) => tab.key === activeTab)?.listingType ?? "BUY";
    const params = new URLSearchParams({ listingType, q: query });
    router.push(`/${locale}/properties?${params.toString()}`);
  }

  return (
    <div className="mica-surface w-full max-w-2xl rounded-win p-2">
      <div
        role="tablist"
        aria-label="Listing type"
        className="mb-2 flex flex-wrap gap-1 px-1 pt-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-win px-3 py-1.5 text-sm transition ${
              activeTab === tab.key
                ? "accent-bg"
                : "text-foreground/70 hover:bg-accent/10"
            }`}
          >
            {t(`hero.tabs.${tab.key}`)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-1">
        <Search size={18} className="ms-2 shrink-0 text-muted" aria-hidden />
        <label htmlFor="hero-search-input" className="sr-only">
          {t("hero.searchPlaceholder")}
        </label>
        <input
          id="hero-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("hero.searchPlaceholder")}
          className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="accent-bg h-11 shrink-0 rounded-win px-5 text-sm font-medium"
        >
          {t("hero.cta")}
        </button>
      </form>
    </div>
  );
}
