import { Heir } from "../types";

/**
 * ওয়ারিশদের অংশ হিসাব (ইসলামি ফারায়েয — সাধারণ ক্ষেত্র)।
 *
 * ✅ কভার করে: স্ত্রী / স্বামী / ছেলে / মেয়ে
 *   - স্ত্রী: সন্তান থাকলে ১/৮, না থাকলে ১/৪
 *   - স্বামী: সন্তান থাকলে ১/৪, না থাকলে ১/২
 *   - অবশিষ্টাংশ: ছেলে ২ ভাগ, মেয়ে ১ ভাগ অনুপাতে
 *
 * ⚠️ জটিল ক্ষেত্র (বাবা/মা/দাদা/নানি/ভাই-বোন) v1-এ হিসাব করা হয়নি —
 *    সন্তান না থাকলে বাকি অংশ unallocated হিসেবে ফেরত আসে।
 */
export interface HeirShareResult {
  /** heirId → অংশ (মৃত মালিকের সম্পত্তির ভগ্নাংশ) */
  shares: Record<string, number>;
  /** বণ্টিত না হওয়া অবশিষ্টাংশ (জটিল ক্ষেত্রে > 0) */
  unallocated: number;
}

export const HEIR_RELATION_LABELS: Record<Heir["relation"], string> = {
  wife: "স্ত্রী",
  husband: "স্বামী",
  son: "ছেলে",
  daughter: "মেয়ে",
};

export const computeHeirShares = (heirs: Heir[]): HeirShareResult => {
  const wife = heirs.filter((h) => h.relation === "wife");
  const husband = heirs.filter((h) => h.relation === "husband");
  const sons = heirs.filter((h) => h.relation === "son");
  const daughters = heirs.filter((h) => h.relation === "daughter");
  const hasChildren = sons.length + daughters.length > 0;

  const shares: Record<string, number> = {};

  // নির্দিষ্ট ভাগ (ফরজ)
  wife.forEach((h) => {
    shares[h.id] = hasChildren ? 1 / 8 : 1 / 4;
  });
  husband.forEach((h) => {
    shares[h.id] = hasChildren ? 1 / 4 : 1 / 2;
  });

  const fixedTotal =
    wife.length * (hasChildren ? 1 / 8 : 1 / 4) + husband.length * (hasChildren ? 1 / 4 : 1 / 2);
  const residue = Math.max(0, 1 - fixedTotal);

  if (hasChildren) {
    const units = sons.length * 2 + daughters.length * 1;
    sons.forEach((h) => {
      shares[h.id] = (residue * 2) / units;
    });
    daughters.forEach((h) => {
      shares[h.id] = residue / units;
    });
    return { shares, unallocated: 0 };
  }

  // সন্তান নেই — বাকি অংশ (বাবা/মা/ভাই-বোন) v1-এ হিসাব করা হয়নি
  return { shares, unallocated: Math.max(0, 1 - fixedTotal) };
};