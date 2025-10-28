import { DeleteModalType } from "@/lib/types";
import { AlertCircle, Trash2 } from "lucide-react";

export const DeleteModal = ({
  deleteModal,
  onClose,
  onConfirm,
}: {
  deleteModal: DeleteModalType;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!deleteModal.show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-700">
        <div className="flex items-start mb-4">
          <div className="bg-red-900 rounded-full p-2 mr-3">
            <AlertCircle className="text-red-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-100 mb-2">নিশ্চিত করুন</h3>
            <p className="text-gray-300">
              আপনি কি নিশ্চিত যে <strong className="text-red-400">{deleteModal.name}</strong> মুছে ফেলতে চান?
            </p>
            <p className="text-sm text-gray-400 mt-2">এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition"
          >
            বাতিল
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center gap-1"
          >
            <Trash2 size={18} /> মুছে ফেলুন
          </button>
        </div>
      </div>
    </div>
  );
};
