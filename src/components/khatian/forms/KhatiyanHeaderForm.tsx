import { KhatiyanHeader } from "@/lib/types";
import { Eye, FileText } from "lucide-react";
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
    header.reSaNo?.trim() ? `রে: সা: নং: ${toBengaliNumber(header.reSaNo)}` : undefined,
    header.correspondingKhatiyanNo?.trim()
      ? `সংশ্লিষ্ট খতিয়ান নং: ${toBengaliNumber(header.correspondingKhatiyanNo.trim())}`
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
        <div className="mt-4 overflow-hidden rounded-xl border border-indigo-200/80 bg-white/90 shadow-sm dark:border-indigo-700/70 dark:bg-gray-900/70">
          <div className="flex items-center gap-2 border-b border-indigo-100 bg-linear-to-r from-indigo-50 to-purple-50 px-3 py-2.5 dark:border-indigo-800 dark:from-indigo-950/70 dark:to-purple-950/50">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm dark:bg-indigo-500">
              <Eye size={15} />
            </span>
            <div>
              <p className="text-sm font-bold text-indigo-800 dark:text-indigo-200">খতিয়ান প্রিভিউ</p>
              <p className="text-[11px] text-indigo-500 dark:text-indigo-300">এখানে আপনার দেওয়া তথ্যের সংক্ষিপ্ত রূপ দেখুন</p>
            </div>
          </div>

          <div className="p-3">
          {summaryParts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {summaryParts.map((part) => (
                <span
                  key={part}
                  className="rounded-lg border border-indigo-100 bg-indigo-50/80 px-2.5 py-1 text-xs font-medium leading-5 text-indigo-950 shadow-sm dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-100"
                >
                  {part}
                </span>
              ))}
            </div>
          )}
          {header.remarks?.trim() && (
            <div className="mt-3 rounded-lg border-l-4 border-purple-400 bg-purple-50/70 px-3 py-2.5 dark:border-purple-500 dark:bg-purple-950/30">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">মন্তব্য</p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
                {header.remarks.trim()}
              </p>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
