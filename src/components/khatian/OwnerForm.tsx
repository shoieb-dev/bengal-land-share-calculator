import { anaOptions, gondaOptions, koraOptions, krantiOptions, tilOptions } from "@/lib/constants/options";
import { Owner } from "@/lib/types";
import { toBengaliNumber } from "@/lib/utils/numberConversion";
import { Plus, Trash2 } from "lucide-react";

interface OwnerFormProps {
  owners: Owner[];
  onOwnerChange: (index: number, field: keyof Owner, value: string | number) => void;
  onDelete: (index: number, name: string) => void;
  onAdd: () => void;
  calculateShareRatio: (owner: Owner) => number;
}

export const OwnerForm = ({ owners, onOwnerChange, onDelete, onAdd, calculateShareRatio }: OwnerFormProps) => (
  <div className="bg-linear-to-br from-green-900 to-emerald-900 p-4 md:p-5 rounded-lg shadow-lg mb-6 border border-green-700">
    <h3 className="font-bold text-lg mb-3 text-green-200 flex items-center">
      <span className="bg-green-700 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">১</span>
      মালিকের তালিকা
    </h3>

    {owners.length === 0 ? (
      <div className="text-center py-8 text-gray-400">
        <p className="mb-2">কোনো মালিক যোগ করা হয়নি</p>
        <p className="text-sm">নিচের বাটনে ক্লিক করে মালিক যোগ করুন</p>
      </div>
    ) : (
      <div className="space-y-3">
        {owners.map((owner, index) => (
          <div key={index} className="bg-gray-800 p-3 md:p-4 rounded-lg shadow-sm border border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-2 md:gap-3 items-center">
              <input
                type="text"
                placeholder="মালিকের নাম"
                value={owner.name}
                onChange={(e) => onOwnerChange(index, "name", e.target.value)}
                className="bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
              />

              <select
                value={owner.ana}
                onChange={(e) => onOwnerChange(index, "ana", Number(e.target.value))}
                className="bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
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
                className="bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
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
                className="bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
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
                className="bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
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
                className="bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
              >
                {tilOptions.map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => onDelete(index, owner.name || `মালিক #${index + 1}`)}
                className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition flex items-center justify-center gap-1"
              >
                <Trash2 size={16} /> <span className="hidden sm:inline">মুছুন</span>
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-300">
              মালিকানা: {toBengaliNumber((calculateShareRatio(owner) * 100).toFixed(2))}%
            </div>
          </div>
        ))}
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
