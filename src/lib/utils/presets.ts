import { Heir, Owner } from "@/lib/types";

export type OwnerPreset = {
  id: string;
  name: string;
  owners: Owner[];
};

export type HeirTemplate = {
  id: string;
  name: string;
  heirs: Array<Pick<Heir, "name" | "relation" | "mutated">>;
};

const OWNER_PRESETS_KEY = "khatian_owner_group_presets";
const HEIR_TEMPLATES_KEY = "khatian_heir_templates";

const readPresets = <T>(key: string): T[] => {
  const saved = localStorage.getItem(key);
  if (!saved) return [];

  const parsed: unknown = JSON.parse(saved);
  if (!Array.isArray(parsed)) {
    throw new Error(`Invalid preset data stored for ${key}`);
  }
  return parsed as T[];
};

export const loadOwnerPresets = (): OwnerPreset[] => readPresets<OwnerPreset>(OWNER_PRESETS_KEY);
export const saveOwnerPresets = (presets: OwnerPreset[]): void => {
  localStorage.setItem(OWNER_PRESETS_KEY, JSON.stringify(presets));
};

export const loadHeirTemplates = (): HeirTemplate[] => readPresets<HeirTemplate>(HEIR_TEMPLATES_KEY);
export const saveHeirTemplates = (templates: HeirTemplate[]): void => {
  localStorage.setItem(HEIR_TEMPLATES_KEY, JSON.stringify(templates));
};
