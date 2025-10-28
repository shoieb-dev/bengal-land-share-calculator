"use client";
import { useState } from "react";
import { X, Plus, Copy } from "lucide-react";
import { parseNumber } from "@/lib/utils/numberConversion";

interface BulkAddDagModalProps {
  show: boolean;
  onClose: () => void;
  onAdd: (dags: { name: string; land: number }[]) => void;
}

export default function BulkAddDagModal({ show, onClose, onAdd }: BulkAddDagModalProps) {
  const [dagNumbers, setDagNumbers] = useState("");
  const [landAmount, setLandAmount] = useState("");

  if (!show) return null;

  const handleAdd = () => {
    if (!dagNumbers.trim() || !landAmount) {
      alert("দাগ নম্বর এবং জমির পরিমাণ লিখুন");
      return;
    }

    // Parse dag numbers (comma or space separated)
    const numbers = dagNumbers
      .split(/[,\s]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (numbers.length === 0) {
      alert("সঠিক দাগ নম্বর লিখুন");
      return;
    }

    const parsedValue = typeof landAmount === "string" ? parseNumber(landAmount) : landAmount;
    const parsedNumber = typeof parsedValue === "string" ? parseFloat(parsedValue) : Number(parsedValue);
    if (!parsedNumber || parsedNumber <= 0) {
      alert("সঠিক পরিমাণ লিখুন");
      return;
    }

    const amount = parsedNumber;
    const newDags = numbers.map((num) => ({
      name: num,
      land: amount,
    }));

    onAdd(newDags);
    setDagNumbers("");
    setLandAmount("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border border-blue-700">
        <div className="flex items-start mb-4">
          <div className="bg-blue-900 rounded-full p-2 mr-3">
            <Plus className="text-blue-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-100 mb-2">একসাথে একাধিক দাগ যোগ করুন</h3>
            <p className="text-gray-300 text-sm">একই পরিমাণ জমি সহ একাধিক দাগ দ্রুত যোগ করুন</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Dag Numbers */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm">দাগ নম্বর (কমা বা স্পেস দিয়ে আলাদা করুন)</label>
            <textarea
              value={dagNumbers}
              onChange={(e) => setDagNumbers(e.target.value)}
              placeholder="যেমন: ১, ২, ৩, ৪, ৫ অথবা 1 2 3 4 5"
              rows={3}
              className="w-full bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-400 text-xs mt-1">উদাহরণ: "১, ২, ৩" বা "১ ২ ৩" বা "1, 2, 3"</p>
          </div>

          {/* Land Amount */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm">প্রতিটি দাগের জমি (শতক)</label>
            <input
              type="text"
              value={landAmount}
              onChange={(e) => setLandAmount(e.target.value)}
              placeholder="যেমন: ১০০ বা ৫০.৫"
              className="w-full bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preview */}
          {dagNumbers && landAmount && (
            <div className="bg-blue-900 border border-blue-700 p-3 rounded text-sm">
              <p className="text-blue-200 mb-1">প্রিভিউ:</p>
              <p className="text-gray-300">
                {dagNumbers.split(/[,\s]+/).filter((n) => n.trim()).length} টি দাগ, প্রতিটিতে {landAmount} শতক জমি
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1"
          >
            <Plus size={18} /> দাগ যোগ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
