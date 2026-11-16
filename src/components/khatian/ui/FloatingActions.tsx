"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Moon, Printer, Sun } from "lucide-react";
import type { Theme } from "@/hooks/useTheme";

interface FloatingActionsProps {
  showPrint: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  mounted: boolean;
}

export default function FloatingActions({
  showPrint,
  theme,
  onToggleTheme,
  mounted,
}: FloatingActionsProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const isDark = mounted ? theme === "dark" : true;
  const themeLabel = mounted ? (theme === "dark" ? "লাইট" : "ডার্ক") : "থিম";
  const themeTitle = isDark ? "লাইট মোডে যান" : "ডার্ক মোডে যান";

  useEffect(() => {
    const updateVisibility = () => setShowBackToTop(window.scrollY > 300);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <>
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="উপরে যান"
          aria-label="পৃষ্ঠার উপরে যান"
          className="print-hide fixed z-50 right-3 md:right-5 bottom-4 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full border shadow-lg backdrop-blur transition active:scale-95 bg-white/90 border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-gray-800/90 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowUp size={20} />
        </button>
      )}
      <button
        type="button"
        onClick={onToggleTheme}
        title={themeTitle}
        aria-label={themeTitle}
        className="print-hide fixed z-50 right-3 md:right-5 bottom-[4.5rem] flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full border shadow-lg backdrop-blur transition active:scale-95 bg-white/90 border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-gray-800/90 dark:border-gray-600 dark:text-yellow-300 dark:hover:bg-gray-700"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
        <span className="sr-only">{themeLabel}</span>
      </button>
      {showPrint && (
        <button
          type="button"
          onClick={() => window.print()}
          title="প্রিন্ট করুন"
          aria-label="প্রিন্ট করুন"
          className="print-hide fixed z-50 right-3 md:right-5 bottom-32 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full border shadow-lg backdrop-blur transition active:scale-95 bg-white/90 border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-gray-800/90 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Printer size={20} />
        </button>
      )}
    </>
  );
}
