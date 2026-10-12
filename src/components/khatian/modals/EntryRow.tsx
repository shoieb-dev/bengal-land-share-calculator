"use client";
import { useState } from "react";
import { FolderOpen, Layers, Pencil, Trash2, Users } from "lucide-react";
import { SavedKhatiyanEntry } from "@/lib/utils/khatiyanLibrary";
import { formatTimeAgo } from "@/lib/utils/storage";
import { toBengaliNumber as toBn } from "@/lib/conversions/numberConversion";
import { SavedKhatiyansModalProps } from "./SavedKhatiyansModal";

interface EntryRowProps {
  entry: SavedKhatiyanEntry;
  modalProps: SavedKhatiyansModalProps;
  renamingId: string | null;
  confirmDeleteId: string | null;
  onStartRename: (id: string) => void;
  onAskDelete: (id: string) => void;
  onCancelRename: () => void;
  onCancelDelete: () => void;
}

export default function EntryRow({
  entry,
  modalProps,
  renamingId,
  confirmDeleteId,
  onStartRename,
  onAskDelete,
  onCancelRename,
  onCancelDelete,
}: EntryRowProps) {
  const { activeEntryId, onOpen, onRename, onDelete } = modalProps;
  const [renameValue, setRenameValue] = useState(entry.name);
  const isActive = entry.id === activeEntryId;

  return (
    <div
      className={`rounded-lg p-4 border transition ${
        isActive
          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-600"
          : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
      }`}
    >
      {renamingId === entry.id ? (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="flex-1 bg-white dark:bg-gray-800 border border-amber-400 text-gray-900 dark:text-gray-100 px-3 py-2 rounded"
          />
          <button
            onClick={() => {
              if (renameValue.trim()) onRename(entry.id, renameValue);
              onCancelRename();
            }}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm"
          >
            ঠিক আছে
          </button>
          <button
            onClick={onCancelRename}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-sm"
          >
            বাতিল
          </button>
        </div>
      ) : confirmDeleteId === entry.id ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="flex-1 text-sm text-gray-700 dark:text-gray-200">
            <span className="font-bold">“{entry.name}”</span> মুছে ফেলবেন?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onDelete(entry.id);
                onCancelDelete();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              হ্যাঁ, মুছুন
            </button>
            <button
              onClick={onCancelDelete}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-sm"
            >
              বাতিল
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate">{entry.name}</h4>
              {isActive && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 shrink-0">
                  খোলা আছে
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <Users size={13} /> {toBn(String(entry.owners.length))} মালিক
              </span>
              <span className="flex items-center gap-1">
                <Layers size={13} /> {toBn(String(entry.dags.length))} দাগ
              </span>
              <span>আপডেট: {formatTimeAgo(new Date(entry.updatedAt))}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onOpen(entry)}
              className="px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition flex items-center gap-1 text-sm"
            >
              <FolderOpen size={15} /> খুলুন
            </button>
            <button
              onClick={() => {
                setRenameValue(entry.name);
                onStartRename(entry.id);
              }}
              title="নাম বদলান"
              className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onAskDelete(entry.id)}
              title="মুছুন"
              className="px-3 py-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded transition"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
