import { KhatiyanHeader } from "@/lib/types";
import { FileText } from "lucide-react";
import { bangladeshDistricts, surveyTypes } from "@/lib/constants/options";
import { toBengaliNumber } from "@/lib/conversions/numberConversion";
import { INPUT_BASE, LABEL_BASE } from "./formStyles";

interface KhatiyanHeaderFormProps {
  header: KhatiyanHeader;
  onChange: (field: keyof KhatiyanHeader, value: string) => void;
}

export default function KhatiyanHeaderForm({ header, onChange }: KhatiyanHeaderFormProps) {
  const summaryParts = [
    header.surveyType ? `${header.surveyType} খতিয়ান` : undefined,
    header.district ? `জেলা: ${header.district}` : undefined,
    header.thana ? `থানা: ${header.thana}` : undefined,
    header.khatiyanNo ? `খতিয়ান নং: ${toBengaliNumber(header.khatiyanNo)}` : undefined,
    header.mouja ? `মৌজা: ${header.mouja}` : undefined,
    header.jlNo ? `জে. এল নং: ${toBengaliNumber(header.jlNo)}` : undefined,
    `রে: সা: নং: ${header.reSaNo?.trim() ? toBengaliNumber(header.reSaNo) : ""}`,
    header.correspondingKhatiyanNo?.trim()
      ? `সংশ্লিষ্ট খতিয়ান নং: ${header.correspondingKhatiyanNo.trim()}`
      : undefined,
  ].filter((part): part is string => Boolean(part));

  return (
    <div className="bg-linear-to-br from-indigo-50 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-4 md:p-5 rounded-lg shadow-lg mb-6 border border-indigo-200 dark:border-indigo-700">
      <h3 className="font-bold text-lg mb-3 text-indigo-800 dark:text-indigo-200 flex items-center">
        <span className="bg-indigo-600 dark:bg-indigo-700 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
          <FileText size={18} />
        </span>
        খতিয়ান তথ্য
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Survey Type */}
        <div>
          <label className={LABEL_BASE}>সার্ভে ধরন</label>
          <select
            value={header.surveyType}
            onChange={(e) => onChange("surveyType", e.target.value)}
            className={INPUT_BASE}
          >
            <option value="">নির্বাচন করুন</option>
            {surveyTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className={LABEL_BASE}>জেলা</label>
          <select value={header.district} onChange={(e) => onChange("district", e.target.value)} className={INPUT_BASE}>
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
          <label className={LABEL_BASE}>থানা/উপজেলা</label>
          <input
            type="text"
            value={header.thana}
            onChange={(e) => onChange("thana", e.target.value)}
            placeholder="যেমন: আনোয়ারা"
            className={INPUT_BASE}
          />
        </div>

        {/* Khatian No */}
        <div>
          <label className={LABEL_BASE}>খতিয়ান নং</label>
          <input
            type="text"
            name="khotiyan_no"
            autoComplete="on"
            value={header.khatiyanNo}
            onChange={(e) => onChange("khatiyanNo", e.target.value)}
            placeholder="যেমন: ৪৫৬"
            className={INPUT_BASE}
          />
        </div>

        {/* Mouja */}
        <div>
          <label className={LABEL_BASE}>মৌজা</label>
          <input
            type="text"
            name="mouja"
            autoComplete="on"
            value={header.mouja}
            onChange={(e) => onChange("mouja", e.target.value)}
            placeholder="যেমন: গুয়াপঞ্চক"
            className={INPUT_BASE}
          />
        </div>

        {/* JL No */}
        <div>
          <label className={LABEL_BASE}>জে. এল নং</label>
          <input
            type="text"
            name="jlNo"
            autoComplete="on"
            value={header.jlNo}
            onChange={(e) => onChange("jlNo", e.target.value)}
            placeholder="যেমন: ১২৩"
            className={INPUT_BASE}
          />
        </div>

        {/* Revisional Survey No */}
        <div>
          <label className={LABEL_BASE}>রে: সা: নংঃ</label>
          <input
            type="text"
            value={header.reSaNo ?? ""}
            onChange={(e) => onChange("reSaNo", e.target.value)}
            placeholder="যেমন: ১২৩"
            className={INPUT_BASE}
          />
        </div>

        <div>
          <label className={LABEL_BASE}>সংশ্লিষ্ট খতিয়ান নং (ঐচ্ছিক)</label>
          <input
            type="text"
            value={header.correspondingKhatiyanNo ?? ""}
            onChange={(e) => onChange("correspondingKhatiyanNo", e.target.value)}
            placeholder="যেমন: আর.এস. ১২৩"
            className={INPUT_BASE}
          />
        </div>

        <div>
          <label className={LABEL_BASE}>মন্তব্য (ঐচ্ছিক)</label>
          <textarea
            value={header.remarks ?? ""}
            onChange={(e) => onChange("remarks", e.target.value)}
            placeholder="এই খতিয়ান সম্পর্কে মন্তব্য লিখুন"
            rows={1}
            className={`${INPUT_BASE} resize-y`}
          />
        </div>
      </div>

      {/* Summary Display */}
      {(summaryParts.length > 0 || header.remarks?.trim()) && (
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-indigo-200 dark:border-gray-200">
          {summaryParts.length > 0 && (
            <p className="text-gray-700 dark:text-gray-300 text-sm">{summaryParts.join(" · ")}</p>
          )}
          {header.remarks?.trim() && (
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">মন্তব্য: </span>
              {header.remarks.trim()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
