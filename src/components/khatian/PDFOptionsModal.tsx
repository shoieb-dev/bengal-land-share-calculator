import { useState } from "react";
import { X, FileText } from "lucide-react";

interface PDFOptionsModalProps {
  show: boolean;
  onClose: () => void;
  onExport: (options: { referenceNo?: string; includeDate: boolean; includeLogo: boolean }) => void;
}

export default function PDFOptionsModal({ show, onClose, onExport }: PDFOptionsModalProps) {
  const [referenceNo, setReferenceNo] = useState("");
  const [includeDate, setIncludeDate] = useState(true);
  const [includeLogo, setIncludeLogo] = useState(false);

  if (!show) return null;

  const handleExport = () => {
    onExport({ referenceNo, includeDate, includeLogo });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-700">
        <div className="flex items-start mb-4">
          <div className="bg-blue-900 rounded-full p-2 mr-3">
            <FileText className="text-blue-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-100 mb-2">PDF এক্সপোর্ট অপশন</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-gray-300 mb-2 text-sm">রেফারেন্স নম্বর (ঐচ্ছিক)</label>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="যেমন: KH-2024-001"
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeDate"
              checked={includeDate}
              onChange={(e) => setIncludeDate(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includeDate" className="text-gray-300 text-sm">
              তারিখ যুক্ত করুন
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeLogo"
              checked={includeLogo}
              onChange={(e) => setIncludeLogo(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includeLogo" className="text-gray-300 text-sm">
              লোগো যুক্ত করুন
            </label>
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
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1"
          >
            <FileText size={18} /> এক্সপোর্ট করুন
          </button>
        </div>
      </div>
    </div>
  );
}
