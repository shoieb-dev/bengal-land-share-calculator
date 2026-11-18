"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { showToast } from "@/lib/utils/toast";

interface BulkAddOwnerModalProps {
  show: boolean;
  onClose: () => void;
  onAdd: (names: string[]) => void;
}

export default function BulkAddOwnerModal({ show, onClose, onAdd }: BulkAddOwnerModalProps) {
  const [ownerNames, setOwnerNames] = useState("");

  if (!show) return null;

  const names = ownerNames
    .split(/[,\u060C\n]+/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  const handleAdd = () => {
    if (names.length === 0) {
      showToast("অন্তত একজন মালিকের নাম লিখুন", "error");
      return;
    }

    onAdd(names);
    setOwnerNames("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border border-green-700">
        <div className="flex items-start mb-4">
          <div className="bg-green-900 rounded-full p-2 mr-3">
            <Plus className="text-green-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-100 mb-2">একসাথে একাধিক মালিক যোগ করুন</h3>
            <p className="text-gray-300 text-sm">কমা বা নতুন লাইনে মালিকদের নাম আলাদা করুন</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200" aria-label="বন্ধ করুন">
            <X size={20} />
          </button>
        </div>

        <div>
          <label htmlFor="bulk-owner-names" className="block text-gray-300 mb-2 text-sm">
            মালিকদের নাম
          </label>
          <textarea
            id="bulk-owner-names"
            value={ownerNames}
            onChange={(e) => setOwnerNames(e.target.value)}
            placeholder={"যেমন: আইয়ুব খাঁ, রহিমুন নেছা\nঅথবা প্রতি লাইনে একজনের নাম"}
            rows={3}
            autoFocus
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500 placeholder:text-gray-400 dark:placeholder:text-gray-400"
          />
          {ownerNames.trim() && (
            <div className="bg-green-900 border border-green-700 p-3 rounded text-sm mt-3">
              <p className="text-green-200 mb-1">প্রিভিউ:</p>
              <p className="text-gray-300">
                {names.length} জন মালিক: {names.join(", ")}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition"
          >
            বাতিল
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-1"
          >
            <Plus size={18} /> মালিক যোগ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
