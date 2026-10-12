import { Dag, KhatiyanHeader, Owner } from "../types";

export interface SavedKhatiyanEntry {
  id: string;
  name: string;
  header: KhatiyanHeader;
  owners: Owner[];
  dags: Dag[];
  createdAt: number;
  updatedAt: number;
}

const LIBRARY_KEY = "khatiyan_library_v1";
const MAX_ENTRIES = 20;

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `kh_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

/** Auto-name from header: "বি এস ৫৫ — গুয়াপঞ্চক" */
export const buildEntryName = (header: KhatiyanHeader, existingNames: string[] = []): string => {
  const parts: string[] = [];
  if (header.surveyType?.trim()) parts.push(header.surveyType.trim());
  if (header.khatiyanNo?.trim()) parts.push(header.khatiyanNo.trim());
  let base = parts.join(" ");
  if (header.mouja?.trim()) base = base ? `${base} — ${header.mouja.trim()}` : header.mouja.trim();
  if (!base) base = `খতিয়ান ${new Date().toLocaleDateString("bn-BD")}`;

  if (!existingNames.includes(base)) return base;
  let i = 2;
  while (existingNames.includes(`${base} (${i})`)) i++;
  return `${base} (${i})`;
};

export const isWorkspaceEmpty = (owners: Owner[], dags: Dag[]): boolean =>
  owners.length === 0 && dags.length === 0;

export const listEntries = (): SavedKhatiyanEntry[] => {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as SavedKhatiyanEntry[]).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error("Error listing khatiyan library:", error);
    return [];
  }
};

/** Insert new or update existing (by id). Returns the saved entry or null on failure. */
export const saveEntry = (data: {
  id?: string;
  name?: string;
  header: KhatiyanHeader;
  owners: Owner[];
  dags: Dag[];
}): SavedKhatiyanEntry | null => {
  try {
    const entries = listEntries();
    const now = Date.now();

    if (data.id) {
      const idx = entries.findIndex((e) => e.id === data.id);
      if (idx >= 0) {
        const updated: SavedKhatiyanEntry = {
          ...entries[idx],
          name: data.name?.trim() || entries[idx].name,
          header: data.header,
          owners: data.owners,
          dags: data.dags,
          updatedAt: now,
        };
        entries[idx] = updated;
        localStorage.setItem(LIBRARY_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
        return updated;
      }
    }

    const entry: SavedKhatiyanEntry = {
      id: generateId(),
      name: data.name?.trim() || buildEntryName(data.header, entries.map((e) => e.name)),
      header: data.header,
      owners: data.owners,
      dags: data.dags,
      createdAt: now,
      updatedAt: now,
    };
    const next = [entry, ...entries].slice(0, MAX_ENTRIES);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
    return entry;
  } catch (error) {
    console.error("Error saving khatiyan entry:", error);
    return null;
  }
};

export const loadEntry = (id: string): SavedKhatiyanEntry | null => {
  try {
    return listEntries().find((e) => e.id === id) ?? null;
  } catch (error) {
    console.error("Error loading khatiyan entry:", error);
    return null;
  }
};

export const renameEntry = (id: string, name: string): boolean => {
  try {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const entries = listEntries();
    const idx = entries.findIndex((e) => e.id === id);
    if (idx < 0) return false;
    entries[idx] = { ...entries[idx], name: trimmed, updatedAt: Date.now() };
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error("Error renaming khatiyan entry:", error);
    return false;
  }
};

export const deleteEntry = (id: string): boolean => {
  try {
    const next = listEntries().filter((e) => e.id !== id);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
    return true;
  } catch (error) {
    console.error("Error deleting khatiyan entry:", error);
    return false;
  }
};

export const exportLibrary = (): string => JSON.stringify(listEntries(), null, 2);

/** Validate + import entries from a JSON string. Returns count imported. */
export const importLibrary = (json: string): { imported: number; skipped: number } => {
  const parsed = JSON.parse(json);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  const existing = listEntries();
  const existingNames = new Set(existing.map((e) => e.name));
  const now = Date.now();
  let imported = 0;
  let skipped = 0;

  const valid: SavedKhatiyanEntry[] = [];
  for (const item of arr) {
    if (
      item &&
      typeof item === "object" &&
      Array.isArray((item as SavedKhatiyanEntry).owners) &&
      Array.isArray((item as SavedKhatiyanEntry).dags) &&
      typeof (item as SavedKhatiyanEntry).header === "object"
    ) {
      const e = item as SavedKhatiyanEntry;
      let name = typeof e.name === "string" && e.name.trim() ? e.name.trim() : "";
      if (!name || existingNames.has(name)) {
        name = buildEntryName(e.header ?? ({} as KhatiyanHeader), [
          ...existingNames,
          ...valid.map((v) => v.name),
        ]);
      }
      existingNames.add(name);
      valid.push({
        id: generateId(),
        name,
        header: e.header,
        owners: e.owners,
        dags: e.dags,
        createdAt: typeof e.createdAt === "number" ? e.createdAt : now,
        updatedAt: now,
      });
      imported++;
    } else {
      skipped++;
    }
  }

  if (valid.length > 0) {
    const next = [...valid.sort((a, b) => b.updatedAt - a.updatedAt), ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
  }
  return { imported, skipped };
};
