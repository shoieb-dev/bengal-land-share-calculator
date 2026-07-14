import { useState } from "react";
import { Trash2, Plus, Copy, Zap, ArrowDown, GripVertical, XCircle } from "lucide-react";
import BulkAddDagModal from "../modals/BulkAddDagModal";
import { Dag } from "@/lib/types";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

interface DagFormProps {
  dags: Dag[];
  onDagChange: (index: number, field: keyof Dag, value: string | number) => void;
  onDelete: (index: number, name: string) => void;
  onAdd: () => void;
  onBulkAdd: (newDags: Dag[]) => void;
  onReorder: (newDags: Dag[]) => void;
  onDeleteAll: () => void;
}

export default function DagForm({
  dags,
  onDagChange,
  onDelete,
  onAdd,
  onBulkAdd,
  onReorder,
  onDeleteAll,
}: DagFormProps) {
  const [showQuickFill, setShowQuickFill] = useState(false);
  const [quickFillAmount, setQuickFillAmount] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragAndDrop(dags, onReorder);

  // Copy land amount from previous dag
  const copyLandFromAbove = (index: number) => {
    if (index === 0) return; // Can't copy if first dag

    const previousDag = dags[index - 1];
    if (previousDag && previousDag.land > 0) {
      onDagChange(index, "land", previousDag.land);
    }
  };

  const handleQuickFill = () => {
    if (!quickFillAmount || parseFloat(quickFillAmount) <= 0) {
      alert("সঠিক পরিমাণ লিখুন");
      return;
    }

    const amount = parseFloat(quickFillAmount);
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

  const handleBulkAdd = (newDags: { name: string; land: number }[]) => {
    const dagsToAdd: Dag[] = newDags.map((dag) => ({
      name: dag.name,
      land: dag.land,
    }));
    onBulkAdd(dagsToAdd);
  };

  const handleDeleteAllClick = () => {
    if (dags.length === 0) return;
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAll = () => {
    onDeleteAll();
    setShowDeleteAllConfirm(false);
  };

  return (
    <div className="bg-linear-to-br from-blue-900 to-sky-900 p-4 md:p-5 rounded-lg shadow-lg mb-6 border border-blue-700">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-bold text-lg text-blue-200 flex items-center">
          <span className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">২</span>
          দাগের তালিকা
        </h3>

        {/* Quick Action Buttons */}
        <div className="flex gap-2 flex-wrap">
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
              <button
                onClick={handleDeleteAllClick}
                className="bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800 transition flex items-center gap-1 text-sm"
                title="সব দাগ মুছে ফেলুন"
              >
                <XCircle size={16} /> সব মুছুন
              </button>
              {/* 
              {dags.length > 1 && dags[0].land > 0 && (
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
        <div className="bg-yellow-900 border border-yellow-700 p-3 rounded-lg mb-3">
          <label className="block text-yellow-200 text-sm mb-2">সব দাগে একই পরিমাণ জমি যোগ করুন (শতক)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={quickFillAmount}
              onChange={(e) => setQuickFillAmount(e.target.value)}
              placeholder="যেমন: ১০০ বা ১০০.৫০"
              className="flex-1 bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-yellow-500"
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
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-gray-800 rounded-lg shadow-sm border transition-all ${
                draggedIndex === index
                  ? "border-blue-500 opacity-50 scale-95"
                  : dragOverIndex === index
                    ? "border-blue-400 border-dashed scale-105"
                    : "border-gray-700"
              } cursor-move`}
            >
              {/* Copy Button - Show for 2nd dag onwards */}
              {index > 0 && (
                <div className="px-3 pt-2">
                  <button
                    onClick={() => copyLandFromAbove(index)}
                    className="bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition flex items-center gap-1 text-xs"
                    title="উপরের দাগের পরিমাণ কপি করুন"
                  >
                    <ArrowDown size={12} /> উপরের দাগের পরিমাণ কপি ({dags[index - 1].land || 0})
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 p-3">
                {/* Drag Handle */}
                <div className="flex items-center justify-center cursor-grab active:cursor-grabbing sm:w-auto">
                  <GripVertical size={20} className="text-gray-500" />
                </div>

                <input
                  type="text"
                  placeholder="দাগ নং"
                  value={dag.name}
                  onChange={(e) => onDagChange(index, "name", e.target.value)}
                  className="bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-blue-500 flex-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="text"
                  placeholder="জমি (শতক)"
                  value={dag.land || ""}
                  onChange={(e) => onDagChange(index, "land", e.target.value)}
                  className="bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-blue-500 flex-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(index, dag.name || `দাগ #${index + 1}`);
                  }}
                  className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} /> <span className="hidden sm:inline">মুছুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info message */}
      {dags.length > 1 && (
        <div className="mt-3 p-2 bg-blue-700 bg-opacity-30 rounded text-xs text-blue-100 flex items-center gap-2">
          <GripVertical size={14} />
          <span>টিপ: দাগ টেনে ক্রম পরিবর্তন করুন</span>
        </div>
      )}

      <button
        onClick={onAdd}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-3 hover:bg-blue-700 transition flex items-center gap-2 shadow w-full sm:w-auto"
      >
        <Plus size={18} /> নতুন দাগ যোগ করুন
      </button>

      {/* Bulk Add Modal */}
      <BulkAddDagModal show={showBulkAdd} onClose={() => setShowBulkAdd(false)} onAdd={handleBulkAdd} />
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border border-red-700">
            <div className="flex items-start mb-4">
              <div className="bg-red-900 rounded-full p-2 mr-3">
                <XCircle className="text-red-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-100 mb-2">সব দাগ মুছে ফেলবেন?</h3>
                <p className="text-gray-300">আপনি কি নিশ্চিত যে সবগুলো ({dags.length}টি) দাগ মুছে ফেলতে চান?</p>
                <p className="text-sm text-gray-400 mt-2">এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDeleteAll}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center gap-1"
              >
                <Trash2 size={18} /> সব মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
