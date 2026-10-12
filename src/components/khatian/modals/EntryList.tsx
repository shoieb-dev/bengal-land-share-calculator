"use client";
import { FileText } from "lucide-react";
import { SavedKhatiyanEntry } from "@/lib/utils/khatiyanLibrary";
import { SavedKhatiyansModalProps } from "./SavedKhatiyansModal";
import { useState } from "react";
import EntryRow from "./EntryRow";

export interface EntryListProps {
  entries: SavedKhatiyanEntry[];
  isEmpty: boolean;
  modalProps: SavedKhatiyansModalProps;
}

export default function EntryList({ entries, isEmpty, modalProps }: EntryListProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p>{isEmpty ? "কোনো সংরক্ষিত খতিয়ান নেই" : "খুঁজে কিছু পাওয়া যায়নি"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <EntryRow
          key={entry.id}
          entry={entry}
          modalProps={modalProps}
          renamingId={renamingId}
          confirmDeleteId={confirmDeleteId}
          onStartRename={setRenamingId}
          onAskDelete={(id) => {
            setConfirmDeleteId(id);
            setRenamingId(null);
          }}
          onCancelRename={() => setRenamingId(null)}
          onCancelDelete={() => setConfirmDeleteId(null)}
        />
      ))}
    </div>
  );
}
