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

export type PresetBackup = {
  version: number;
  exportedAt: string;
  ownerPresets: OwnerPreset[];
  warishPresets: HeirTemplate[];
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

const createPresetId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isOwnerPreset = (value: unknown): value is OwnerPreset => {
  if (!isRecord(value) || typeof value.name !== "string" || !value.name.trim() || !Array.isArray(value.owners)) {
    return false;
  }
  return value.owners.every((owner) => {
    if (!isRecord(owner) || typeof owner.name !== "string" || !owner.name.trim()) return false;
    return ["ana", "gonda", "kora", "kranti", "til"].every(
      (field) => typeof owner[field] === "number" && Number.isFinite(owner[field]),
    );
  });
};

const isHeirTemplate = (value: unknown): value is HeirTemplate => {
  if (!isRecord(value) || typeof value.name !== "string" || !value.name.trim() || !Array.isArray(value.heirs)) {
    return false;
  }
  const relations = new Set(["wife", "husband", "son", "daughter", "brother", "sister"]);
  return value.heirs.every(
    (heir) =>
      isRecord(heir) &&
      typeof heir.name === "string" &&
      heir.name.trim() &&
      typeof heir.relation === "string" &&
      relations.has(heir.relation),
  );
};

const normalizeOwnerPreset = (value: OwnerPreset): OwnerPreset => ({
  id: typeof value.id === "string" && value.id.trim() ? value.id : createPresetId(),
  name: value.name.trim(),
  owners: value.owners.map((owner) => ({
    ...owner,
    name: owner.name.trim(),
    heirs: owner.heirs?.map((heir) => ({
      ...heir,
      id: typeof heir.id === "string" && heir.id.trim() ? heir.id : createPresetId(),
      name: heir.name.trim(),
    })),
  })),
});

const normalizeHeirTemplate = (value: HeirTemplate): HeirTemplate => ({
  id: typeof value.id === "string" && value.id.trim() ? value.id : createPresetId(),
  name: value.name.trim(),
  heirs: value.heirs.map((heir) => ({
    ...heir,
    name: heir.name.trim(),
  })),
});

export const exportPresetBackup = (): string => {
  const backup: PresetBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    ownerPresets: loadOwnerPresets(),
    warishPresets: loadHeirTemplates(),
  };
  return JSON.stringify(backup, null, 2);
};

export const importPresetBackup = (
  json: string,
): { imported: number; updated: number; skipped: number } => {
  const parsed: unknown = JSON.parse(json);
  if (!isRecord(parsed)) {
    throw new Error("Invalid preset backup: root must be a JSON object");
  }
  if (parsed.version !== undefined && parsed.version !== 1) {
    throw new Error("Unsupported preset backup version");
  }
  if (!Array.isArray(parsed.ownerPresets) || !Array.isArray(parsed.warishPresets)) {
    throw new Error("Invalid preset backup: ownerPresets and warishPresets arrays are required");
  }

  const existingOwners = loadOwnerPresets();
  const existingHeirs = loadHeirTemplates();
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const value of parsed.ownerPresets) {
    if (!isOwnerPreset(value)) {
      skipped++;
      continue;
    }
    const incoming = normalizeOwnerPreset(value);
    const index = existingOwners.findIndex(
      (preset) => preset.id === incoming.id || preset.name.trim().toLocaleLowerCase() === incoming.name.toLocaleLowerCase(),
    );
    if (index >= 0) {
      existingOwners[index] = { ...incoming, id: existingOwners[index].id };
      updated++;
    } else {
      existingOwners.push(incoming);
      imported++;
    }
  }

  for (const value of parsed.warishPresets) {
    if (!isHeirTemplate(value)) {
      skipped++;
      continue;
    }
    const incoming = normalizeHeirTemplate(value);
    const index = existingHeirs.findIndex(
      (template) =>
        template.id === incoming.id ||
        template.name.trim().toLocaleLowerCase() === incoming.name.toLocaleLowerCase(),
    );
    if (index >= 0) {
      existingHeirs[index] = { ...incoming, id: existingHeirs[index].id };
      updated++;
    } else {
      existingHeirs.push(incoming);
      imported++;
    }
  }

  saveOwnerPresets(existingOwners);
  saveHeirTemplates(existingHeirs);
  return { imported, updated, skipped };
};
