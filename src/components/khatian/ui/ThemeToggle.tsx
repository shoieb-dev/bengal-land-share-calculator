"use client";

import { Moon, Sun } from "lucide-react";
import type { Theme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  mounted: boolean;
  variant?: "header" | "floating";
}

export default function ThemeToggle({ theme, onToggle, mounted, variant = "header" }: ThemeToggleProps) {
  const isDark = mounted ? theme === "dark" : true;
  const label = mounted ? (theme === "dark" ? "লাইট" : "ডার্ক") : "থিম";
  const title = isDark ? "লাইট মোডে যান" : "ডার্ক মোডে যান";

  if (variant === "floating") {
    return (
      <button
        onClick={onToggle}
        title={title}
        aria-label={title}
        className="print-hide fixed z-50 right-3 md:right-5 bottom-1 -translate-y-1/2 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full border shadow-lg backdrop-blur transition active:scale-95 bg-white/90 border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-gray-800/90 dark:border-gray-600 dark:text-yellow-300 dark:hover:bg-gray-700"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
        <span className="sr-only">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      title={title}
      aria-label={title}
      className="flex items-center justify-center w-9 h-9 rounded-lg border transition shadow-sm bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
    >
      {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
