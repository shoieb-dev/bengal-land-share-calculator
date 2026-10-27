"use client";
import { anaOptions, gondaOptions, koraOptions, krantiOptions, tilOptions } from "@/lib/constants/options";
import { Dag, KhatiyanHeader, Owner, ResultRow } from "@/lib/types";
import { downloadImage, copyImageToClipboard } from "@/lib/exports/imageExportDom";
import { shotokToKaniGonda, shotokToKatha, shotokToSqFeet } from "@/lib/conversions/landConversion";
import { toBengaliNumber } from "@/lib/conversions/numberConversion";
import { showToast } from "@/lib/utils/toast";
import { normalizeShares, ratioToAnaGonda } from "@/lib/utils/validation";
import { computeHeirShares, HEIR_RELATION_LABELS } from "@/lib/utils/heirShare";
// import { generatePDFSimple } from "@/lib/utils/pdfExportSimple";
import { downloadPDF } from "@/lib/exports/pdfExport";
import { BarChart3, Copy, Download, FileDown, Image, Printer } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { ResultCharts } from "./ResultCharts";

interface ResultTableProps {
  header?: KhatiyanHeader;
  dags: Dag[];
  result: ResultRow[];
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
  const [showCharts, setShowCharts] = useState(false);

  // ─── Mutation: দ্বৈত মডেল ───
  // • কার্যকর হিস্যা (শতকরা/সহস্রাংশ): originalShare / totalActiveShare → যোগফল ১০০%
  // • কার্যকর অংশ (১৬ আনা) + মোট জমির সব কলাম: অবশিষ্ট জমি অনুযায়ী originalShare দিয়েই
  //   গণনা হয় (mutation-এ নিয়ে যাওয়া জমি বাদ), তাই যোগফল ১০০% হবে না — কমবে।
  const normalizedOwners = useMemo(() => normalizeShares(owners), [owners]);
  const mutationInfo = useMemo(() => {
    const totalActiveShare = normalizedOwners.length > 0 ? normalizedOwners[0].totalActiveShare : 0;
    const totalMutatedShare = normalizedOwners.length > 0 ? normalizedOwners[0].totalMutatedShare : 0;
    return {
      hasMutated: owners.some((o) => o.mutated),
      totalActiveShare,
      totalMutatedShare,
    };
  }, [owners, normalizedOwners]);

  // মোট জমি: নামজারিকৃত মালিক বাদ + মৃত মালিকের নামজারিকৃত ওয়ারিশের অংশও বাদ
  const totalActiveLand = normalizedOwners.reduce((sum, n) => {
    if (n.mutated) return sum;
    let land = n.owner.totalLand || 0;
    if (n.owner.deceased && n.owner.heirs && n.owner.heirs.length > 0) {
      land *= 1 - computeHeirShares(n.owner.heirs).totalMutatedShare;
    }
    return sum + land;
  }, 0);

