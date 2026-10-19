"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dag, KhatiyanHeader, Owner } from "@/lib/types";

export interface WorkspaceSnapshot {
  header: KhatiyanHeader;
  owners: Owner[];
  dags: Dag[];
}

const MAX_HISTORY = 50;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function same(a: WorkspaceSnapshot, b: WorkspaceSnapshot): boolean {
  return (
    JSON.stringify(a.header) === JSON.stringify(b.header) &&
    JSON.stringify(a.owners) === JSON.stringify(b.owners) &&
    JSON.stringify(a.dags) === JSON.stringify(b.dags)
  );
}

/**
 * Workspace-level undo/redo.
 *
 * Design: coarsely snapshotted on discrete user actions (add/delete/reorder/
 * template-load/reset/new-workspace/load-entry) — NOT on every keystroke.
 * Typing in a name field fires dozens of onChange events; snapshotting those
 * would flood history and make one Ctrl+Z erase a single character.
 */
export function useWorkspaceHistory() {
  const pastRef = useRef<WorkspaceSnapshot[]>([]);
  const futureRef = useRef<WorkspaceSnapshot[]>([]);
  const stateRef = useRef<WorkspaceSnapshot | null>(null);
  const [pastVersion, setPastVersion] = useState(0);
  const [futureVersion, setFutureVersion] = useState(0);

  // Always track the latest state so commit() can diff.
  const sync = useCallback((snap: WorkspaceSnapshot) => {
    stateRef.current = clone(snap);
  }, []);

  const commit = useCallback((snap: WorkspaceSnapshot) => {
    const next = clone(snap);
    const prev = stateRef.current;
    stateRef.current = next;
    if (prev && same(prev, next)) return;
    if (prev) {
      pastRef.current.push(clone(prev));
      if (pastRef.current.length > MAX_HISTORY) {
        pastRef.current.splice(0, pastRef.current.length - MAX_HISTORY);
      }
      setPastVersion((v) => v + 1);
    }
    if (futureRef.current.length > 0) {
      futureRef.current = [];
      setFutureVersion((v) => v + 1);
    }
  }, []);

  const undo = useCallback((): WorkspaceSnapshot | null => {
    const current = stateRef.current;
    if (pastRef.current.length === 0 || !current) return null;
    const restored = pastRef.current.pop() as WorkspaceSnapshot;
    setPastVersion((v) => v + 1);
    futureRef.current.unshift(clone(current));
    if (futureRef.current.length > MAX_HISTORY) futureRef.current.length = MAX_HISTORY;
    setFutureVersion((v) => v + 1);
    stateRef.current = clone(restored);
    return clone(restored);
  }, []);

  const redo = useCallback((): WorkspaceSnapshot | null => {
    const current = stateRef.current;
    if (futureRef.current.length === 0 || !current) return null;
    const restored = futureRef.current.shift() as WorkspaceSnapshot;
    setFutureVersion((v) => v + 1);
    pastRef.current.push(clone(current));
    if (pastRef.current.length > MAX_HISTORY) {
      pastRef.current.splice(0, pastRef.current.length - MAX_HISTORY);
    }
    setPastVersion((v) => v + 1);
    stateRef.current = clone(restored);
    return clone(restored);
  }, []);

  const clear = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
    setPastVersion((v) => v + 1);
    setFutureVersion((v) => v + 1);
  }, []);

  // Read lengths during render (refs mutated synchronously + version bump re-renders).
  void pastVersion;
  void futureVersion;

  return {
    sync,
    commit,
    undo,
    redo,
    clear,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  };
}
