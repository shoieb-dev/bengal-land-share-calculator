import { Owner, Dag, KhatiyanHeader } from "../types";

const STORAGE_KEYS = {
  HEADER: "khatian_header",
  OWNERS: "khatian_owners",
  DAGS: "khatian_dags",
  LAST_SAVED: "khatian_last_saved",
  AUTO_SAVE_ENABLED: "khatian_auto_save",
};

export interface StoredData {
  header: KhatiyanHeader;
  owners: Owner[];
  dags: Dag[];
  timestamp: number;
}

// Save data to localStorage
export const saveToLocalStorage = (header: KhatiyanHeader, owners: Owner[], dags: Dag[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.HEADER, JSON.stringify(header));
    localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(owners));
    localStorage.setItem(STORAGE_KEYS.DAGS, JSON.stringify(dags));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, Date.now().toString());

    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
};

// Load data from localStorage
export const loadFromLocalStorage = (): StoredData | null => {
  try {
    const headerStr = localStorage.getItem(STORAGE_KEYS.HEADER);
    const ownersStr = localStorage.getItem(STORAGE_KEYS.OWNERS);
    const dagsStr = localStorage.getItem(STORAGE_KEYS.DAGS);
    const timestampStr = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);

    if (!ownersStr || !dagsStr) {
      return null;
    }

    // Default header if not exists (for backward compatibility)
    const defaultHeader: KhatiyanHeader = {
      surveyType: "",
      district: "",
      khatiyanNo: "",
      thana: "",
      mouja: "",
      jlNo: "",
    };

    return {
      owners: JSON.parse(ownersStr),
      dags: JSON.parse(dagsStr),
      header: headerStr ? JSON.parse(headerStr) : defaultHeader,
      timestamp: timestampStr ? parseInt(timestampStr) : Date.now(),
    };
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};

// Clear localStorage
export const clearLocalStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.HEADER);
    localStorage.removeItem(STORAGE_KEYS.OWNERS);
    localStorage.removeItem(STORAGE_KEYS.DAGS);
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVED);
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};

// Check if data exists
export const hasStoredData = (): boolean => {
  try {
    return !!(localStorage.getItem(STORAGE_KEYS.OWNERS) && localStorage.getItem(STORAGE_KEYS.DAGS));
  } catch (error) {
    return false;
  }
};

// Get last saved time
export const getLastSavedTime = (): Date | null => {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
    return timestamp ? new Date(parseInt(timestamp)) : null;
  } catch (error) {
    return null;
  }
};

// Auto-save settings
export const setAutoSaveEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_ENABLED, enabled.toString());
  } catch (error) {
    console.error("Error setting auto-save:", error);
  }
};

export const isAutoSaveEnabled = (): boolean => {
  try {
    const enabled = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE_ENABLED);
    return enabled !== "false"; // Default to true
  } catch (error) {
    return true;
  }
};

// Format time ago
export const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "এইমাত্র";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} মিনিট আগে`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ঘন্টা আগে`;
  return `${Math.floor(seconds / 86400)} দিন আগে`;
};
