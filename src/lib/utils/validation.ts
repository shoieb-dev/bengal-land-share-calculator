import { Owner, Dag, ValidationError } from "../types";
import { computeHeirShares } from "./heirShare";

export const calculateShareRatio = (owner: Owner): number => {
  return owner.ana / 16 + owner.gonda / 320 + owner.kora / 1280 + owner.kranti / 3840 + owner.til / 76800;
};

export const totalShareRatio = (owners: Owner[]): number => {
  return owners.reduce((sum, owner) => sum + calculateShareRatio(owner), 0);
};

export interface AnaGondaBreakdown {
  ana: number;
  gonda: number;
  kora: number;
  kranti: number;
  til: number;
}

/**
 * যেকোনো হিস্যা অনুপাত (০–১) কে আনা-গণ্ডা-কড়া-ক্রান্তি-তিলে ভাঙে।
 * ১৬ আনা = ১, ১ আনা = ২০ গণ্ডা, ১ গণ্ডা = ৪ কড়া, ১ কড়া = ৩ ক্রান্তি, ১ ক্রান্তি = ২০ তিল।
 * কার্যকর হিস্যা থেকে "কার্যকর ১৬ আনা অংশ" দেখাতে ব্যবহৃত হয়।
 */
export const ratioToAnaGonda = (ratio: number): AnaGondaBreakdown => {
  const totalTil = Math.round(Math.max(0, ratio) * 16 * 20 * 4 * 3 * 20);
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

export interface NormalizedShare {
  /** মালিকের মূল হিস্যা (mutation-এর আগের অংশ) */
  originalShare: number;
  /** বর্তমান কার্যকর হিস্যা (সক্রিয়দের মধ্যে নরমালাইজড); mutated হলে 0 */
  effectiveShare: number;
  /** সক্রিয় মালিকদের মূল অংশের যোগফল */
  totalActiveShare: number;
  /** নামজারিকৃতদের মূল অংশের যোগফল */
  totalMutatedShare: number;
}

export interface NormalizedOwnerShare extends NormalizedShare {
  owner: Owner;
  mutated: boolean;
}

/**
 * নামজারি পরবর্তী অবশিষ্ট হিস্যা পুনর্নির্ধারণ (Mutation & Share Normalization)।
 *
 * effectiveShare = originalShare / totalActiveShare — ফলে সক্রিয় সবার
 * কার্যকর হিস্যার যোগফল সবসময় ১ (১০০%) হয়। Mutated মালিকের effectiveShare 0।
 */
export const normalizeShares = (owners: Owner[]): NormalizedOwnerShare[] => {
  const originalShares = owners.map((owner) => calculateShareRatio(owner));

  // কার্যকর অংশ: নামজারিকৃত মালিক বাদ + মৃত মালিকের নামজারিকৃত ওয়ারিশের অংশও বাদ
  // (ওয়ারিশের নামজারিতে মালিকের লাইন থেকেও জমি কমে)
  const activePortions = owners.map((owner, i) => {
    if (owner.mutated) return 0;
    let portion = originalShares[i];
    if (owner.deceased && owner.heirs && owner.heirs.length > 0) {
      portion *= 1 - computeHeirShares(owner.heirs).totalMutatedShare;
    }
    return portion;
  });

  const totalActiveShare = activePortions.reduce((sum, p) => sum + p, 0);
  const totalMutatedShare = owners.reduce(
    (sum, owner, i) => (owner.mutated ? sum + originalShares[i] : sum),
    0,
  );

  return owners.map((owner, i) => {
    const mutated = !!owner.mutated;
    return {
      owner,
      mutated,
      originalShare: originalShares[i],
      effectiveShare:
        mutated || totalActiveShare <= 0 ? 0 : activePortions[i] / totalActiveShare,
      totalActiveShare,
      totalMutatedShare,
    };
  });
};

export const validate = (owners: Owner[], dags: Dag[]): ValidationError[] => {
  const newErrors: ValidationError[] = [];

  if (owners.length === 0) {
    newErrors.push({ type: "owners", message: "অন্তত একজন মালিক যোগ করুন" });
  }

  if (dags.length === 0) {
    newErrors.push({ type: "dags", message: "অন্তত একটি দাগ যোগ করুন" });
  }

  owners.forEach((owner, i) => {
    const name = owner.name.trim();
    if (!name) {
      newErrors.push({ type: "owner", message: `মালিক #${i + 1} এর নাম লিখুন` });
    }

    const ratio = calculateShareRatio(owner);
    if (ratio === 0) {
      newErrors.push({ type: "owner", message: `${name || `মালিক #${i + 1}`} এর অংশ নির্বাচন করুন` });
    }
  });

  dags.forEach((dag, i) => {
    if (!dag.name.trim()) {
      newErrors.push({ type: "dag", message: `দাগ #${i + 1} এর নাম লিখুন` });
    }
    if (dag.land <= 0) {
      newErrors.push({ type: "dag", message: `দাগ #${i + 1} এর জমির পরিমাণ ০ এর বেশি হতে হবে` });
    }
  });

  const totalRatioValue = totalShareRatio(owners);
  if (totalRatioValue > 1.009) {
    newErrors.push({ type: "total", message: "মোট মালিকানা ১৬ আনা (১০০%) বেশি হতে পারে না!" });
  }

  return newErrors;
};
