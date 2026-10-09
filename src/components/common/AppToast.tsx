"use client";

import { useEffect, useState } from "react";
import { subscribeToToast, ToastPayload } from "@/lib/utils/toast";

export default function AppToast() {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToToast((nextToast) => {
      setToast(nextToast);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => setToast(null), toast.duration ?? 2600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div
        className={`max-w-md rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${
          toast.tone === "success"
            ? "border-green-300 bg-green-100 text-green-900 dark:border-green-700 dark:bg-green-950/80 dark:text-green-100"
            : toast.tone === "error"
              ? "border-red-300 bg-red-100 text-red-900 dark:border-red-700 dark:bg-red-950/80 dark:text-red-100"
              : "border-blue-300 bg-blue-100 text-blue-900 dark:border-blue-700 dark:bg-blue-950/80 dark:text-blue-100"
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="text-sm font-medium">{toast.message}</div>
      </div>
    </div>
  );
}
