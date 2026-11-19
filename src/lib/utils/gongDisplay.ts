import { anaOptions, gondaOptions, koraOptions, krantiOptions, tilOptions } from "../constants/options";
import { DagGongAllocation } from "../types";

export const formatGongShare = (entry: DagGongAllocation): string => {
  const parts: string[] = [];

  if ((entry.ana ?? 0) > 0) {
    parts.push(anaOptions.find((option) => option.value === entry.ana)?.label ?? "");
  }
  if ((entry.gonda ?? 0) > 0) {
    parts.push(gondaOptions.find((option) => option.value === entry.gonda)?.label ?? "");
  }
  if ((entry.kora ?? 0) > 0) {
    parts.push(koraOptions.find((option) => option.value === entry.kora)?.label ?? "");
  }
  if ((entry.kranti ?? 0) > 0) {
    parts.push(krantiOptions.find((option) => option.value === entry.kranti)?.label ?? "");
  }
  if ((entry.til ?? 0) > 0) {
    parts.push(tilOptions.find((option) => option.value === entry.til)?.label ?? "");
  }

  return parts.filter(Boolean).join(" ");
};

export const formatGongRemarks = (entries: DagGongAllocation[] | undefined): string => {
  if (!entries?.length) return "";

  return entries
    .map((entry) => {
      const owners = entry.ownerNames.filter(Boolean).join(", ");
      const share = formatGongShare(entry);
      if (!owners) return "";
      return share ? `${owners} (${share})` : `${owners} (সম্পূর্ণ দাগ)`;
    })
    .filter(Boolean)
    .join("\n");
};
