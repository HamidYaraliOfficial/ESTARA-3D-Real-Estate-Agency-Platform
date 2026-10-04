"use client";

import { Check, Moon, Palette, Sun, SquareStack } from "lucide-react";
import { useState } from "react";
import { Theme, useTheme } from "./theme-provider";
import { useLocale } from "@/i18n/locale-provider";

const THEME_ICON: Record<Theme, React.ReactNode> = {
  light: <Sun size={16} />,
  dark: <Moon size={16} />,
  windows: <SquareStack size={16} />,
  red: <Palette size={16} className="text-red-500" />,
  blue: <Palette size={16} className="text-blue-500" />,
};

const THEME_SWATCH: Record<Theme, string> = {
  light: "#ffffff",
  dark: "#111827",
  windows: "#0078d4",
  red: "#e11d3c",
  blue: "#1d6fe0",
};

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle theme menu"
        className="mica-surface flex h-9 w-9 items-center justify-center rounded-win"
      >
        {THEME_ICON[theme]}
      </button>

      {open && (
        <div
          role="menu"
          className="mica-surface absolute end-0 z-50 mt-2 w-44 overflow-hidden rounded-win py-1 shadow-lg"
        >
          {themes.map((option) => (
            <button
              key={option}
              role="menuitem"
              onClick={() => {
                setTheme(option);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-accent/10"
            >
              <span
                className="inline-block h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: THEME_SWATCH[option] }}
              />
              <span className="flex-1">{t(`theme.${option}`)}</span>
              {theme === option && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
