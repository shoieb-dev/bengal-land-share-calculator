import { KhatiyanHeader } from "@/lib/types";
import { FileText } from "lucide-react";
import { bangladeshDistricts, surveyTypes } from "@/lib/constants/options";

interface KhatiyanHeaderFormProps {
  header: KhatiyanHeader;
  onChange: (field: keyof KhatiyanHeader, value: string) => void;
}

export default function KhatiyanHeaderForm({ header, onChange }: KhatiyanHeaderFormProps) {
  return (
    <div className="bg-linear-to-br from-indigo-900 to-purple-900 p-4 md:p-5 rounded-lg shadow-lg mb-6 border border-indigo-700">
      <h3 className="font-bold text-lg mb-3 text-indigo-200 flex items-center">
        <span className="bg-indigo-700 rounded-full w-8 h-8 flex items-center justify-center mr-2">
          <FileText size={18} />
        </span>
        খতিয়ান তথ্য
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Survey Type */}
        <div>
          <label className="block text-indigo-200 text-sm mb-1">সার্ভে ধরন</label>
          <select
            value={header.surveyType}
            onChange={(e) => onChange("surveyType", e.target.value)}
            className="w-full bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">নির্বাচন করুন</option>
            {surveyTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Khatian No */}
        <div>
          <label className="block text-indigo-200 text-sm mb-1">খতিয়ান নং</label>
          <input
            type="text"
            value={header.khatiyanNo}
            onChange={(e) => onChange("khatiyanNo", e.target.value)}
            placeholder="যেমন: ৪৫৬"
            className="w-full bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* District */}
        <div>
          <label className="block text-indigo-200 text-sm mb-1">জেলা</label>
          <select
            value={header.district}
            onChange={(e) => onChange("district", e.target.value)}
            className="w-full bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">নির্বাচন করুন</option>
            {bangladeshDistricts.map((district, index) => (
              <option key={index} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        {/* Thana */}
        <div>
          <label className="block text-indigo-200 text-sm mb-1">থানা/উপজেলা</label>
          <input
            type="text"
            value={header.thana}
            onChange={(e) => onChange("thana", e.target.value)}
            placeholder="যেমন: পটিয়া"
            className="w-full bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Mouja */}
        <div>
          <label className="block text-indigo-200 text-sm mb-1">মৌজা</label>
          <input
            type="text"
            value={header.mouja}
            onChange={(e) => onChange("mouja", e.target.value)}
            placeholder="যেমন: কালীপুর"
            className="w-full bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* JL No */}
        <div>
          <label className="block text-indigo-200 text-sm mb-1">জেএল নং</label>
          <input
            type="text"
            value={header.jlNo}
            onChange={(e) => onChange("jlNo", e.target.value)}
            placeholder="যেমন: ১২৩"
            className="w-full bg-gray-200 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Summary Display */}
      {(header.surveyType || header.district || header.khatiyanNo) && (
        <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-200">
          <p className="text-gray-300 text-sm">
            {header.surveyType && <span className="font-semibold">{header.surveyType} খতিয়ান</span>}
            {header.khatiyanNo && <span> নং {header.khatiyanNo}</span>}
            {header.mouja && <span>, মৌজা: {header.mouja}</span>}
            {header.jlNo && <span>, জেএল নং: {header.jlNo}</span>}
            {header.thana && <span>, থানা: {header.thana}</span>}
            {header.district && <span>, জেলা: {header.district}</span>}
          </p>
        </div>
      )}
    </div>
  );
}
