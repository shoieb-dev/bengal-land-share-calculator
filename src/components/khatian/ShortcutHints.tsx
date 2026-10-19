"use client";

const HINTS: { keys: string; label: string }[] = [
  { keys: "Alt + N", label: "নতুন মালিক" },
  { keys: "Alt + Shift + N", label: "নতুন খতিয়ান" },
  { keys: "Ctrl + S", label: "সংরক্ষণ" },
  { keys: "Ctrl + O", label: "লাইব্রেরি খুলুন" },
  { keys: "Ctrl + Enter", label: "ফলাফল হিসাব" },
  { keys: "Ctrl + Z / Ctrl + Y", label: "আগে / পরে" },
  { keys: "Esc", label: "পপআপ বন্ধ" },
];

export function ShortcutHints() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 text-[11px] text-gray-500 dark:text-gray-400">
      {HINTS.map((h) => (
        <span key={h.keys} className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-mono text-[10px]">
            {h.keys}
          </kbd>
          {h.label}
        </span>
      ))}
    </div>
  );
}
