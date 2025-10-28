import { ResetModalType } from "@/lib/types";
import { RotateCcw } from "lucide-react";

export const ResetModal = ({
  resetModal,
  onClose,
  onConfirm,
}: {
  resetModal: ResetModalType;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!resetModal.show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border border-yellow-700">
        <div className="flex items-start mb-4">
          <div className="bg-yellow-900 rounded-full p-2 mr-3">
            <RotateCcw className="text-yellow-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-100 mb-2">সব তথ্য মুছে ফেলবেন?</h3>
            <p className="text-gray-300">আপনি কি নিশ্চিত যে সব তথ্য মুছে নতুন করে শুরু করতে চান?</p>
            <p className="text-sm text-gray-400 mt-2">
              সকল মালিক, দাগ এবং ফলাফল মুছে যাবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </p>
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
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition flex items-center gap-1"
          >
            <RotateCcw size={18} /> রিসেট করুন
          </button>
        </div>
      </div>
    </div>
  );
};
