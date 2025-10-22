import { anaOptions, gondaOptions, koraOptions, krantiOptions, tilOptions } from "@/lib/constants/options";
import { Owner } from "@/lib/types";
import { shotokToKaniGonda, shotokToKatha, shotokToSqFeet } from "@/lib/utils/landConversion";
import { toBengaliNumber } from "@/lib/utils/numberConversion";
import { Printer } from "lucide-react";

export const ResultTable = ({
  result,
  owners,
  totalSharePercentage,
  surveyType,
  district,
  khatiyanNo,
  thana,
  mouja,
}: {
  result: { dagName: string; ownerName: string; land: number }[];
  owners: Owner[];
  totalSharePercentage: number;
  surveyType: string;
  district: string;
  khatiyanNo?: string;
  thana?: string;
  mouja?: string;
}) => (
  <div className="bg-white text-black rounded-lg shadow-xl p-4 md:p-6 border border-gray-700" id="printable-area">
    <h1 className="text-2xl font-bold text-center mb-4">{surveyType} খতিয়ান</h1>

    {/* Header Section (from Section 1) */}
    <div className="text-sm md:text-base mb-6 space-y-2 border-b border-gray-600 pb-4">
      <div className="grid grid-cols-3">
        <div>
          <span className="font-semibold">জিলাঃ</span> {district}
        </div>
        <div className="md:ml-40">
          <span className="font-semibold">থানাঃ</span> {thana}
        </div>
        <div className="md:ml-40">
          <span className="font-semibold">খতিয়ান নংঃ</span> {toBengaliNumber(khatiyanNo ?? "")}
        </div>
      </div>
      <div className="grid grid-cols-3">
        <div>
          <span className="font-semibold">মৌজাঃ</span> {mouja}
        </div>
        <div className="md:ml-40">
          <span className="font-semibold">জে. এল নংঃ</span>
        </div>
        <div className="md:ml-40">
          <span className="font-semibold">রে: সা: নংঃ</span>
        </div>
      </div>
    </div>

    {/* -------------------- PRIMARY TABLE: OWNER SHARE (Owner Total Table) -------------------- */}
    <h3 className="font-bold text-lg mb-2">১. মালিকের নাম ও অংশ</h3>
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse border border-gray-600 text-xs md:text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-600 p-2 text-left">মালিকের নাম</th>
            <th className="border border-gray-600 p-2 text-right">মালিকানার অংশ</th>
            <th className="border border-gray-600 p-2 text-right">মোট জমি (শতক)</th>
          </tr>
        </thead>
        <tbody>
          {owners.map((owner, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}>
              <td className="border border-gray-600 p-2">{owner.name}</td>
              <td className="border border-gray-600 p-2 text-right">
                {/* Displaying share in (Ana/16 Gonda/320 ...) format for official look */}
                {owner.ana > 0 ? `${anaOptions.find((o) => o.value === owner.ana)?.label} ` : ""}
                {owner.gonda > 0 ? `${gondaOptions.find((o) => o.value === owner.gonda)?.label} ` : ""}
                {owner.kora > 0 ? `${koraOptions.find((o) => o.value === owner.kora)?.label} ` : ""}
                {owner.kranti > 0 ? `${krantiOptions.find((o) => o.value === owner.kranti)?.label} ` : ""}
                {owner.til > 0 ? `${tilOptions.find((o) => o.value === owner.til)?.label} ` : ""}

                {/* Fallback if no specific parts are selected, shows percentage */}
                {owner.ana === 0 && owner.gonda === 0 && owner.kora === 0 && owner.kranti === 0 && owner.til === 0
                  ? `${toBengaliNumber(((owner.shareRatio || 0) * 100).toFixed(2))}%`
                  : ""}
              </td>
              <td className="border border-gray-600 p-2 text-right">
                {toBengaliNumber((owner.totalLand || 0).toFixed(2))}
              </td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="border border-gray-600 p-2">মোট</td>
            <td className="border border-gray-600 p-2 text-right">
              {toBengaliNumber(totalSharePercentage.toFixed(2))}%
            </td>
            <td className="border border-gray-600 p-2 text-right">
              {toBengaliNumber(owners.reduce((sum, o) => sum + (o.totalLand || 0), 0).toFixed(2))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* -------------------- SECONDARY TABLE: DAG WISE DISTRIBUTION (Existing Result Table) -------------------- */}
    <h3 className="font-bold text-lg mb-2">২. দাগভিত্তিক জমির বন্টন</h3>
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse border border-gray-600 text-xs md:text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-600 p-2 text-left">দাগ নং</th>
            <th className="border border-gray-600 p-2 text-left">মালিকের নাম</th>
            <th className="border border-gray-600 p-2 text-right">জমি (শতক)</th>
            <th className="border border-gray-600 p-2 text-right">জমি (কানি-গন্ডা)</th>
            <th className="border border-gray-600 p-2 text-right">জমি (কাঠা)</th>
            <th className="border border-gray-600 p-2 text-right">জমি (বর্গফুট)</th>
          </tr>
        </thead>
        <tbody>
          {/* ... (Existing result mapping) ... */}
          {result.map((row, i) => {
            const kaniGonda = shotokToKaniGonda(row.land);
            const katha = shotokToKatha(row.land);
            const sqFeet = shotokToSqFeet(row.land);

            return (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}>
                <td className="border border-gray-600 p-2">{row.dagName}</td>
                <td className="border border-gray-600 p-2">{row.ownerName}</td>
                <td className="border border-gray-600 p-2 text-right">{toBengaliNumber(row.land.toFixed(2))}</td>
                <td className="border border-gray-600 p-2 text-right">
                  {kaniGonda.kani > 0 ? `${toBengaliNumber(kaniGonda.kani)} কানি ` : ""}
                  {kaniGonda.gonda > 0 ? `${toBengaliNumber(kaniGonda.gonda)} গন্ডা ` : ""}
                  {kaniGonda.kora > 0 ? `${toBengaliNumber(kaniGonda.kora)} কড়া` : ""}
                  {kaniGonda.kani === 0 && kaniGonda.gonda === 0 && kaniGonda.kora === 0 ? "০" : ""}
                </td>
                <td className="border border-gray-600 p-2 text-right">{toBengaliNumber(katha.toFixed(2))}</td>
                <td className="border border-gray-600 p-2 text-right">{toBengaliNumber(sqFeet.toFixed(2))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/*  <div className="grid grid-cols-2 gap-4 mb-6 border-b border-gray-600 pb-4 text-sm md:text-base">
      <div className="text-gray-200">
        <span className="font-semibold text-blue-400">জরিপের ধরন:</span> {surveyType}
      </div>
      <div className="text-gray-200">
        <span className="font-semibold text-blue-400">জিলাঃ:</span> {district}
      </div>
    </div> */}

    {/*  <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse border border-gray-600 text-xs md:text-sm">
        <thead>
          <tr className="bg-gray-700">
            <th className="border border-gray-600 p-2 text-left text-gray-200">দাগ নং</th>
            <th className="border border-gray-600 p-2 text-left text-gray-200">মালিকের নাম</th>
            <th className="border border-gray-600 p-2 text-right text-gray-200">জমি (শতক)</th>
            <th className="border border-gray-600 p-2 text-right text-gray-200">জমি (কানি-গন্ডা-কড়া)</th>
            <th className="border border-gray-600 p-2 text-right text-gray-200">জমি (কাঠা)</th>
            <th className="border border-gray-600 p-2 text-right text-gray-200">জমি (বর্গফুট)</th>
          </tr>
        </thead>
        <tbody>
          {result.map((row, i) => {
            const kaniGonda = shotokToKaniGonda(row.land);
            const katha = shotokToKatha(row.land);
            const sqFeet = shotokToSqFeet(row.land);

            return (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}>
                <td className="border border-gray-600 p-2 text-gray-800">{row.dagName}</td>
                <td className="border border-gray-600 p-2 text-gray-800">{row.ownerName}</td>
                <td className="border border-gray-600 p-2 text-right text-gray-800">
                  {toBengaliNumber(row.land.toFixed(2))}
                </td>
                <td className="border border-gray-600 p-2 text-right text-gray-800">
                  {kaniGonda.kani > 0 ? `${toBengaliNumber(kaniGonda.kani)} কানি ` : ""}
                  {kaniGonda.gonda > 0 ? `${toBengaliNumber(kaniGonda.gonda)} গন্ডা ` : ""}
                  {kaniGonda.kora > 0 ? `${toBengaliNumber(kaniGonda.kora)} কড়া` : ""}
                  {kaniGonda.kani === 0 && kaniGonda.gonda === 0 && kaniGonda.kora === 0 ? "০" : ""}
                </td>
                <td className="border border-gray-600 p-2 text-right text-gray-800">
                  {toBengaliNumber(katha.toFixed(2))}
                </td>
                <td className="border border-gray-600 p-2 text-right text-gray-800">
                  {toBengaliNumber(sqFeet.toFixed(2))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    <div className="overflow-x-auto mb-4">
      <h3 className="font-bold text-lg mb-2 text-center text-gray-800">মালিকদের মোট জমি</h3>
      <table className="w-full border-collapse border border-gray-600 text-xs md:text-sm">
        <thead>
          <tr className="bg-green-700 text-white">
            <th className="border border-gray-600 p-2 text-left text-gray-200">মালিকের নাম</th>
            <th className="border border-gray-600 p-2 text-right text-gray-200">মোট জমি (শতক)</th>
            <th className="border border-gray-600 p-2 text-right text-gray-200">মালিকানার অংশ</th>
          </tr>
        </thead>
        <tbody>
          {owners.map((owner, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-gray-200"}>
              <td className="border border-gray-600 p-2 text-gray-800">{owner.name}</td>
              <td className="border border-gray-600 p-2 text-right text-gray-800">
                {toBengaliNumber((owner.totalLand || 0).toFixed(2))}
              </td>
              <td className="border border-gray-600 p-2 text-right text-gray-800">
                {toBengaliNumber(((owner.shareRatio || 0) * 100).toFixed(2))}%
              </td>
            </tr>
          ))}
          <tr className="bg-white text-black font-bold">
            <td className="border border-gray-600 p-2 text-gray-800">মোট</td>
            <td className="border border-gray-600 p-2 text-right text-gray-800">
              {toBengaliNumber(owners.reduce((sum, o) => sum + (o.totalLand || 0), 0).toFixed(2))}
            </td>
            <td className="border border-gray-600 p-2 text-right text-black">
              {toBengaliNumber(totalSharePercentage.toFixed(2))}%
            </td>
          </tr>
        </tbody>
      </table>
    </div> */}

    <button
      onClick={() => window.print()}
      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2 w-full md:w-auto mx-auto"
    >
      <Printer size={20} /> প্রিন্ট / এক্সপোর্ট করুন
    </button>
  </div>
);
