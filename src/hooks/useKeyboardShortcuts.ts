import { useEffect, useRef } from "react";

export interface KeyboardShortcut {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  key: string;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      for (const sc of shortcutsRef.current) {
        const wantCtrl = sc.ctrlKey ?? false;
        const hasCtrl = e.ctrlKey || e.metaKey;
        if (wantCtrl !== hasCtrl) continue;
        if ((sc.shiftKey ?? false) !== e.shiftKey) continue;
        if ((sc.altKey ?? false) !== e.altKey) continue;
        if (e.key.toLowerCase() !== sc.key.toLowerCase()) continue;
        e.preventDefault();
        sc.action();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
