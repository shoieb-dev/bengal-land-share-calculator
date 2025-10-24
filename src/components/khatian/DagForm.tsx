"use client";
import { useEffect, useState } from "react";
import { Trash2, Plus, Copy, Zap } from "lucide-react";
import { Dag } from "@/lib/types";
import BulkAddDagModal from "./BulkAddDagModal";
import { parseNumber } from "@/lib/utils/numberConversion";

interface DagFormProps {
  dags: Dag[];
  onDagChange: (index: number, field: keyof Dag, value: string | number) => void;
  onDelete: (index: number, name: string) => void;
  onAdd: () => void;
  onBulkAdd?: (newDags: Dag[]) => void; // Add this
}

export default function DagForm({ dags, onDagChange, onDelete, onAdd, onBulkAdd }: DagFormProps) {
  const [showQuickFill, setShowQuickFill] = useState(false);
  const [quickFillAmount, setQuickFillAmount] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  const handleBulkAdd = (newDags: { name: string; land: number }[]) => {
    if (onBulkAdd) {
      // Convert to Dag type
      const dagsToAdd: Dag[] = newDags.map((dag) => ({
        name: dag.name,
        land: dag.land,
      }));
      onBulkAdd(dagsToAdd);
    }
  };

  const handleQuickFill = () => {
    const parsedValue = typeof quickFillAmount === "string" ? parseNumber(quickFillAmount) : quickFillAmount;
    const parsedNumber = typeof parsedValue === "string" ? parseFloat(parsedValue) : Number(parsedValue);
    if (!parsedNumber || parsedNumber <= 0) {
      alert("সঠিক পরিমাণ লিখুন");
      return;
    }

    const amount = parsedNumber;
    dags.forEach((_, index) => {
      onDagChange(index, "land", amount);
    });

    setShowQuickFill(false);
    setQuickFillAmount("");
  };

  const handleCopyFromFirst = () => {
    if (dags.length === 0 || dags[0].land <= 0) {
      alert("প্রথম দাগে জমির পরিমাণ লিখুন");
      return;
    }

    const firstAmount = dags[0].land;
    dags.forEach((_, index) => {
      if (index > 0) {
        onDagChange(index, "land", firstAmount);
      }
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + D to copy last land amount
      if (e.ctrlKey && e.key === "d" && dags.length > 1) {
        e.preventDefault();
        const lastDag = dags[dags.length - 2]; // Second to last
        if (lastDag && lastDag.land > 0) {
          onDagChange(dags.length - 1, "land", lastDag.land);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dags, onDagChange]);

  return (
    <>
      <div className="bg-linear-to-br from-blue-900 to-sky-900 p-4 md:p-5 rounded-lg shadow-lg mb-6 border border-blue-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-blue-200 flex items-center">
            <span className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">২</span>
            দাগের তালিকা
          </h3>

          {/* Quick Fill Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkAdd(true)}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition flex items-center gap-1 text-sm"
            >
              <Copy size={16} /> একাধিক যোগ
            </button>
            {dags.length > 0 && (
              <>
                <button
                  onClick={() => setShowQuickFill(!showQuickFill)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition flex items-center gap-1 text-sm"
                  title="সব দাগে একই পরিমাণ"
                >
                  <Zap size={16} /> দ্রুত পূরণ
                </button>

                {/* {dags.length > 1 && dags[0].land > 0 && (
                  <button
                    onClick={handleCopyFromFirst}
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition flex items-center gap-1 text-sm"
                    title="প্রথম দাগের পরিমাণ কপি করুন"
                  >
                    <Copy size={16} /> প্রথম থেকে কপি
                  </button>
                )} */}
              </>
            )}
          </div>
        </div>

        {/* Quick Fill Input */}
        {showQuickFill && (
          <div className="bg-yellow-900 border border-yellow-700 p-3 rounded-lg mb-3 animate-fade-in">
            <label className="block text-yellow-200 text-sm mb-2">সব দাগে একই পরিমাণ জমি যোগ করুন (শতক)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickFillAmount}
                onChange={(e) => setQuickFillAmount(e.target.value)}
                placeholder="যেমন: ১০০ বা ১০০.৫০"
                className="flex-1 bg-gray-400 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-yellow-500"
                autoFocus
              />
              <button
                onClick={handleQuickFill}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
              >
                প্রয়োগ করুন
              </button>
              <button
                onClick={() => {
                  setShowQuickFill(false);
                  setQuickFillAmount("");
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                বাতিল
              </button>
            </div>
          </div>
        )}

        {dags.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="mb-2">কোনো দাগ যোগ করা হয়নি</p>
            <p className="text-sm">নিচের বাটনে ক্লিক করে দাগ যোগ করুন</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dags.map((dag, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-2 bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-700"
              >
                <input
                  type="text"
                  placeholder="দাগ নং"
                  value={dag.name}
                  onChange={(e) => onDagChange(index, "name", e.target.value)}
                  className="bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-blue-500 flex-1"
                />
                <input
                  type="text"
                  placeholder="জমি (শতক)"
                  value={dag.land || ""}
                  onChange={(e) => onDagChange(index, "land", e.target.value)}
                  className="bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-blue-500 flex-1"
                />
                <button
                  onClick={() => onDelete(index, dag.name || `দাগ #${index + 1}`)}
                  className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} /> <span className="hidden sm:inline">মুছুন</span>
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-3 hover:bg-blue-700 transition flex items-center gap-2 shadow w-full sm:w-auto"
        >
          <Plus size={18} /> নতুন দাগ যোগ করুন
        </button>
      </div>
      <BulkAddDagModal show={showBulkAdd} onClose={() => setShowBulkAdd(false)} onAdd={handleBulkAdd} />
    </>
  );
}
