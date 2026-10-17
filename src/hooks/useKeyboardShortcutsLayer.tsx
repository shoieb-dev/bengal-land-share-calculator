"use client";

import { useMemo } from "react";
import { useKeyboardShortcuts, type KeyboardShortcut } from "./useKeyboardShortcuts";

export type KhatiyanShortcutAction =
  | "new-owner"
  | "new-khatiyan"
  | "save"
  | "open-library"
  | "calculate"
  | "close-modals";

function dispatchShortcut(action: KhatiyanShortcutAction) {
  window.dispatchEvent(new CustomEvent<string>("khatiyan-shortcut", { detail: action }));
}

export function KeyboardShortcutsLayer() {

  const shortcuts: KeyboardShortcut[] = useMemo(
    () => [
    // Navigation
    {
      key: "Escape",
      description: "খোলা উইন্ডো বন্ধ করুন এবং ফর্ম মোড বাতিল করুন",
      action: () => dispatchShortcut("close-modals"),
    },

    // Fast navigation
    {
      ctrlKey: true,
      key: "N",
      description: "নতুন মালিক (New Owner)",
      action: () => dispatchShortcut("new-owner"),
    },
    {
      ctrlKey: true,
      shiftKey: true,
      key: "N",
      description: "নতুন খতিয়ান (New Khatiyan)",
      action: () => dispatchShortcut("new-khatiyan"),
    },
    {
      ctrlKey: true,
      key: "S",
      description: "সেভ (Save)",
      action: () => dispatchShortcut("save"),
    },
    {
      ctrlKey: true,
      key: "Enter",
      description: "ফলাফল হিসাব (Calculate)",
      action: () => dispatchShortcut("calculate"),
    },
    {
      ctrlKey: true,
      key: "O",
      description: "খতিয়ান খুলুন (Open Khatiyan)",
      action: () => dispatchShortcut("open-library"),
    },
    ],
    [],
  );

  useKeyboardShortcuts(shortcuts);

  return null;
}

