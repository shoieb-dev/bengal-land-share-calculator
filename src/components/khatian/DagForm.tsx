import { Dag } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

export const DagForm = ({
  dags,
  onDagChange,
  onDelete,
  onAdd,
}: {
  dags: Dag[];
  onDagChange: (index: number, field: keyof Dag, value: string | number) => void;
  onDelete: (index: number, name: string) => void;
  onAdd: () => void;
}) => (
  <div className="bg-linear-to-br from-blue-900 to-sky-900 p-4 md:p-5 rounded-lg shadow-lg mb-6 border border-blue-700">
    <h3 className="font-bold text-lg mb-3 text-blue-200 flex items-center">
      <span className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">২</span>
      দাগের তালিকা
    </h3>

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
              className="bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-blue-500 flex-1"
            />
            <input
              type="text"
              placeholder="জমি (শতক)"
              value={dag.land || ""}
              onChange={(e) => onDagChange(index, "land", e.target.value)}
              className="bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-blue-500 flex-1"
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
);
