import { anaOptions, gondaOptions, koraOptions, krantiOptions, tilOptions } from "../constants/options";
import { DagGongAllocation } from "../types";

const cleanSymbolLabel = (rawLabel: string): string => {
  return rawLabel.replace(/\s*\([^)]*\)/g, " ").trim();
};

export const formatGongShare = (entry: DagGongAllocation): string => {
  const parts: string[] = [];

  if ((entry.ana ?? 0) > 0) {
    const raw = anaOptions.find((option) => option.value === entry.ana)?.label ?? "";
    parts.push(cleanSymbolLabel(raw));
  }
  if ((entry.gonda ?? 0) > 0) {
    const raw = gondaOptions.find((option) => option.value === entry.gonda)?.label ?? "";
    parts.push(cleanSymbolLabel(raw));
  }
  if ((entry.kora ?? 0) > 0) {
    const raw = koraOptions.find((option) => option.value === entry.kora)?.label ?? "";
    parts.push(cleanSymbolLabel(raw));
  }
  if ((entry.kranti ?? 0) > 0) {
    const raw = krantiOptions.find((option) => option.value === entry.kranti)?.label ?? "";
    parts.push(cleanSymbolLabel(raw));
  }
  if ((entry.til ?? 0) > 0) {
    const raw = tilOptions.find((option) => option.value === entry.til)?.label ?? "";
    parts.push(cleanSymbolLabel(raw));
  }

  return parts.filter(Boolean).join("\u2009");
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
