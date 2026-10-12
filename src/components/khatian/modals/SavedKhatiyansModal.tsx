"use client";
import { useMemo, useRef, useState } from "react";
import { Archive, Download, Search, Upload, X } from "lucide-react";
import { SavedKhatiyanEntry } from "@/lib/utils/khatiyanLibrary";
import { toBengaliNumber as toBn } from "@/lib/conversions/numberConversion";
import EntryList from "./EntryList";

export interface SavedKhatiyansModalProps {
  show: boolean;
  entries: SavedKhatiyanEntry[];
  activeEntryId: string | null;
  onClose: () => void;
  onOpen: (entry: SavedKhatiyanEntry) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (json: string) => { imported: number; skipped: number };
}

export default function SavedKhatiyansModal(props: SavedKhatiyansModalProps) {
  const { show, entries, onClose, onExport, onImport } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.header.mouja?.toLowerCase().includes(q) ||
        e.header.khatiyanNo?.toLowerCase().includes(q) ||
        e.header.district?.toLowerCase().includes(q),
    );
  }, [entries, searchTerm]);

  if (!show) return null;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const { imported, skipped } = onImport(String(reader.result ?? ""));
        alert(
          skipped > 0
            ? `${toBn(String(imported))}টি খতিয়ান ইমপোর্ট হয়েছে, ${toBn(String(skipped))}টি বাদ পড়েছে`
            : `${toBn(String(imported))}টি খতিয়ান ইমপোর্ট হয়েছে`,
        );
      } catch {
        alert("ফাইলটি পড়া যায়নি — সঠিক JSON ফাইল দিন");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-amber-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-2">
              <Archive className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">সংরক্ষিত খতিয়ান</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {entries.length > 0
                  ? `${toBn(String(entries.length))}টি হিসাব সংরক্ষিত আছে`
                  : "এখনো কোনো হিসাব সংরক্ষণ করা হয়নি"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="নাম / মৌজা / খতিয়ান নং দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2 rounded focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onExport}
              disabled={entries.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Download size={16} /> ব্যাকআপ
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2 text-sm"
            >
              <Upload size={16} /> ইমপোর্ট
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-260px)]">
          <EntryList entries={filtered} isEmpty={entries.length === 0} modalProps={props} />
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <p className="text-gray-500 dark:text-gray-800 text-shadow-md text-center text-sm">
            খতিয়ান খুললে বর্তমান কাজ স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে
          </p>
        </div>
      </div>
    </div>
  );
}
