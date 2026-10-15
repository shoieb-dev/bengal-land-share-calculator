import { useState } from "react";
import { anaOptions, gondaOptions, koraOptions, krantiOptions, tilOptions } from "@/lib/constants/options";
import { Owner } from "@/lib/types";
import { toBengaliNumber } from "@/lib/conversions/numberConversion";
import { Copy, GripVertical, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { showToast } from "@/lib/utils/toast";
import { computeHeirShares } from "@/lib/utils/heirShare";
import { calculateShareRatio } from "@/lib/utils/validation";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface OwnerFormProps {
  owners: Owner[];
  onOwnerChange: (index: number, field: keyof Owner, value: string | number | boolean) => void;
  onDelete: (index: number, name: string) => void;
  onAdd: () => void;
  onReorder: (newOwners: Owner[]) => void;
  calculateShareRatio: (owner: Owner) => number;
  onAddHeir: (ownerIndex: number) => void;
  onHeirChange: (ownerIndex: number, heirId: string, field: "name" | "relation" | "mutated", value: string | boolean) => void;
  onDeleteHeir: (ownerIndex: number, heirId: string) => void;
}

export const OwnerForm = ({
  owners,
  onOwnerChange,
  onDelete,
  onAdd,
  onReorder,
  calculateShareRatio,
  onAddHeir,
  onHeirChange,
  onDeleteHeir,
}: OwnerFormProps) => {
  const [pendingReset, setPendingReset] = useState<number | null>(null);

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

  const resetOwner = (index: number) => {
    setPendingReset(index);
  };

  const confirmResetOwner = () => {
    if (pendingReset === null) return;

    const ownerName = owners[pendingReset].name || `মালিক #${pendingReset + 1}`;
    onOwnerChange(pendingReset, "ana", 0);
    onOwnerChange(pendingReset, "gonda", 0);
    onOwnerChange(pendingReset, "kora", 0);
    onOwnerChange(pendingReset, "kranti", 0);
    onOwnerChange(pendingReset, "til", 0);
    showToast(`${ownerName} এর অংশ রিসেট করা হয়েছে।`, "info");
    setPendingReset(null);
  };

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
    <div className="bg-linear-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900 p-4 md:p-5 rounded-lg shadow-lg mb-6 border border-green-200 dark:border-green-700">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-bold text-lg text-green-800 dark:text-green-200 flex items-center">
          <span className="bg-green-600 dark:bg-green-700 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">
            ১
          </span>
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
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
              className={`bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg shadow-sm border transition-all ${
                draggedIndex === index
                  ? "border-green-500 opacity-50 scale-95"
                  : dragOverIndex === index
                    ? "border-green-400 border-dashed scale-105"
                    : "border-gray-200 dark:border-gray-700"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-2 md:gap-3 items-center">
                {/* Drag Handle */}
                {/* <div className="flex items-center justify-center cursor-grab active:cursor-grabbing">
                  <GripVertical size={20} className="text-gray-500" />
                </div> */}

                <input
                  type="text"
                  placeholder="মালিকের নাম"
                  value={owner.name}
                  onChange={(e) => onOwnerChange(index, "name", e.target.value)}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500 xl:col-span-2 placeholder:text-gray-400 dark:placeholder:text-gray-400"
                  onClick={(e) => e.stopPropagation()}
                />

                <select
                  value={owner.ana}
                  onChange={(e) => onOwnerChange(index, "ana", Number(e.target.value))}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
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
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
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
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
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
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
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
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  {tilOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <div className="md:col-span-2 lg:col-span-3 xl:col-span-1 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetOwner(index);
                    }}
                    disabled={calculateShareRatio(owner) === 0}
                    className="bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700 transition flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="অংশ রিসেট করুন"
                  >
                    <RotateCcw size={16} /> <span className="hidden sm:inline">রিসেট</span>
                  </button>

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
              </div>

              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-2 flex-wrap">
                  <label
                    className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600 transition print-hide"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={!!owner.mutated}
                      onChange={(e) => onOwnerChange(index, "mutated", e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded accent-orange-600 cursor-pointer"
                    />
                    <span
                      className={
                        owner.mutated ? "text-orange-700 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"
                      }
                    >
                      নামজারি হয়েছে
                    </span>
                  </label>

                  <label
                    className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600 transition print-hide"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={!!owner.deceased}
                      onChange={(e) => onOwnerChange(index, "deceased", e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded accent-violet-600 cursor-pointer"
                    />
                    <span
                      className={
                        owner.deceased ? "text-violet-700 dark:text-violet-400" : "text-gray-500 dark:text-gray-400"
                      }
                    >
                      মৃত মালিক (ওয়ারিশ)
                    </span>
                  </label>
                </span>
                <span>মালিকানা: {toBengaliNumber((calculateShareRatio(owner) * 100).toFixed(2))}%</span>
                <span className="text-xs text-gray-500 dark:text-gray-500">ক্রম: {index + 1}</span>
              </div>
              {/* ─── ওয়ারিশ এডিটর (মৃত মালিকের জন্য) ─── */}
              {owner.deceased && (
                <div className="mt-2 p-3 bg-violet-50 dark:bg-violet-900/30 rounded border border-violet-200 dark:border-violet-700 print-hide">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="text-sm font-semibold text-violet-800 dark:text-violet-200">ওয়ারিশ তালিকা</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddHeir(index);
                      }}
                      className="bg-violet-600 text-white px-3 py-1 rounded hover:bg-violet-700 transition flex items-center gap-1 text-xs"
                    >
                      <Plus size={14} /> ওয়ারিশ যোগ করুন
                    </button>
                  </div>

                  {(!owner.heirs || owner.heirs.length === 0) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">এখনো কোনো ওয়ারিশ যোগ করা হয়নি</p>
                  )}

                  {owner.heirs && owner.heirs.length > 0 && (
                    <HeirRows
                      ownerIndex={index}
                      owner={owner}
                      onHeirChange={onHeirChange}
                      onDeleteHeir={onDeleteHeir}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info message */}
      {owners.length > 1 && (
        <div className="mt-3 p-2 bg-green-100 dark:bg-green-700 dark:bg-opacity-30 rounded text-xs text-green-800 dark:text-green-100 flex items-center gap-2">
          <GripVertical size={14} />
          <span>প্রয়োজনে মালিকদের টেনে ক্রম পরিবর্তন করুন</span>
        </div>
      )}

      <button
        onClick={onAdd}
        className="bg-green-600 text-white px-4 py-2 rounded mt-3 hover:bg-green-700 transition flex items-center gap-2 shadow w-full sm:w-auto"
      >
        <Plus size={18} /> নতুন মালিক যোগ করুন
      </button>

      <ConfirmDialog
        open={pendingReset !== null}
        title="অংশ রিসেট করবেন?"
        message={`${owners[pendingReset ?? 0]?.name || `মালিক #${(pendingReset ?? 0) + 1}`} এর সব অংশ মুছে যাবে।`}
        confirmLabel="রিসেট করুন"
        destructive
        onConfirm={confirmResetOwner}
        onCancel={() => setPendingReset(null)}
      />
    </div>
  );
};

// ─── ওয়ারিশ রো: নাম, সম্পর্ক, হিসাব করা অংশ (%) ───
const HeirRows = ({
  ownerIndex,
  owner,
  onHeirChange,
  onDeleteHeir,
}: {
  ownerIndex: number;
  owner: Owner;
  onHeirChange: (ownerIndex: number, heirId: string, field: "name" | "relation" | "mutated", value: string | boolean) => void;
  onDeleteHeir: (ownerIndex: number, heirId: string) => void;
}) => {
  const heirs = owner.heirs ?? [];
  const heirShares = computeHeirShares(heirs);
  const ownerRatio = calculateShareRatio(owner);

  return (
    <div className="space-y-2">
      {heirs.map((heir) => {
        const share = heirShares.shares[heir.id] ?? 0;
        const effShare = heirShares.effectiveShares[heir.id] ?? 0;
        const isMutated = !!heir.mutated;
        return (
          <div key={heir.id} className={`flex items-center gap-2 ${isMutated ? "opacity-70" : ""}`}>
            <input
              type="text"
              placeholder="ওয়ারিশের নাম"
              value={heir.name}
              onChange={(e) => onHeirChange(ownerIndex, heir.id, "name", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-2 rounded text-sm placeholder:text-gray-400 dark:placeholder:text-gray-400"
            />
            <select
              value={heir.relation}
              onChange={(e) => onHeirChange(ownerIndex, heir.id, "relation", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-2 rounded text-sm"
            >
              <option value="wife">স্ত্রী</option>
              <option value="husband">স্বামী</option>
              <option value="son">ছেলে</option>
              <option value="daughter">মেয়ে</option>
            </select>
            <label
              className="flex items-center gap-1 text-xs font-semibold cursor-pointer select-none shrink-0 print-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={isMutated}
                onChange={(e) => onHeirChange(ownerIndex, heir.id, "mutated", e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="w-3.5 h-3.5 rounded accent-orange-600 cursor-pointer"
              />
              <span
                className={isMutated ? "text-orange-700 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"}
              >
                নামজারি
              </span>
            </label>
            <span
              className={`text-xs font-semibold whitespace-nowrap w-28 text-right ${
                isMutated ? "text-gray-400 line-through" : "text-violet-700 dark:text-violet-300"
              }`}
            >
              {heirShares.hasMutated && !isMutated ? (
                <>
                  {toBengaliNumber((effShare * 100).toFixed(2))}%
                  <span className="block text-[10px] text-gray-500 dark:text-gray-400">
                    (মূল {toBengaliNumber((share * 100).toFixed(2))}%)
                  </span>
                </>
              ) : (
                <>
                  {toBengaliNumber((share * 100).toFixed(2))}%
                  <span className="block text-[10px] text-gray-500 dark:text-gray-400">
                    ({toBengaliNumber((share * ownerRatio * 100).toFixed(2))}% মালিকানা)
                  </span>
                </>
              )}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteHeir(ownerIndex, heir.id);
              }}
              className="text-red-600 hover:text-red-800 p-1 shrink-0"
              title="ওয়ারিশ মুছুন"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
      {heirShares.unallocated > 0.001 && (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          ⚠ সন্তান-সন্ততি না থাকায় বাকি {toBengaliNumber((heirShares.unallocated * 100).toFixed(2))}% অংশ
          (বাবা/মা/ভাই-বোন) v1-এ স্বয়ংক্রিয়ভাবে হিসাব করা হয়নি।
        </p>
      )}
    </div>
  );
};
