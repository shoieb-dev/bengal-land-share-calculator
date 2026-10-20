// ─── Reverse (area → share) conversions ───
// Forward direction (share → area) lives in validation.ts:calculateShareRatio.
// 16 ana = 1 (full). 1 ana = 20 gonda, 1 gonda = 4 kora, 1 kora = 3 kranti, 1 kranti = 20 til.
//
// Area chain: 1 shotok = 435.6 sqft. 1 katha = 721.46 sqft (= 1.65651 shotok).
// 1 kani (Chittagong) = 16000 sqft ≈ 36.7298 shotok = 20 gonda → 1 gonda = 2 shotok.
//
// "Khatiyan-total mode": given total land T (shotok), an area A means share A/T.

export const SQFT_PER_SHOTOK = 435.6;
export const SQFT_PER_KATHA = 721.46;
export const SHOTOK_PER_GONDA = 2;
export const SQM_PER_SQFT = 0.092903;
export const SQYD_PER_SQFT = 1 / 9;

export interface AnaGondaShare {
  ana: number;
  gonda: number;
  kora: number;
  kranti: number;
  til: number;
}

export type AreaUnit = "shotok" | "sqft" | "katha" | "sqm" | "sqyd" | "point" | "sohosrangsho";

export const AREA_UNITS: { value: AreaUnit; label: string; toShotok: (v: number) => number }[] = [
  { value: "shotok", label: "শতক", toShotok: (v) => v },
  { value: "sqft", label: "বর্গফুট", toShotok: (v) => v / SQFT_PER_SHOTOK },
  { value: "katha", label: "কাঠা", toShotok: (v) => (v * SQFT_PER_KATHA) / SQFT_PER_SHOTOK },
  { value: "sqm", label: "বর্গমিটার", toShotok: (v) => v / SQM_PER_SQFT / SQFT_PER_SHOTOK },
  { value: "sqyd", label: "বর্গগজ", toShotok: (v) => v / SQYD_PER_SQFT / SQFT_PER_SHOTOK },
  { value: "point", label: "পয়েন্ট", toShotok: (v) => v / 100 },
  { value: "sohosrangsho", label: "সহস্রাংশ", toShotok: (v) => v / 1000 },
];

/** Absolute area (shotok) → ana-gonda-kora-kranti-til. */
export const shotokToAnaGonda = (shotok: number): AnaGondaShare => {
  const totalTil = Math.round(Math.max(0, shotok) * 16 * 20 * 4 * 3 * 20);
  const TIL_PER_KRANTI = 20;
  const TIL_PER_KORA = 3 * TIL_PER_KRANTI;
  const TIL_PER_GONDA = 4 * TIL_PER_KORA;
  const TIL_PER_ANA = 20 * TIL_PER_GONDA;

  let rest = totalTil;
  const ana = Math.floor(rest / TIL_PER_ANA);
  rest -= ana * TIL_PER_ANA;
  const gonda = Math.floor(rest / TIL_PER_GONDA);
  rest -= gonda * TIL_PER_GONDA;
  const kora = Math.floor(rest / TIL_PER_KORA);
  rest -= kora * TIL_PER_KORA;
  const kranti = Math.floor(rest / TIL_PER_KRANTI);
  rest -= kranti * TIL_PER_KRANTI;
  return { ana, gonda, kora, kranti, til: rest };
};

export interface AreaBreakdown {
  shotok: number;
  sqft: number;
  sqm: number;
  sqyd: number;
  katha: number;
  point: number;
  sohosrangsho: number;
}

/** One shotok value fanned out to every display unit. */
export const shotokToAllUnits = (shotok: number): AreaBreakdown => {
  const sqft = shotok * SQFT_PER_SHOTOK;
  return {
    shotok,
    sqft,
    sqm: sqft * SQM_PER_SQFT,
    sqyd: sqft * SQYD_PER_SQFT,
    katha: sqft / SQFT_PER_KATHA,
    point: shotok * 100,
    sohosrangsho: shotok * 1000,
  };
};
