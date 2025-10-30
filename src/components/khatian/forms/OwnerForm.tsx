import { anaOptions, gondaOptions, koraOptions, krantiOptions, tilOptions } from "@/lib/constants/options";
import { Owner } from "@/lib/types";
import { toBengaliNumber } from "@/lib/conversions/numberConversion";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

interface OwnerFormProps {
  owners: Owner[];
  onOwnerChange: (index: number, field: keyof Owner, value: string | number) => void;
  onDelete: (index: number, name: string) => void;
  onAdd: () => void;
  onReorder: (newOwners: Owner[]) => void;
  calculateShareRatio: (owner: Owner) => number;
}

export const OwnerForm = ({
  owners,
  onOwnerChange,
  onDelete,
  onAdd,
  onReorder,
  calculateShareRatio,
}: OwnerFormProps) => {
  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragAndDrop(owners, onReorder);

  // Copy share data from previous owner
  const copyFromAbove = (index: number) => {
    if (index === 0) return; // Can't copy if first owner

    const previousOwner = owners[index - 1];

    // Copy all share fields except name
    onOwnerChange(index, "ana", previousOwner.ana);
    onOwnerChange(index, "gonda", previousOwner.gonda);
    onOwnerChange(index, "kora", previousOwner.kora);
    onOwnerChange(index, "kranti", previousOwner.kranti);
    onOwnerChange(index, "til", previousOwner.til);
  };
  return (
    <div className="bg-linear-to-br from-green-900 to-emerald-900 p-4 md:p-5 rounded-lg shadow-lg mb-6 border border-green-700">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-bold text-lg text-green-200 flex items-center">
          <span className="bg-green-700 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">১</span>
          মালিকের তালিকা
        </h3>

        {/* Copy to All Button */}
        {owners.length > 1 && owners[0] && calculateShareRatio(owners[0]) > 0 && (
          <button
            onClick={() => {
              const firstOwner = owners[0];
              owners.forEach((_, index) => {
                if (index > 0) {
                  onOwnerChange(index, "ana", firstOwner.ana);
                  onOwnerChange(index, "gonda", firstOwner.gonda);
                  onOwnerChange(index, "kora", firstOwner.kora);
                  onOwnerChange(index, "kranti", firstOwner.kranti);
                  onOwnerChange(index, "til", firstOwner.til);
                }
              });
            }}
            className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition flex items-center gap-1 text-sm"
          >
            <Copy size={14} /> সবাইকে প্রথম মালিকের অংশ দিন
          </button>
        )}
      </div>

      {owners.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="mb-2">কোনো মালিক যোগ করা হয়নি</p>
          <p className="text-sm">নিচের বাটনে ক্লিক করে মালিক যোগ করুন</p>
        </div>
      ) : (
        <div className="space-y-3">
          {owners.map((owner, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-gray-800 p-3 md:p-4 rounded-lg shadow-sm border transition-all ${
                draggedIndex === index
                  ? "border-green-500 opacity-50 scale-95"
                  : dragOverIndex === index
                  ? "border-green-400 border-dashed scale-105"
                  : "border-gray-700"
              } cursor-move`}
            >
              {/* Copy Button - Show for 2nd owner onwards */}
              {index > 0 && (
                <div className="mb-2">
                  <button
                    onClick={() => copyFromAbove(index)}
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition flex items-center gap-1 text-sm"
                    title="উপরের মালিকের অংশ কপি করুন"
                  >
                    <Copy size={14} /> উপরের মালিকের অংশ কপি করুন
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 lg:flex gap-2 md:gap-3 items-center">
                {/* Drag Handle */}
                <div className="flex items-center justify-center cursor-grab active:cursor-grabbing">
                  <GripVertical size={20} className="text-gray-500" />
                </div>

                <input
                  type="text"
                  placeholder="মালিকের নাম"
                  value={owner.name}
                  onChange={(e) => onOwnerChange(index, "name", e.target.value)}
                  className="bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500 lg:w-1/2 lg:flex-1"
                  onClick={(e) => e.stopPropagation()}
                />

                <select
                  value={owner.ana}
                  onChange={(e) => onOwnerChange(index, "ana", Number(e.target.value))}
                  className="bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  {anaOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <select
                  value={owner.gonda}
                  onChange={(e) => onOwnerChange(index, "gonda", Number(e.target.value))}
                  className="bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  {gondaOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <select
                  value={owner.kora}
                  onChange={(e) => onOwnerChange(index, "kora", Number(e.target.value))}
                  className="bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  {koraOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <select
                  value={owner.kranti}
                  onChange={(e) => onOwnerChange(index, "kranti", Number(e.target.value))}
                  className="bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  {krantiOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <select
                  value={owner.til}
                  onChange={(e) => onOwnerChange(index, "til", Number(e.target.value))}
                  className="bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  {tilOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(index, owner.name || `মালিক #${index + 1}`);
                  }}
                  className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} /> <span className="hidden sm:inline">মুছুন</span>
                </button>
              </div>

              <div className="mt-2 text-sm text-gray-300 flex items-center justify-between">
                <span>মালিকানা: {toBengaliNumber((calculateShareRatio(owner) * 100).toFixed(2))}%</span>
                <span className="text-xs text-gray-500">ক্রম: {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info message */}
      {owners.length > 1 && (
        <div className="mt-3 p-2 bg-green-700 bg-opacity-30 rounded text-xs text-green-100 flex items-center gap-2">
          <GripVertical size={14} />
          <span>টিপ: মালিকদের টেনে ক্রম পরিবর্তন করুন</span>
        </div>
      )}

      <button
        onClick={onAdd}
        className="bg-green-600 text-white px-4 py-2 rounded mt-3 hover:bg-green-700 transition flex items-center gap-2 shadow w-full sm:w-auto"
      >
        <Plus size={18} /> নতুন মালিক যোগ করুন
      </button>
    </div>
  );
};
