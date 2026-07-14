"use client";
import { anaOptions, gondaOptions, koraOptions, krantiOptions, tilOptions } from "@/lib/constants/options";
import { Dag, KhatiyanHeader, Owner } from "@/lib/types";
import { downloadImage, copyImageToClipboard } from "@/lib/exports/imageExportDom";
import { shotokToKaniGonda, shotokToKatha, shotokToSqFeet } from "@/lib/conversions/landConversion";
import { toBengaliNumber } from "@/lib/conversions/numberConversion";
// import { generatePDFSimple } from "@/lib/utils/pdfExportSimple";
import { Copy, Download, FileDown, Image, Printer } from "lucide-react";
import { useState } from "react";

interface ResultTableProps {
  header?: KhatiyanHeader;
  dags: Dag[];
  result: { dagName: string; ownerName: string; land: number }[];
  owners: Owner[];
  totalSharePercentage: number;
  calculateShareRatio: (owner: Owner) => number;
}

export const ResultTable = ({
  header,
  dags,
  result,
  owners,
  totalSharePercentage,
  calculateShareRatio,
}: ResultTableProps) => {
  const [isExporting, setIsExporting] = useState(false);

  // Helper function to handle export with loading state and alert
  const handleExport = async (exportFn: () => Promise<void>, successMessage: string) => {
    setIsExporting(true);
    try {
      await exportFn();
      // An alert might already be inside the exportFn (e.g., for copy)
    } catch (error) {
      console.error("Export Error:", error);
      alert("এক্সপোর্ট করার সময় একটি সমস্যা হয়েছে।");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-[#fff] text-[#000] rounded-lg shadow-xl p-4 md:p-6 border border-[#374151]" id="printable-area">
      {header && (header.surveyType || header.district || header.khatiyanNo) && (
        <>
          <h1 className="text-2xl font-bold text-center mb-4">{header.surveyType} খতিয়ান</h1>

          {/* Header Section (from Section 1) */}
          <div className="text-sm md:text-base mb-6 space-y-2 border-b border-[#4b5563] pb-4">
            <div className="grid grid-cols-3">
              <div>
                <span className="font-semibold">জিলাঃ</span> {header.district}
              </div>
              <div className="md:ml-40">
                <span className="font-semibold">থানাঃ</span> {header.thana}
              </div>
              <div className="md:ml-40">
                <span className="font-semibold">খতিয়ান নংঃ</span> {toBengaliNumber(header.khatiyanNo ?? "")}
              </div>
            </div>
            <div className="grid grid-cols-3">
              <div>
                <span className="font-semibold">মৌজাঃ</span> {header.mouja}
              </div>
              <div className="md:ml-40">
                <span className="font-semibold">জে. এল নংঃ</span> {toBengaliNumber(header.jlNo ?? "")}
              </div>
              <div className="md:ml-40">
                <span className="font-semibold">রে: সা: নংঃ</span>
              </div>
            </div>
          </div>
        </>
      )}

      <h2 className="text-2xl font-bold text-center text-[#000] mb-4">হিসাবের ফলাফল</h2>

      {/* -------------------- PRIMARY TABLE: OWNER SHARE (Owner Total Table) -------------------- */}
      <h3 className="font-bold text-lg mb-2">১. মালিকের নাম ও অংশ</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border border-[#4b5563] text-xs md:text-sm">
          <thead>
            <tr className="bg-[#e5e7eb]">
              <th className="border border-[#4b5563] p-2 text-left">মালিকের নাম</th>
              <th className="border border-[#4b5563] p-2 text-right" colSpan={2}>
                মালিকানার অংশ
              </th>
              <th className="border border-[#4b5563] p-2 text-right">মোট জমি (শতক)</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((owner, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"}>
                <td className="border border-[#4b5563] p-2">{owner.name}</td>
                <td className="border border-[#4b5563] p-2 text-right">
                  {/* ... (Existing share display logic) ... */}
                  {owner.ana > 0 ? `${anaOptions.find((o) => o.value === owner.ana)?.label} ` : ""}
                  {owner.gonda > 0 ? `${gondaOptions.find((o) => o.value === owner.gonda)?.label} ` : ""}
                  {owner.kora > 0 ? `${koraOptions.find((o) => o.value === owner.kora)?.label} ` : ""}
                  {owner.kranti > 0 ? `${krantiOptions.find((o) => o.value === owner.kranti)?.label} ` : ""}
                  {owner.til > 0 ? `${tilOptions.find((o) => o.value === owner.til)?.label} ` : ""}
                  {owner.ana === 0 && owner.gonda === 0 && owner.kora === 0 && owner.kranti === 0 && owner.til === 0
                    ? `${toBengaliNumber(((owner.shareRatio || 0) * 100).toFixed(2))}%`
                    : ""}
                </td>
                <td className="border border-[#4b5563] p-2 text-right">
                  {toBengaliNumber((calculateShareRatio(owner) * 100).toFixed(2))}%
                </td>
                <td className="border border-[#4b5563] p-2 text-right">
                  {toBengaliNumber((owner.totalLand || 0).toFixed(2))}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="border border-[#4b5563] p-2">মোট</td>
              <td className="border border-[#4b5563] p-2 text-right" colSpan={2}>
                {toBengaliNumber(totalSharePercentage.toFixed(2))}%
              </td>
              <td className="border border-[#4b5563] p-2 text-right">
                {toBengaliNumber(owners.reduce((sum, o) => sum + (o.totalLand || 0), 0).toFixed(2))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* -------------------- SECONDARY TABLE: DAG WISE LAND AMOUNT -------------------- */}
      <h3 className="font-bold text-lg mb-2">২. দাগভিত্তিক জমির পরিমাণ</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border border-[#4b5563] text-xs md:text-sm">
          <thead>
            <tr className="bg-[#e5e7eb]">
              <th className="border border-[#4b5563] p-2 text-left">দাগ নং</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (শতক)</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (কানি-গন্ডা)</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (কাঠা)</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (বর্গফুট)</th>
            </tr>
          </thead>
          <tbody>
            {dags.map((row, i) => {
              const kaniGonda = shotokToKaniGonda(row.land);
              const katha = shotokToKatha(row.land);
              const sqFeet = shotokToSqFeet(row.land);

              return (
                <tr key={i} className={i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"}>
                  <td className="border border-[#4b5563] p-2">{toBengaliNumber(row.name)}</td>
                  <td className="border border-[#4b5563] p-2 text-right">{toBengaliNumber(row.land.toFixed(2))}</td>
                  <td className="border border-[#4b5563] p-2 text-right">
                    {kaniGonda.kani > 0 ? `${toBengaliNumber(kaniGonda.kani)} কানি ` : ""}
                    {kaniGonda.gonda > 0 ? `${toBengaliNumber(kaniGonda.gonda)} গন্ডা ` : ""}
                    {kaniGonda.kora > 0 ? `${toBengaliNumber(kaniGonda.kora)} কড়া ` : ""}
                    {kaniGonda.kranti > 0 ? `${toBengaliNumber(kaniGonda.kranti)} ক্রান্তি ` : ""}
                    {kaniGonda.til > 0 ? `${toBengaliNumber(kaniGonda.til)} তিল` : ""}
                    {kaniGonda.kani === 0 &&
                    kaniGonda.gonda === 0 &&
                    kaniGonda.kora === 0 &&
                    kaniGonda.kranti === 0 &&
                    kaniGonda.til === 0
                      ? "০"
                      : ""}
                  </td>
                  <td className="border border-[#4b5563] p-2 text-right">{toBengaliNumber(katha.toFixed(2))}</td>
                  <td className="border border-[#4b5563] p-2 text-right">{toBengaliNumber(sqFeet.toFixed(2))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* -------------------- THIRD TABLE: DAG WISE DISTRIBUTION (Existing Result Table) -------------------- */}
      <h3 className="font-bold text-lg mb-2">৩. দাগভিত্তিক জমির বন্টন</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border border-[#4b5563] text-xs md:text-sm">
          <thead>
            <tr className="bg-[#e5e7eb]">
              <th className="border border-[#4b5563] p-2 text-left">দাগ নং</th>
              <th className="border border-[#4b5563] p-2 text-left">মালিকের নাম</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (শতক)</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (কানি-গন্ডা)</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (কাঠা)</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (বর্গফুট)</th>
            </tr>
          </thead>
          <tbody>
            {result.map((row, i) => {
              const kaniGonda = shotokToKaniGonda(row.land);
              const katha = shotokToKatha(row.land);
              const sqFeet = shotokToSqFeet(row.land);

              return (
                <tr key={i} className={i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"}>
                  <td className="border border-[#4b5563] p-2">{toBengaliNumber(row.dagName)}</td>
                  <td className="border border-[#4b5563] p-2">{row.ownerName}</td>
                  <td className="border border-[#4b5563] p-2 text-right">{toBengaliNumber(row.land.toFixed(2))}</td>
                  <td className="border border-[#4b5563] p-2 text-right">
                    {kaniGonda.kani > 0 ? `${toBengaliNumber(kaniGonda.kani)} কানি ` : ""}
                    {kaniGonda.gonda > 0 ? `${toBengaliNumber(kaniGonda.gonda)} গন্ডা ` : ""}
                    {kaniGonda.kora > 0 ? `${toBengaliNumber(kaniGonda.kora)} কড়া ` : ""}
                    {kaniGonda.kranti > 0 ? `${toBengaliNumber(kaniGonda.kranti)} ক্রান্তি ` : ""}
                    {kaniGonda.til > 0 ? `${toBengaliNumber(kaniGonda.til)} তিল` : ""}
                    {kaniGonda.kani === 0 &&
                    kaniGonda.gonda === 0 &&
                    kaniGonda.kora === 0 &&
                    kaniGonda.kranti === 0 &&
                    kaniGonda.til === 0
                      ? "০"
                      : ""}
                  </td>
                  <td className="border border-[#4b5563] p-2 text-right">{toBengaliNumber(katha.toFixed(2))}</td>
                  <td className="border border-[#4b5563] p-2 text-right">{toBengaliNumber(sqFeet.toFixed(2))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap" id="export-controls">
        <button
          onClick={() => window.print()}
          className="bg-[#22c55e] text-[#fff] px-6 py-3 rounded-lg hover:bg-[#1fb656e1] transition shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Printer size={20} /> প্রিন্ট করুন
        </button>

        {/*  <button
          onClick={() => generatePDFSimple("KH-2024-001")}
          className="bg-[#ee4a4a] text-white px-6 py-3 rounded-lg hover:bg-[#ad1f1f] transition shadow-lg flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <FileDown size={20} /> PDF ডাউনলোড করুন
        </button> */}

        <button
          onClick={() => downloadImage("png")}
          disabled={isExporting}
          className="bg-[#2563eb] text-[#fff] px-6 py-3 rounded-lg hover:bg-[#173eab] transition shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
        >
          <Image size={20} /> {isExporting ? "এক্সপোর্ট হচ্ছে..." : "PNG ডাউনলোড"}
        </button>

        <button
          onClick={() => downloadImage("jpeg")}
          disabled={isExporting}
          className="bg-[#8b5cf6] text-[#fff] px-6 py-3 rounded-lg hover:bg-[#6945bf] transition shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
        >
          <Download size={20} /> {isExporting ? "এক্সপোর্ট হচ্ছে..." : "JPG ডাউনলোড"}
        </button>

        <button
          onClick={() => copyImageToClipboard()}
          disabled={isExporting}
          className="bg-[#ea580c] text-[#fff] px-6 py-3 rounded-lg hover:bg-[#b24206] transition shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
        >
          <Copy size={20} /> {isExporting ? "কপি হচ্ছে..." : "ক্লিপবোর্ডে কপি"}
        </button>
      </div>
    </div>
  );
};
