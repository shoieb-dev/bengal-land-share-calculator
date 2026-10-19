"use client";

import { useEffect, useRef, useState } from "react";
import { Keyboard } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open ]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="কীবোর্ড শর্টকাট দেখুন"
        title="কীবোর্ড শর্টকাট (?)"
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-600 bg-gray-700/60 px-3 py-1.5 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
      >
        <Keyboard size={14} />
        <span className="hidden sm:inline">শর্টকাট</span>
        <kbd className="rounded border border-gray-600 bg-gray-800 px-1 font-mono text-[10px]">?</kbd>
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-xl border border-gray-600 bg-gray-800 p-3 shadow-2xl">
          <p className="mb-2 text-center text-xs font-semibold text-gray-200">কীবোর্ড শর্টকাট</p>
          <ul className="space-y-1.5">
            {HINTS.map((h) => (
              <li key={h.keys} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-gray-300">{h.label}</span>
                <kbd className="shrink-0 rounded border border-gray-600 bg-gray-700 px-1.5 py-0.5 font-mono text-[10px] text-gray-100">
                  {h.keys}
                </kbd>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

