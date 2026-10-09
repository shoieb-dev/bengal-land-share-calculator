"use client";
import { Dag, Owner } from "@/lib/types";
import { toBengaliNumber } from "@/lib/conversions/numberConversion";

interface ResultChartsProps {
  owners: Owner[];
  dags: Dag[];
  result: { dagName: string; ownerName: string; land: number }[];
  calculateShareRatio: (owner: Owner) => number;
}

export const CHART_COLORS = [
  "#4f46e5",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0e7490",
  "#be185d",
  "#65a30d",
  "#c026d3",
  "#ea580c",
  "#1d4ed8",
  "#0f766e",
];

export const ResultCharts = ({ owners, dags, result, calculateShareRatio }: ResultChartsProps) => {
  if (owners.length === 0) return null;

  const totalLand = owners.reduce((sum, o) => sum + (o.totalLand || 0), 0) || 1;
  const maxOwnerLand = Math.max(...owners.map((o) => o.totalLand || 0), 1);

  // ---- Donut segments (owner share %) ----
  const R = 70;
  const C = 2 * Math.PI * R;
  let accumulated = 0;
  const segments = owners.map((owner, i) => {
    const pct = calculateShareRatio(owner);
    const start = accumulated;
    accumulated += pct;
    return { owner, pct, start, color: CHART_COLORS[i % CHART_COLORS.length] };
  });

  return (
    <div className="mb-6 break-inside-avoid">
      <h3 className="font-bold text-lg mb-3">৪. ভিজ্যুয়াল চার্ট</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Donut: মালিকানার অংশ ── */}
        <div className="border border-[#4b5563] rounded-lg p-4 bg-[#f9fafb]">
          <h4 className="font-semibold text-sm md:text-base mb-3 text-center">মালিকানার অংশ (%)</h4>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative shrink-0">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r={R} fill="none" stroke="#e5e7eb" strokeWidth="26" />
                {segments.map((s, i) =>
                  s.pct > 0 ? (
                    <circle
                      key={i}
                      cx="90"
                      cy="90"
                      r={R}
                      fill="none"
                      stroke={s.color}
                      strokeWidth="26"
                      strokeDasharray={`${(s.pct * C).toFixed(2)} ${(C - s.pct * C).toFixed(2)}`}
                      strokeDashoffset={`${(-s.start * C + C / 4).toFixed(2)}`}
                      strokeLinecap="butt"
                    />
                  ) : null,
                )}
                <text x="90" y="86" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#111827">
                  {toBengaliNumber(totalLand.toFixed(2))}
                </text>
                <text x="90" y="104" textAnchor="middle" fontSize="11" fill="#6b7280">
                  মোট শতক
                </text>
              </svg>
            </div>
            <ul className="flex-1 w-full space-y-1.5 text-xs md:text-sm">
              {segments.map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="flex-1 truncate">{s.owner.name}</span>
                  <span className="font-semibold whitespace-nowrap">{toBengaliNumber((s.pct * 100).toFixed(2))}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bars: মালিকভিত্তিক মোট জমি ── */}
        <div className="border border-[#4b5563] rounded-lg p-4 bg-[#f9fafb]">
          <h4 className="font-semibold text-sm md:text-base mb-3 text-center">মালিকভিত্তিক মোট জমি (শতক)</h4>
          <div className="space-y-2.5">
            {owners.map((owner, i) => {
              const land = owner.totalLand || 0;
              const widthPct = Math.max((land / maxOwnerLand) * 100, land > 0 ? 4 : 0);
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs md:text-sm mb-1 gap-2">
                    <span className="truncate font-medium">{owner.name}</span>
                    <span className="font-semibold whitespace-nowrap">{toBengaliNumber(land.toFixed(2))}</span>
                  </div>
                  <div className="w-full bg-[#e5e7eb] rounded-full h-4 overflow-hidden">
                    <div
                      className="h-4 rounded-full transition-all"
                      style={{ width: `${widthPct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* ── Stacked bars: দাগভিত্তিক বন্টন ── */}
      {dags.length > 0 && (
        <div className="border border-[#4b5563] rounded-lg p-4 bg-[#f9fafb] mt-4">
          <h4 className="font-semibold text-sm md:text-base mb-3 text-center">দাগভিত্তিক জমির বন্টন (শতক)</h4>
          <div className="space-y-3">
            {dags.map((dag, di) => {
              const rows = result.filter((r) => r.dagName === dag.name);
              return (
                <div key={di}>
                  <div className="flex justify-between text-xs md:text-sm mb-1 gap-2">
                    <span className="font-medium">দাগ {toBengaliNumber(dag.name)}</span>
                    <span className="font-semibold whitespace-nowrap">{toBengaliNumber(dag.land.toFixed(2))} শতক</span>
                  </div>
                  <div className="w-full flex h-5 rounded-full overflow-hidden bg-[#e5e7eb]">
                    {rows.map((row) => {
                      const ownerIdx = owners.findIndex((o) => o.name === row.ownerName);
                      const w = dag.land > 0 ? (row.land / dag.land) * 100 : 0;
                      return w > 0 ? (
                        <div
                          key={`${dag.name}-${row.ownerName}`}
                          title={`${row.ownerName}: ${row.land} শতক`}
                          style={{
                            width: `${w}%`,
                            backgroundColor: CHART_COLORS[(ownerIdx >= 0 ? ownerIdx : 0) % CHART_COLORS.length],
                          }}
                        />
                      ) : null;
                    })}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] md:text-xs text-gray-700">
                    {rows.map((row) => {
                      const ownerIdx = owners.findIndex((o) => o.name === row.ownerName);
                      return (
                        <span key={`${dag.name}-lbl-${row.ownerName}`} className="flex items-center gap-1">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-sm"
                            style={{
                              backgroundColor: CHART_COLORS[(ownerIdx >= 0 ? ownerIdx : 0) % CHART_COLORS.length],
                            }}
                          />
                          {row.ownerName} ({toBengaliNumber(row.land.toFixed(2))})
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
