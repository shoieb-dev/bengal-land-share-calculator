"use client";

import { Moon, Sun } from "lucide-react";
import type { Theme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  mounted: boolean;
}

export default function ThemeToggle({ theme, onToggle, mounted }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      title={theme === "dark" ? "লাইট মোডে যান" : "ডার্ক মোডে যান"}
      aria-label={theme === "dark" ? "লাইট মোডে যান" : "ডার্ক মোডে যান"}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border transition shadow-sm bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
    >
      {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      <span className="text-sm font-medium hidden sm:inline">
        {mounted ? (theme === "dark" ? "লাইট" : "ডার্ক") : "থিম"}
      </span>
    </button>
  );
}
