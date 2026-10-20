"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Scale, X } from "lucide-react";
import { parseNumber, toBengaliNumber } from "@/lib/conversions/numberConversion";
import { shotokToKaniGonda } from "@/lib/conversions/landConversion";
import {
  AREA_UNITS,
  shotokToAllUnits,
  type AreaUnit,
} from "@/lib/conversions/reverseConversion";
import { calculateShareRatio } from "@/lib/utils/validation";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export type ConverterMode = "share-to-area" | "area-to-share";

interface ReverseConverterModalProps {
  show: boolean;
  onClose: () => void;
  khatiyanTotalShotok: number;
}

const fmt = (n: number, digits = 2) =>
  toBengaliNumber(
    (Number.isFinite(n) ? n : 0).toLocaleString("en-US", { maximumFractionDigits: digits }),
  );

function SharePart({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 dark:border-teal-800 dark:bg-teal-950/50">
      <span className="text-sm text-teal-800 dark:text-teal-200">{label}</span>
      <span className="font-mono text-sm font-semibold text-teal-900 dark:text-teal-100">
        {toBengaliNumber(value)}
      </span>
    </div>
  );
}

function UnitRows({ rows }: { rows: [string, number][] }) {
  return (
    <div className="space-y-1.5 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-900/50">
      {rows.map(([label, v]) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">{label}</span>
          <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{fmt(v)}</span>
        </div>
      ))}
    </div>
  );
}
export default function ReverseConverterModal({
  show,
  onClose,
  khatiyanTotalShotok,
}: ReverseConverterModalProps) {
  const [mode, setMode] = useState<ConverterMode>("area-to-share");
  const [areaText, setAreaText] = useState("");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("shotok");
  const debouncedAreaText = useDebouncedValue(areaText);

  const [ana, setAna] = useState(0);
  const [gonda, setGonda] = useState(0);
  const [kora, setKora] = useState(0);
  const [kranti, setKranti] = useState(0);
  const [til, setTil] = useState(0);

  const areaShotok = useMemo(() => {
    const raw = parseNumber(debouncedAreaText);
    if (!Number.isFinite(raw) || raw < 0) return 0;
    const conv = AREA_UNITS.find((u) => u.value === areaUnit);
    return conv ? conv.toShotok(raw) : 0;
  }, [debouncedAreaText, areaUnit]);

  const areaShare = useMemo(() => shotokToKaniGonda(areaShotok), [areaShotok]);
  const areaUnits = useMemo(() => shotokToAllUnits(areaShotok), [areaShotok]);
  const areaSharePct = khatiyanTotalShotok > 0 ? (areaShotok / khatiyanTotalShotok) * 100 : 0;

  const shareRatio = useMemo(
    () => calculateShareRatio({ name: "", ana, gonda, kora, kranti, til }),
    [ana, gonda, kora, kranti, til],
  );
  const shareAreaShotok = useMemo(() => shareRatio * khatiyanTotalShotok, [shareRatio, khatiyanTotalShotok]);
  const shareUnits = useMemo(() => shotokToAllUnits(shareAreaShotok), [shareAreaShotok]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-70 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-teal-700 bg-white shadow-2xl dark:bg-gray-800">
        <div className="flex items-start p-4">
          <div className="mr-3 rounded-full bg-teal-900 p-2">
            <Scale className="text-teal-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              রিভার্স জমি ও অংশ কনভার্টার
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              শতক থেকে আনা — দুই দিকেই লাইভ হিসাব
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200" aria-label="বন্ধ করুন">
            <X size={20} />
          </button>
        </div>

        <div className="mx-4 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
          {(
            [
              { v: "area-to-share", t: "শতক থেকে আনা" },
              { v: "share-to-area", t: "আনা থেকে শতক" },
            ] as { v: ConverterMode; t: string }[]
          ).map((m) => (
            <button
              key={m.v}
              onClick={() => setMode(m.v)}
              className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === m.v
                  ? "bg-teal-600 text-white shadow"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              <ArrowLeftRight size={14} /> {m.t}
            </button>
          ))}
        </div>

        <div className="space-y-4 p-4">
          {mode === "area-to-share" ? (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={areaText}
                  onChange={(e) => setAreaText(e.target.value)}
                  placeholder="যেমন: ১০ বা 10.5"
                  autoFocus
                  className="flex-1 rounded border border-gray-300 bg-white p-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                  className="rounded border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  {AREA_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

              {areaShotok > 0 ? (
                <>
                  <div className="grid grid-cols-6 gap-1.5">
                    <SharePart label="কানি" value={areaShare.kani} />
                    <SharePart label="গণ্ডা" value={areaShare.gonda} />
                    <SharePart label="কড়া" value={areaShare.kora} />
                    <SharePart label="ক্রান্তি" value={areaShare.kranti} />
                    <SharePart label="তিল" value={areaShare.til} />
                    <SharePart label="দন্ত" value={areaShare.dontho} />
                  </div>
                  <UnitRows
                    rows={[
                      ["শতক", areaUnits.shotok],
                      ["বর্গফুট", areaUnits.sqft],
                      ["বর্গগজ", areaUnits.sqyd],
                      ["বর্গমিটার", areaUnits.sqm],
                      ["কাঠা", areaUnits.katha],
                      ["পয়েন্ট", areaUnits.point],
                      ["সহস্রাংশ", areaUnits.sohosrangsho],
                    ]}
                  />
                  <p className="rounded-lg bg-teal-900/20 p-2 text-center text-sm text-teal-700 dark:text-teal-300">
                    {khatiyanTotalShotok > 0 ? (
                      <>
                        খতিয়ানের মোট {fmt(khatiyanTotalShotok)} শতকের{" "}
                        <strong>{fmt(areaSharePct)}%</strong> অংশ
                      </>
                    ) : (
                      "খতিয়ানে এখনো জমি যোগ হয়নি — শতাংশ দেখতে দাগ যোগ করুন"
                    )}
                  </p>
                </>
              ) : (
                <p className="py-4 text-center text-sm text-gray-400">
                  মান লিখলেই আনা-গণ্ডা ও সব এককে ফল দেখা যাবে
                </p>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-2">
                {(
                  [
                    ["আনা", ana, setAna, 16],
                    ["গণ্ডা", gonda, setGonda, 19],
                    ["কড়া", kora, setKora, 3],
                    ["ক্রান্তি", kranti, setKranti, 2],
                    ["তিল", til, setTil, 19],
                  ] as [string, number, (n: number) => void, number][]
                ).map(([label, v, set, max]) => (
                  <div key={label}>
                    <label className="mb-1 block text-center text-xs text-gray-500 dark:text-gray-300">
                      {label}
                    </label>
                    <select
                      value={v}
                      onChange={(e) => set(Number(e.target.value))}
                      className="w-full rounded border border-gray-300 bg-white p-2 text-center text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    >
                      {Array.from({ length: max + 1 }, (_, i) => (
                        <option key={i} value={i}>
                          {toBengaliNumber(i)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <UnitRows
                rows={[
                  ["শতক", shareUnits.shotok],
                  ["বর্গফুট", shareUnits.sqft],
                  ["বর্গগজ", shareUnits.sqyd],
                  ["বর্গমিটার", shareUnits.sqm],
                  ["কাঠা", shareUnits.katha],
                  ["পয়েন্ট", shareUnits.point],
                  ["সহস্রাংশ", shareUnits.sohosrangsho],
                ]}
              />
              <p className="rounded-lg bg-teal-900/20 p-2 text-center text-sm text-teal-700 dark:text-teal-300">
                মোট হিস্যা: <strong>{fmt(shareRatio * 100)}%</strong> (১৬ আনায় ১০০%)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