  // Helper function to handle export with loading state and toast feedback
  const handleExport = async (exportFn: () => Promise<void>, successMessage: string) => {
    setIsExporting(true);
    try {
      await exportFn();
      if (successMessage) {
        showToast(successMessage, "success");
      }
    } catch (error) {
      console.error("Export Error:", error);
      showToast("এক্সপোর্ট করার সময় একটি সমস্যা হয়েছে।", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // --- Reusable Sub-component for Land Measurement Columns ---
  const LandMeasurementCells = ({ land }: { land: number }) => {
    const kaniGonda = shotokToKaniGonda(land);
    const katha = shotokToKatha(land);
    const sqFeet = shotokToSqFeet(land);

    return (
      <>
        {/* শতক */}
        <td className="border border-[#4b5563] p-2 text-right">{toBengaliNumber(land.toFixed(2))}</td>

        {/* কানি-গন্ডা */}
        <td className="border border-[#4b5563] p-2 text-right">
          {kaniGonda.kani > 0 ? `${toBengaliNumber(kaniGonda.kani)} কানি ` : ""}
          {kaniGonda.gonda > 0 ? `${toBengaliNumber(kaniGonda.gonda)} গন্ডা ` : ""}
          {kaniGonda.kora > 0 ? `${toBengaliNumber(kaniGonda.kora)} কড়া ` : ""}
          {kaniGonda.kranti > 0 ? `${toBengaliNumber(kaniGonda.kranti)} কন্ট ` : ""}
          {kaniGonda.kani === 0 &&
          kaniGonda.gonda === 0 &&
          kaniGonda.kora === 0 &&
          kaniGonda.kranti === 0 &&
          kaniGonda.dontho === 0 &&
          kaniGonda.til === 0
            ? " ০ "
            : ""}
          {(kaniGonda.til > 0 || kaniGonda.dontho > 0) && (
            <span className="text-gray-700">
              ({kaniGonda.dontho > 0 && `${toBengaliNumber(kaniGonda.dontho)} দন্ত`}
              {kaniGonda.til > 0 && kaniGonda.dontho > 0 && ` বা `}
              {kaniGonda.til > 0 && `${toBengaliNumber(kaniGonda.til)} তিল`})
            </span>
          )}
        </td>

        {/* কাঠা */}
        <td className="border border-[#4b5563] p-2 text-right">{toBengaliNumber(katha.toFixed(2))}</td>

        {/* বর্গফুট */}
        <td className="border border-[#4b5563] p-2 text-right">{toBengaliNumber(sqFeet.toFixed(2))}</td>
      </>
    );
  };

  // --- Effective 16-ana breakdown cell: কার্যকর হিস্যা (effectiveShare) → আনা-গণ্ডা ---
  // সক্রিয়দের কার্যকর হিস্যা পূর্ণ ১৬ আনায় স্কেল হয় (যোগফল ১৬.০০ আনা)।
  const EffectiveAnaCell = ({ effectiveShare, isMutated }: { effectiveShare: number; isMutated: boolean }) => {
    if (isMutated) {
      return (
        <td className="border border-[#4b5563] p-2 text-right font-semibold whitespace-nowrap text-gray-400"> --- </td>
      );
    }
    const b = ratioToAnaGonda(effectiveShare);
    const anaLabel = anaOptions.find((o) => o.value === b.ana)?.label ?? "";
    return (
      <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap font-semibold">
        {b.ana > 0 ? `${anaLabel} ` : ""}
        {b.gonda > 0 ? `${gondaOptions.find((o) => o.value === b.gonda)?.label} ` : ""}
        {b.kora > 0 ? `${koraOptions.find((o) => o.value === b.kora)?.label} ` : ""}
        {b.kranti > 0 ? `${krantiOptions.find((o) => o.value === b.kranti)?.label} ` : ""}
        {b.til > 0 ? `${tilOptions.find((o) => o.value === b.til)?.label} ` : ""}
        {b.ana === 0 && b.gonda === 0 && b.kora === 0 && b.kranti === 0 && b.til === 0 ? "০" : ""}
      </td>
    );
  };

  // --- Single-cell version for the Owner table (জমি গন্ডা-কড়া) ---
  const GondaKoraCell = ({ land }: { land: number }) => {
    const kg = shotokToKaniGonda(land);
    return (
      <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
        {kg.kani > 0 ? `${toBengaliNumber(kg.kani)} কানি ` : ""}
        {kg.gonda > 0 ? `${toBengaliNumber(kg.gonda)} গন্ডা ` : ""}
        {kg.kora > 0 ? `${toBengaliNumber(kg.kora)} কড়া ` : ""}
        {kg.kranti > 0 ? `${toBengaliNumber(kg.kranti)} কন্ট ` : ""}
        {kg.kani === 0 && kg.gonda === 0 && kg.kora === 0 && kg.kranti === 0 && kg.dontho === 0 && kg.til === 0
          ? " ০ "
          : ""}
        {(kg.til > 0 || kg.dontho > 0) && (
          <span className="text-gray-700">
            ({kg.dontho > 0 && `${toBengaliNumber(kg.dontho)} দন্ত`}
            {kg.til > 0 && kg.dontho > 0 && ` বা `}
            {kg.til > 0 && `${toBengaliNumber(kg.til)} তিল`})
          </span>
        )}
      </td>
    );
  };

  return (
    <div className="bg-white text-black rounded-lg shadow-xl p-4 md:p-6 border border-[#374151]" id="printable-area">
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

      <h2 className="text-2xl font-bold text-center text-black mb-4">হিসাবের ফলাফল</h2>

      {/* -------------------- PRIMARY TABLE: OWNER SHARE (Owner Total Table) -------------------- */}
      <h3 className="font-bold text-lg mb-2">১. মালিকের নাম ও অংশ</h3>
      {/* {mutationInfo.hasMutated && (
        <p className="mb-2 text-sm font-semibold text-orange-700">
          নামজারিকৃত অংশ ({toBengaliNumber((mutationInfo.totalMutatedShare * 100).toFixed(2))}%) বাদ দিয়ে অবশিষ্ট{" "}
          {toBengaliNumber((mutationInfo.totalActiveShare * 100).toFixed(2))}%-কে ১০০% ধরে সক্রিয় মালিকদের মধ্যে
          পুনর্বণ্টন করা হয়েছে
        </p>
      )} */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border border-[#4b5563] md:text-sm">
          <thead>
            <tr className="bg-[#e5e7eb]">
              <th className="border border-[#4b5563] p-2 text-center whitespace-nowrap">ক্রম</th>
              <th className="border border-[#4b5563] p-2 text-left whitespace-nowrap">মালিকের নাম</th>
              <th className="border border-[#4b5563] p-2 text-right whitespace-nowrap">অংশ (১৬ আনা)</th>
              <th className="border border-[#4b5563] p-2 text-right whitespace-nowrap">অংশ (শতকরা)</th>
              {/* {mutationInfo.hasMutated && (
                <th className="border border-[#4b5563] p-2 text-right whitespace-nowrap">কার্যকর অংশ (শতকরা)</th>
              )} */}
              <th className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                {mutationInfo.hasMutated ? "কার্যকর অংশ (সহস্রাংশ)" : "অংশ (সহস্রাংশ)"}
              </th>
              <th className="border border-[#4b5563] p-2 text-right whitespace-nowrap">মোট জমি (শতক)</th>
              <th className="border border-[#4b5563] p-2 text-right whitespace-nowrap">মোট জমি (অজুতাংশ/পয়েন্ট)</th>
              <th className="border border-[#4b5563] p-2 text-right whitespace-nowrap">মোট জমি (গন্ডা-কড়া)</th>
            </tr>
          </thead>
          <tbody>
            {normalizedOwners.map(({ owner, mutated, originalShare, effectiveShare }, i) => {
              const land = owner.totalLand || 0;
              const isMutated = mutated;
              return (
                <Fragment key={i}>
                  <tr className={isMutated ? "bg-gray-200 opacity-70" : i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"}>
                    <td className="border border-[#4b5563] p-2 text-center">{toBengaliNumber(i + 1)}</td>
                    <td className={`border border-[#4b5563] p-2 ${isMutated ? "line-through text-gray-500" : ""}`}>
                      {owner.name}
                      {isMutated && (
                        <>
                          {" "}
                          <span className="inline-block text-gray-700">(নামজারিকৃত)</span>
                        </>
                      )}
                      {owner.deceased && (
                        <>
                          {" "}
                          <span className="inline-block text-violet-700">(মৃত)</span>
                        </>
                      )}
                    </td>
                    <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
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
                    <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                      {toBengaliNumber((originalShare * 100).toFixed(2))}%
                    </td>
                    {/* {mutationInfo.hasMutated && (
                    <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap font-semibold">
                      {isMutated ? "---" : `${toBengaliNumber((effectiveShare * 100).toFixed(2))}%`}
                    </td>
                  )} */}
                    <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                      {toBengaliNumber(effectiveShare.toFixed(3))}
                    </td>
                    <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                      {toBengaliNumber(land.toFixed(2))}
                    </td>
                    <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                      {toBengaliNumber(land.toFixed(2).replace(".", "").padStart(4, "0"))}
                    </td>
                    <GondaKoraCell land={land} />
                  </tr>
                  {owner.deceased &&
                    owner.heirs &&
                    owner.heirs.length > 0 &&
                    (() => {
                      const hs = computeHeirShares(owner.heirs!);
                      return owner.heirs!.map((heir) => {
                        const share = hs.shares[heir.id] ?? 0;
                        const effShare = hs.effectiveShares[heir.id] ?? 0;
                        const isHeirMutated = !!heir.mutated;
                        const heirLand = land * share;
                        const anaB = ratioToAnaGonda(share * originalShare);
                        return (
                          <tr
                            key={`heir-${i}-${heir.id}`}
                            className={isHeirMutated ? "bg-gray-100 opacity-70" : "bg-violet-50"}
                          >
                            <td className="border border-[#4b5563] p-2 text-center text-gray-400">↳</td>
                            <td
                              className={`border border-[#4b5563] p-2 pl-6 text-sm ${
                                isHeirMutated ? "line-through text-gray-500" : ""
                              }`}
                            >
                              {heir.name}{" "}
                              <span className={`text-xs ${isHeirMutated ? "text-gray-500" : "text-violet-700"}`}>
                                ({HEIR_RELATION_LABELS[heir.relation]})
                              </span>
                              {isHeirMutated && <span className="text-xs text-gray-500"> (নামজারিকৃত)</span>}
                            </td>
                            <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap text-sm">
                              {anaB.ana > 0 ? `${anaOptions.find((o) => o.value === anaB.ana)?.label} ` : ""}
                              {anaB.gonda > 0 ? `${gondaOptions.find((o) => o.value === anaB.gonda)?.label} ` : ""}
                              {anaB.kora > 0 ? `${koraOptions.find((o) => o.value === anaB.kora)?.label} ` : ""}
                              {anaB.kranti > 0 ? `${krantiOptions.find((o) => o.value === anaB.kranti)?.label} ` : ""}
                              {anaB.til > 0 ? `${tilOptions.find((o) => o.value === anaB.til)?.label} ` : ""}
                            </td>
                            <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                              {toBengaliNumber((share * originalShare * 100).toFixed(2))}%
                            </td>
                            <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                              {toBengaliNumber((effShare * effectiveShare).toFixed(3))}
                            </td>
                            <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                              {toBengaliNumber(heirLand.toFixed(2))}
                            </td>
                            <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                              {toBengaliNumber(heirLand.toFixed(2).replace(".", "").padStart(4, "0"))}
                            </td>
                            <GondaKoraCell land={heirLand} />
                          </tr>
                        );
                      });
                    })()}
                </Fragment>
              );
            })}
            <tr className="font-bold">
              <td className="border border-[#4b5563] p-2 text-center whitespace-nowrap" colSpan={2}>
                মোট
              </td>
              <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                {toBengaliNumber(((totalSharePercentage / 100) * 16).toFixed(2))} আনা
                {mutationInfo.hasMutated && (
                  <> → {toBengaliNumber((mutationInfo.totalActiveShare * 16).toFixed(2))} আনা</>
                )}
              </td>
              <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                {toBengaliNumber(totalSharePercentage.toFixed(2))}%
              </td>
              {/*               {mutationInfo.hasMutated && (
                <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap font-semibold">
                  {toBengaliNumber((mutationInfo.totalActiveShare * 100).toFixed(2))}% → ১০০.০০%
                </td>
              )} */}
              <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                {toBengaliNumber((totalSharePercentage / 100).toFixed(3))}
              </td>
              <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                {toBengaliNumber(owners.reduce((sum, o) => sum + (o.totalLand || 0), 0).toFixed(2))}
                {/* 
                {toBengaliNumber(totalActiveLand.toFixed(2))}
                {toBengaliNumber(
                  (mutationInfo.hasMutated
                    ? normalizedOwners.filter((n) => !n.mutated).reduce((sum, n) => sum + (n.owner.totalLand || 0), 0)
                    : owners.reduce((sum, o) => sum + (o.totalLand || 0), 0)
                  ).toFixed(2),
                )} */}
              </td>
              <td className="border border-[#4b5563] p-2 text-right whitespace-nowrap">
                {(() => {
                  const total = owners.reduce((sum, o) => sum + (o.totalLand || 0), 0);
                  return `${toBengaliNumber(total.toFixed(2).replace(".", ""))}`;
                })()}
                {/* 
                {(() => {
                  const total = totalActiveLand;
                  return `${toBengaliNumber(total.toFixed(2).replace(".", ""))}`;
                })()}
                {(() => {
                  const total = mutationInfo.hasMutated
                    ? normalizedOwners.filter((n) => !n.mutated).reduce((sum, n) => sum + (n.owner.totalLand || 0), 0)
                    : owners.reduce((sum, o) => sum + (o.totalLand || 0), 0);
                  return `${toBengaliNumber(total.toFixed(2).replace(".", ""))}`;
                })()}
                */}
              </td>
              <GondaKoraCell land={owners.reduce((sum, o) => sum + (o.totalLand || 0), 0)} />
              {/* 
              <GondaKoraCell land={totalActiveLand} />
              <GondaKoraCell
                land={
                  mutationInfo.hasMutated
                    ? normalizedOwners.filter((n) => !n.mutated).reduce((sum, n) => sum + (n.owner.totalLand || 0), 0)
                    : owners.reduce((sum, o) => sum + (o.totalLand || 0), 0)
                }
              /> 
              */}
            </tr>
          </tbody>
        </table>
      </div>

      {/* -------------------- SECONDARY TABLE: DAG WISE LAND AMOUNT -------------------- */}
      <h3 className="font-bold text-lg mb-2">২. দাগভিত্তিক জমির পরিমাণ</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border border-[#4b5563] md:text-sm">
          <thead>
            <tr className="bg-[#e5e7eb]">
              <th className="border border-[#4b5563] p-2 text-left">দাগ নং</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (শতক)</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (গন্ডা-কড়া)</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (কাঠা)</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (বর্গফুট)</th>
            </tr>
          </thead>
          <tbody>
            {dags.map((row, i) => {
              return (
                <tr key={i} className={i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"}>
                  <td className="border border-[#4b5563] p-2">{toBengaliNumber(row.name)}</td>
                  <LandMeasurementCells land={row.land} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* -------------------- THIRD TABLE: DAG WISE DISTRIBUTION (Existing Result Table) -------------------- */}
      <h3 className="font-bold text-lg mb-2">৩. দাগভিত্তিক জমির বন্টন</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border border-[#4b5563] md:text-sm">
          <thead>
            <tr className="bg-[#e5e7eb]">
              <th className="border border-[#4b5563] p-2 text-left">দাগ নং</th>
              <th className="border border-[#4b5563] p-2 text-left">মালিকের নাম</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (শতক)</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (গন্ডা-কড়া)</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (কাঠা)</th>
              <th className="border border-[#4b5563] p-2 text-right">জমি (বর্গফুট)</th>
            </tr>
          </thead>
          <tbody>
            {result.map((row, i) => {
              const isRowMutated = owners.find((o) => o.name === row.ownerName)?.mutated;
              const isRowDeceased = !!row.isDeceased && !row.isHeir;
              const isRowHeir = !!row.isHeir;
              const isRowHeirMutated = !!row.isHeirMutated;
              return (
                <tr
                  key={i}
                  className={
                    isRowMutated || isRowDeceased || isRowHeirMutated
                      ? "bg-gray-200 opacity-70"
                      : isRowHeir
                        ? "bg-violet-50"
                        : i % 2 === 0
                          ? "bg-[#f9fafb]"
                          : "bg-[#f3f4f6]"
                  }
                >
                  <td className="border border-[#4b5563] p-2">{toBengaliNumber(row.dagName)}</td>
                  <td
                    className={`border border-[#4b5563] p-2 ${
                      isRowMutated || isRowDeceased || isRowHeirMutated
                        ? "line-through text-gray-500"
                        : isRowHeir
                          ? "pl-6 text-violet-900"
                          : ""
                    }`}
                  >
                    {isRowHeir ? `↳ ${row.ownerName}` : row.ownerName}
                    {isRowHeir && row.relation ? ` (${HEIR_RELATION_LABELS[row.relation]})` : ""}
                    {isRowMutated || isRowHeirMutated ? " (নামজারিকৃত)" : ""}
                    {isRowDeceased ? " (মৃত)" : ""}
                  </td>
                  <LandMeasurementCells land={row.land} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* -------------------- CHARTS: VISUAL SUMMARY -------------------- */}
      <button
        onClick={() => setShowCharts((v) => !v)}
        className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition print-hide"
      >
        <BarChart3 size={18} /> {showCharts ? "চার্ট লুকান" : "চার্ট দেখুন"}
      </button>

      {showCharts && (
        <ResultCharts owners={owners} dags={dags} result={result} calculateShareRatio={calculateShareRatio} />
      )}

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap" id="export-controls">
        <button
          onClick={() => window.print()}
          className="bg-[#22c55e] text-white px-6 py-3 rounded-lg hover:bg-[#1fb656e1] transition shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Printer size={20} /> প্রিন্ট করুন
        </button>

        <button
          onClick={() =>
            handleExport(
              () =>
                downloadPDF(
                  `${header?.surveyType || "বি এস"} খতিয়ান ${toBengaliNumber(header?.khatiyanNo || Date.now())} হিসাব`,
                ),
              "",
            )
          }
          disabled={isExporting}
          className="bg-[#dc2626] text-[#fff] px-6 py-3 rounded-lg hover:bg-[#991b1b] transition shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
        >
          <FileDown size={20} /> {isExporting ? "তৈরি হচ্ছে..." : "PDF ডাউনলোড"}
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
          className="bg-[#2563eb] text-white px-6 py-3 rounded-lg hover:bg-[#173eab] transition shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
        >
          <Image size={20} /> {isExporting ? "এক্সপোর্ট হচ্ছে..." : "PNG ডাউনলোড"}
        </button>

        <button
          onClick={() => downloadImage("jpeg")}
          disabled={isExporting}
          className="bg-[#8b5cf6] text-white px-6 py-3 rounded-lg hover:bg-[#6945bf] transition shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
        >
          <Download size={20} /> {isExporting ? "এক্সপোর্ট হচ্ছে..." : "JPG ডাউনলোড"}
        </button>

        <button
          onClick={() => copyImageToClipboard()}
          disabled={isExporting}
          className="bg-[#ea580c] text-white px-6 py-3 rounded-lg hover:bg-[#b24206] transition shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
        >
          <Copy size={20} /> {isExporting ? "কপি হচ্ছে..." : "ক্লিপবোর্ডে কপি"}
        </button>
      </div>
    </div>
  );
};
