import { ValidationError } from "@/lib/types";
import { AlertCircle, X } from "lucide-react";

export const ErrorModal = ({ errors, onClose }: { errors: ValidationError[]; onClose: () => void }) => {
  if (errors.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border border-red-500">
        <div className="flex items-start mb-4">
          <div className="bg-red-900 rounded-full p-2 mr-3">
            <AlertCircle className="text-red-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-400 mb-2">ত্রুটি পাওয়া গেছে</h3>
            <ul className="list-disc list-inside space-y-2">
              {errors.map((error, i) => (
                <li key={i} className="text-gray-300 text-sm">
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center gap-2"
        >
          <X size={18} /> বন্ধ করুন
        </button>
      </div>
    </div>
  );
};
