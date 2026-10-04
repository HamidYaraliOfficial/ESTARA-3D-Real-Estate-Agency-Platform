"use client";

import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { useState } from "react";
import { locales, localeLabel } from "@/i18n/config";
import { useLocale } from "@/i18n/locale-provider";

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);

  function switchTo(next: string) {
    const segments = pathname.split("/");
    segments[1] = next;
    document.cookie = `ESTARA_LOCALE=${next}; path=/; max-age=31536000`;
    router.push(segments.join("/") || `/${next}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mica-surface flex h-9 items-center gap-1.5 rounded-win px-3 text-sm"
      >
        <Globe size={16} />
        {localeLabel[locale]}
      </button>
      {open && (
        <div className="mica-surface absolute end-0 z-50 mt-2 w-36 overflow-hidden rounded-win py-1 shadow-lg">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => switchTo(l)}
              className="block w-full px-3 py-2 text-start text-sm hover:bg-accent/10"
            >
              {localeLabel[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
