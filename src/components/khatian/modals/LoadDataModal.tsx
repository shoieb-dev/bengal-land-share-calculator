import { X, Upload, Trash2, Clock, Download } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils/storage";

interface LoadDataModalProps {
  show: boolean;
  onClose: () => void;
  onLoad: () => void;
  onDiscard: () => void;
  lastSavedTime: Date | null;
}

export default function LoadDataModal({ show, onClose, onLoad, onDiscard, lastSavedTime }: LoadDataModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border border-blue-700">
        <div className="flex items-start mb-4">
          <div className="bg-blue-900 rounded-full p-2 mr-3">
            <Upload className="text-blue-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-100 mb-2">সংরক্ষিত ডেটা পাওয়া গেছে</h3>
            <p className="text-gray-300 text-sm mb-2">আপনার আগের কাজ সংরক্ষিত আছে। আপনি কি এটি লোড করতে চান?</p>
            {lastSavedTime && (
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
                <Clock size={14} />
                <span>সর্বশেষ সংরক্ষিত: {formatTimeAgo(lastSavedTime)}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onLoad}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Download size={18} /> সংরক্ষিত ডেটা লোড করুন
          </button>
          <button
            onClick={onDiscard}
            className="w-full px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> নতুন করে শুরু করুন
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition"
          >
            বাতিল
          </button>
        </div>
      </div>
    </div>
  );
}
