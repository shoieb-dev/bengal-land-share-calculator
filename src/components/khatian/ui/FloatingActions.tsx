"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Moon, Printer, Sun } from "lucide-react";
import type { Theme } from "@/hooks/useTheme";
import { toBengaliNumber } from "@/lib/conversions/numberConversion";

interface FloatingActionsProps {
  showPrint: boolean;
  totalShareAna: number;
  totalSharePercentage: number;
  totalShareAnaStatus: "over" | "under" | "full";
  theme: Theme;
  onToggleTheme: () => void;
  mounted: boolean;
}

export default function FloatingActions({
  showPrint,
  totalShareAna,
  totalSharePercentage,
  totalShareAnaStatus,
  theme,
  onToggleTheme,
  mounted,
}: FloatingActionsProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const isDark = mounted ? theme === "dark" : true;
  const themeLabel = mounted ? (theme === "dark" ? "লাইট" : "ডার্ক") : "থিম";
  const themeTitle = isDark ? "লাইট মোডে যান" : "ডার্ক মোডে যান";
  const totalShareTooltip = `মোট মালিকানা: ${toBengaliNumber(totalShareAna.toFixed(2))} / ১৬ আনা (${toBengaliNumber(totalSharePercentage.toFixed(2))}%)`;
  const anaFillPercentage = Math.min(Math.max((totalShareAna / 16) * 100, 0), 100);
  const anaColorClasses =
    totalShareAnaStatus === "over"
      ? { text: "text-red-300", fill: "bg-red-400" }
      : totalShareAnaStatus === "full"
        ? { text: "text-emerald-300", fill: "bg-emerald-400" }
        : { text: "text-cyan-300", fill: "bg-cyan-400" };

  useEffect(() => {
    const updateVisibility = () => setShowBackToTop(window.scrollY > 300);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <>
      <div
        role="group"
        aria-label={totalShareTooltip}
        tabIndex={0}
        title={totalShareTooltip}
        className="print-hide print:hidden fixed left-1 top-1/2 z-40 hidden h-64 w-14 -translate-y-1/2 flex-col items-center rounded-2xl border border-white/15 bg-slate-900/90 p-2 shadow-xl shadow-black/20 backdrop-blur-md sm:left-4 sm:h-72 sm:w-16 xl:flex xl:w-16"
      >
        <span className={`text-sm font-bold leading-tight sm:text-base ${anaColorClasses.text}`}>
          {toBengaliNumber(totalShareAna.toFixed(2))}
        </span>
        <span className="text-xs leading-tight text-slate-300 sm:text-sm">আনা</span>

        <div className="relative mt-3 w-full flex-1">
          <div className="absolute inset-y-0 right-0 w-3 overflow-hidden rounded-full bg-slate-700/80">
            <div
              className={`absolute bottom-0 left-0 w-full rounded-full ${anaColorClasses.fill} transition-[height] duration-300`}
              style={{ height: `${anaFillPercentage}%` }}
            />
          </div>
          {[16, 12, 8, 4, 0].map((mark, index) => {
            const position = index * 25;
            const verticalAlignment =
              index === 0 ? "translate-y-0" : index === 4 ? "-translate-y-full" : "-translate-y-1/2";

            return (
              <div
                key={mark}
                className={`absolute right-0 z-10 flex w-full ${verticalAlignment}`}
                style={{ top: `${position}%` }}
              >
                <span className="w-6 text-right text-[11px] font-medium leading-none text-slate-300 sm:text-xs">
                  {toBengaliNumber(String(mark))}
                </span>
                <span className="w-3 border-t border-white/45" />
              </div>
            );
          })}
        </div>
      </div>
      <div className="print-hide fixed bottom-4 right-3 z-50 flex flex-col items-end gap-2 md:right-5">
        {showPrint && (
          <button
            type="button"
            onClick={() => window.print()}
            title="প্রিন্ট করুন"
            aria-label="প্রিন্ট করুন"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white/90 text-gray-700 shadow-lg backdrop-blur transition hover:bg-gray-100 active:scale-95 dark:border-gray-600 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-700 md:h-12 md:w-12"
          >
            <Printer size={20} />
          </button>
        )}
        <button
          type="button"
          onClick={onToggleTheme}
          title={themeTitle}
          aria-label={themeTitle}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white/90 text-gray-700 shadow-lg backdrop-blur transition hover:bg-gray-100 active:scale-95 dark:border-gray-600 dark:bg-gray-800/90 dark:text-yellow-300 dark:hover:bg-gray-700 md:h-12 md:w-12"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span className="sr-only">{themeLabel}</span>
        </button>
        <button
          type="button"
          onClick={() =>
            window.scrollTo({
              top: showBackToTop ? 0 : document.documentElement.scrollHeight,
              behavior: "smooth",
            })
          }
          title={showBackToTop ? "উপরে যান" : "নিচে যান"}
          aria-label={showBackToTop ? "পৃষ্ঠার উপরে যান" : "পৃষ্ঠার নিচে যান"}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white/90 text-gray-700 shadow-lg backdrop-blur transition hover:bg-gray-100 active:scale-95 dark:border-gray-600 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-700 md:h-12 md:w-12"
        >
          {showBackToTop ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
        </button>
      </div>
    </>
  );
}
