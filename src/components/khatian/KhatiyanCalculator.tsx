"use client";
import { Dag, DeleteModalType, Heir, KhatiyanHeader, Owner, ResetModalType, ResultRow, ValidationError } from "@/lib/types";
import { parseNumber, toBengaliNumber } from "@/lib/conversions/numberConversion";
import {
  clearLocalStorage,
  getLastSavedTime,
  hasStoredData,
  isAutoSaveEnabled,
  loadFromLocalStorage,
  saveToLocalStorage,
  setAutoSaveEnabled as setStorageAutoSave,
} from "@/lib/utils/storage";
import { normalizeShares } from "@/lib/utils/validation";
import { computeHeirShares } from "@/lib/utils/heirShare";
import { Calculator, FileText, RotateCcw, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { showToast } from "@/lib/utils/toast";
import ThemeToggle from "./ui/ThemeToggle";
import AppToast from "../common/AppToast";
import AutoSaveIndicator from "./ui/AutoSaveIndicator";
import DagForm from "./forms/DagForm";
import { DeleteModal } from "../common/DeleteModal";
import { ErrorModal } from "../common/ErrorModal";
import KhatiyanHeaderForm from "./forms/KhatiyanHeaderForm";
import LoadDataModal from "./modals/LoadDataModal";
import { OwnerForm } from "./forms/OwnerForm";
import { ResetModal } from "./modals/ResetModal";
import { ResultTable } from "./visualization/ResultTable";
import TemplateModal from "./modals/TemplateModal";
import SavedKhatiyansModal from "./modals/SavedKhatiyansModal";
import {
  deleteEntry as deleteLibraryEntry,
  exportLibrary,
  importLibrary,
  isWorkspaceEmpty,
  listEntries,
  renameEntry as renameLibraryEntry,
  saveEntry as saveLibraryEntry,
  SavedKhatiyanEntry,
} from "@/lib/utils/khatiyanLibrary";
import { KhatiyanTemplate } from "@/lib/constants/templates";
import { Archive, FilePlus2, Layout, LibraryBig } from "lucide-react";
import ComplexTemplateModal from "./modals/ComplexTemplateModal";

// Main Component
export default function KhatiyanCalculator() {
  const { theme, toggleTheme, mounted } = useTheme();
  const [dags, setDags] = useState<Dag[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [result, setResult] = useState<ResultRow[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModalType>({ show: false, type: null, index: -1, name: "" });
  const [resetModal, setResetModal] = useState<ResetModalType>({ show: false });
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showComplexTemplateModal, setShowComplexTemplateModal] = useState(false);
  const [header, setHeader] = useState<KhatiyanHeader>({
    surveyType: "বি এস",
    district: "চট্টগ্রাম",
    khatiyanNo: "৫৫",
    thana: "আনোয়ারা",
    mouja: "গুয়াপঞ্চক",
    jlNo: "২",
  });

  // Add handler
  const handleLoadTemplate = (template: KhatiyanTemplate) => {
    // Load header
    setHeader({
      surveyType: template.header.surveyType || "বি এস",
      district: template.header.district || "চট্টগ্রাম",
      khatiyanNo: template.header.khatiyanNo || "",
      thana: template.header.thana || "",
      mouja: template.header.mouja || "",
      jlNo: template.header.jlNo || "",
    });

    // Load owners
    setOwners(template.owners as Owner[]);

    // Load dags
    setDags(template.dags);

    // Clear results
    setResult([]);
    setShowResult(false);

    // Save to storage
    handleAutoSave();
  };

  const handleLoadComplexTemplate = (templateOwners: Owner[]) => {
    setOwners(templateOwners);
    setDags([{ name: "১", land: 100 }]);
    setResult([]);
    setShowResult(false);
  };

  const [showLoadModal, setShowLoadModal] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [libraryEntries, setLibraryEntries] = useState<SavedKhatiyanEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Check for saved data on mount
  useEffect(() => {
    const autoSave = isAutoSaveEnabled();
    setAutoSaveEnabled(autoSave);

    if (hasStoredData()) {
      const savedTime = getLastSavedTime();
      setLastSavedTime(savedTime);
      setShowLoadModal(true);
    }
  }, []);

  // Auto-save function
  const handleAutoSave = useCallback(() => {
    if (!autoSaveEnabled) return;

    if (owners.length > 0 || dags.length > 0) {
      setIsSaving(true);
      const success = saveToLocalStorage(header, owners, dags);
      if (success) {
        setLastSavedTime(new Date());
      }
      setTimeout(() => setIsSaving(false), 500);
    }
  }, [owners, dags, header, autoSaveEnabled]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [handleAutoSave, autoSaveEnabled]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const timeoutId = setTimeout(() => {
      handleAutoSave();
    }, 2000); // 2 seconds after last change

    return () => clearTimeout(timeoutId);
  }, [header, owners, dags, handleAutoSave, autoSaveEnabled]);

  // Manual save function
  const handleManualSave = () => {
    setIsSaving(true);
    const success = saveToLocalStorage(header, owners, dags);
    if (success) {
      setLastSavedTime(new Date());
      showToast("ডেটা সফলভাবে সংরক্ষিত হয়েছে!", "success");
    } else {
      showToast("ডেটা সংরক্ষণ করতে সমস্যা হয়েছে", "error");
    }
    setTimeout(() => setIsSaving(false), 500);
  };

  // Load data from storage
  const handleLoadData = () => {
    const data = loadFromLocalStorage();
    if (data) {
      setHeader(data.header);
      setOwners(data.owners);
      setDags(data.dags);
      setLastSavedTime(new Date(data.timestamp));
    }
    setShowLoadModal(false);
  };

  // Discard saved data
  const handleDiscardData = () => {
    clearLocalStorage();
    setShowLoadModal(false);
    setLastSavedTime(null);
  };

  // Toggle auto-save
  const handleToggleAutoSave = (enabled: boolean) => {
    setAutoSaveEnabled(enabled);
    setStorageAutoSave(enabled);
    if (enabled) {
      handleAutoSave(); // Save immediately when enabled
    }
  };

  // Update reset function to clear storage
  const confirmReset = () => {
    setHeader({
      surveyType: "",
      district: "",
      khatiyanNo: "",
      thana: "",
      mouja: "",
      jlNo: "",
    });
    setDags([]);
    setOwners([]);
    setResult([]);
    setErrors([]);
    setShowResult(false);
    setShowErrorModal(false);
    setResetModal({ show: false });
    setActiveEntryId(null);
    clearLocalStorage(); // Clear saved data
    setLastSavedTime(null);
  };

  // Update handleHeaderChange
  const handleHeaderChange = (field: keyof KhatiyanHeader, value: string) => {
    setHeader({ ...header, [field]: value });
  };

  // ─── Saved Khatiyan Library (v1: localStorage, multiple named calculations) ──
  const refreshLibrary = useCallback(() => {
    setLibraryEntries(listEntries());
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  /** Snapshot current non-empty workspace into the library (no data loss on switch). */
  const snapshotWorkspace = useCallback(() => {
    if (isWorkspaceEmpty(owners, dags)) return;
    const saved = saveLibraryEntry({ id: activeEntryId ?? undefined, header, owners, dags });
    if (saved) setActiveEntryId(saved.id);
    refreshLibrary();
  }, [owners, dags, header, activeEntryId, refreshLibrary]);

  const handleSaveToLibrary = () => {
    if (isWorkspaceEmpty(owners, dags)) {
      showToast("সংরক্ষণের মতো কোনো ডেটা নেই", "error");
      return;
    }
    const saved = saveLibraryEntry({ id: activeEntryId ?? undefined, header, owners, dags });
    if (saved) {
      setActiveEntryId(saved.id);
      refreshLibrary();
      showToast(`“${saved.name}” সংরক্ষিত হয়েছে`, "success");
    } else {
      showToast("সংরক্ষণ করতে সমস্যা হয়েছে", "error");
    }
  };

  const handleOpenLibraryEntry = (entry: SavedKhatiyanEntry) => {
    if (entry.id !== activeEntryId) snapshotWorkspace();
    setHeader(entry.header);
    setOwners(entry.owners);
    setDags(entry.dags);
    setResult([]);
    setShowResult(false);
    setErrors([]);
    setActiveEntryId(entry.id);
    setShowLibraryModal(false);
    showToast(`“${entry.name}” খোলা হয়েছে`, "success");
  };

  const handleNewWorkspace = () => {
    snapshotWorkspace();
    setHeader({ surveyType: "", district: "", khatiyanNo: "", thana: "", mouja: "", jlNo: "" });
    setDags([]);
    setOwners([]);
    setResult([]);
    setErrors([]);
    setShowResult(false);
    setActiveEntryId(null);
    showToast("নতুন খতিয়ান শুরু করুন", "info");
  };

  const handleRenameEntry = (id: string, name: string) => {
    if (renameLibraryEntry(id, name)) {
      refreshLibrary();
      showToast("নাম পরিবর্তন হয়েছে", "success");
    } else {
      showToast("নাম পরিবর্তন করা যায়নি", "error");
    }
  };

  const handleDeleteEntry = (id: string) => {
    if (deleteLibraryEntry(id)) {
      if (activeEntryId === id) setActiveEntryId(null);
      refreshLibrary();
      showToast("খতিয়ান মুছে ফেলা হয়েছে", "success");
    } else {
      showToast("মুছতে সমস্যা হয়েছে", "error");
    }
  };

  const handleExportLibrary = () => {
    try {
      const blob = new Blob([exportLibrary()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `khatiyan-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("ব্যাকআপ ডাউনলোড হয়েছে", "success");
    } catch {
      showToast("ব্যাকআপ তৈরি করা যায়নি", "error");
    }
  };

  const handleImportLibrary = (json: string) => {
    const res = importLibrary(json);
    refreshLibrary();
    return res;
  };
  // ──────────────────────────────────────────────────────────────────────────

  const calculateShareRatio = (owner: Owner): number => {
    return owner.ana / 16 + owner.gonda / 320 + owner.kora / 1280 + owner.kranti / 3840 + owner.til / 76800;
  };

  const validate = (): ValidationError[] => {
    const newErrors: ValidationError[] = [];

    if (owners.length === 0) {
      newErrors.push({ type: "owners", message: "অন্তত একজন মালিক যোগ করুন" });
    }

    if (dags.length === 0) {
      newErrors.push({ type: "dags", message: "অন্তত একটি দাগ যোগ করুন" });
    }

    owners.forEach((owner, i) => {
      if (!owner.name.trim()) {
        newErrors.push({ type: "owner", message: `মালিক #${i + 1} এর নাম লিখুন` });
      }
      const ratio = calculateShareRatio(owner);
      if (ratio === 0) {
        newErrors.push({ type: "owner", message: `${owner.name || `মালিক #${i + 1}`} এর অংশ নির্বাচন করুন` });
      }
      if (owner.deceased) {
        if (!owner.heirs || owner.heirs.length === 0) {
          newErrors.push({
            type: "owner",
            message: `${owner.name || `মালিক #${i + 1}`} মৃত — অন্তত একজন ওয়ারিশ যোগ করুন`,
          });
        } else {
          owner.heirs.forEach((heir, j) => {
            if (!heir.name.trim()) {
              newErrors.push({
                type: "owner",
                message: `${owner.name || `মালিক #${i + 1}`} এর ওয়ারিশ #${j + 1} এর নাম লিখুন`,
              });
            }
          });
          if (owner.heirs.every((h) => h.mutated)) {
            newErrors.push({
              type: "owner",
              message: `${owner.name || `মালিক #${i + 1}`} — সব ওয়ারিশ নামজারিকৃত, অন্তত একজন সক্রিয় রাখুন`,
            });
          }
        }
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

    const totalRatio = owners.reduce((sum, owner) => sum + calculateShareRatio(owner), 0);
    if (totalRatio > 1.009) {
      newErrors.push({ type: "total", message: "মোট মালিকানা ১৬ আনার (১০০%) বেশি হতে পারে না!" });
    }

    return newErrors;
  };

  const addDag = () => setDags([...dags, { name: "", land: 0 }]);
  const addOwner = () => setOwners([...owners, { name: "", ana: 0, gonda: 0, kora: 0, kranti: 0, til: 0 }]);

  const handleDagChange = (index: number, field: keyof Dag, value: string | number) => {
    const newDags = [...dags];
    if (field === "land") {
      const parsedValue = typeof value === "string" ? parseNumber(value) : value;
      newDags[index][field] = Math.max(0, parsedValue);
    } else {
      newDags[index][field] = value as string;
    }
    setDags(newDags);
  };

  const handleBulkAddDags = (newDags: Dag[]) => {
    setDags([...dags, ...newDags]);
  };

  const handleOwnerChange = (index: number, field: keyof Owner, value: string | number | boolean) => {
    const newOwners = [...owners];
    if (field === "name") {
      newOwners[index][field] = value as string;
    } else if (field === "mutated" || field === "deceased") {
      newOwners[index][field] = value as boolean;
    } else if (field in newOwners[index]) {
      (newOwners[index] as any)[field] = Number(value);
    }
    setOwners(newOwners);
  };

  // ─── Heir (ওয়ারিশ) handlers ───
  const generateHeirId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `heir_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  };

  const handleAddHeir = (ownerIndex: number) => {
    setOwners((prev) =>
      prev.map((o, i) =>
        i === ownerIndex
          ? { ...o, heirs: [...(o.heirs ?? []), { id: generateHeirId(), name: "", relation: "son" }] }
          : o,
      ),
    );
  };

  const handleHeirChange = (ownerIndex: number, heirId: string, field: "name" | "relation" | "mutated", value: string | boolean) => {
    setOwners((prev) =>
      prev.map((o, i) =>
        i === ownerIndex
          ? {
              ...o,
              heirs: (o.heirs ?? []).map((h) => (h.id === heirId ? ({ ...h, [field]: value } as Heir) : h)),
            }
          : o,
      ),
    );
  };

  const handleDeleteHeir = (ownerIndex: number, heirId: string) => {
    setOwners((prev) =>
      prev.map((o, i) =>
        i === ownerIndex ? { ...o, heirs: (o.heirs ?? []).filter((h) => h.id !== heirId) } : o,
      ),
    );
  };

  const openDeleteModal = (type: "owner" | "dag", index: number, name: string) => {
    setDeleteModal({ show: true, type, index, name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, type: null, index: -1, name: "" });
  };

  const confirmDelete = () => {
    if (deleteModal.type === "dag") {
      setDags(dags.filter((_, i) => i !== deleteModal.index));
    } else if (deleteModal.type === "owner") {
      setOwners(owners.filter((_, i) => i !== deleteModal.index));
    }
    closeDeleteModal();
  };

  const handleReset = () => {
    setResetModal({ show: true });
  };

  const calculateResult = () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      setShowResult(false);
      setShowErrorModal(true);
      return;
    }

    const newResult: ResultRow[] = [];

    // ─── Mutation: দ্বৈত মডেল ───
    const normalized = normalizeShares(owners);

    const ownersWithTotalLand = normalized.map(
      ({ owner, originalShare, effectiveShare }: { owner: Owner; originalShare: number; effectiveShare: number }) => {
        const total = dags.reduce((acc, dag) => acc + dag.land * originalShare, 0);
        return {
          ...owner,
          totalLand: parseFloat(total.toFixed(4)),
          shareRatio: effectiveShare,
          originalShare,
          effectiveShare,
        };
      },
    );

    dags.forEach((dag) => {
      ownersWithTotalLand.forEach((owner) => {
        const land = parseFloat((dag.land * (owner.originalShare || 0)).toFixed(4));

        // মালিকের মূল রো (মৃত হলে muted + [মৃত] ট্যাগ দিয়ে দেখানো হবে)
        newResult.push({
          dagName: dag.name,
          ownerName: owner.name,
          land,
          isDeceased: owner.deceased,
        });

        // ─── ওয়ারিশ বণ্টন: মৃত মালিকের জমি তার ওয়ারিশদের মধ্যে ভাগ ───
        if (owner.deceased && owner.heirs && owner.heirs.length > 0) {
          const heirShares = computeHeirShares(owner.heirs);
          owner.heirs.forEach((heir) => {
            const share = heirShares.shares[heir.id] ?? 0;
            newResult.push({
              dagName: dag.name,
              ownerName: heir.name,
              land: parseFloat((land * share).toFixed(4)),
              isHeir: true,
              isHeirMutated: heir.mutated,
              parentOwner: owner.name,
              relation: heir.relation,
            });
          });
        }
      });
    });

    setResult(newResult);
    setOwners(ownersWithTotalLand);
    setShowResult(true);
    setErrors([]);
  };

  const totalSharePercentage = useMemo(() => {
    return owners.reduce((sum, owner) => sum + calculateShareRatio(owner) * 100, 0);
  }, [owners]);

  // ─── Mutation-aware totals: সক্রিয়দের মূল অংশ ও খারিজ অংশ (ওয়ারিশের নামজারিসহ) ───
  const { activeSharePercentage, mutatedSharePercentage, hasMutatedOwners } = useMemo(() => {
    let active = 0;
    let mutated = 0;
    owners.forEach((owner) => {
      const ratio = calculateShareRatio(owner) * 100;
      if (owner.mutated) {
        mutated += ratio;
        return;
      }
      // মৃত মালিকের নামজারিকৃত ওয়ারিশের অংশও খারিজ হয়ে যায়
      let mutatedHeirPct = 0;
      if (owner.deceased && owner.heirs && owner.heirs.length > 0) {
        mutatedHeirPct = computeHeirShares(owner.heirs).totalMutatedShare * ratio;
      }
      mutated += mutatedHeirPct;
      active += ratio - mutatedHeirPct;
    });
    return {
      activeSharePercentage: active,
      mutatedSharePercentage: mutated,
      hasMutatedOwners: mutated > 0.001,
    };
  }, [owners]);

  const handleReorderOwners = (newOwners: Owner[]) => {
    setOwners(newOwners);
  };

  const handleReorderDags = (newDags: Dag[]) => {
    setDags(newDags);
  };

  const handleDeleteAllDags = () => {
    setDags([]);
  };

  return (
    <div
      className="min-h-screen bg-linear-to-br from-slate-100 to-sky-200 dark:from-slate-950 dark:to-sky-950 py-4 md:py-8 px-3 md:px-4"
      style={{ fontFamily: "'Kalpurush', 'Noto Sans Bengali', 'SolaimanLipi', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 md:p-6 mb-6 border border-gray-200 dark:border-gray-700 print-hide">
          <div className="mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-700 dark:text-blue-300">
                খতিয়ান হিসাব
              </h1>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm md:text-base">
                জমির মালিকানা ও বন্টন হিসাব
              </p>
            </div>
          </div>

          <AutoSaveIndicator
            lastSaved={lastSavedTime}
            isSaving={isSaving}
            autoSaveEnabled={autoSaveEnabled}
            onToggleAutoSave={handleToggleAutoSave}
          />
          <div className="border-t border-gray-700 mb-2" />

          {/* Template Button */}
          <div className="flex justify-center gap-3 mb-4 flex-wrap">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
            >
              <Layout size={20} /> সাধারণ টেমপ্লেট
            </button>

            <button
              onClick={() => setShowComplexTemplateModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition shadow-lg flex items-center gap-2"
            >
              <FileText size={20} /> জটিল টেমপ্লেট
            </button>

            {/* ─── Saved library: open + new ─── */}
            <button
              onClick={() => {
                refreshLibrary();
                setShowLibraryModal(true);
              }}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition shadow-lg flex items-center gap-2 relative"
            >
              <LibraryBig size={20} /> সংরক্ষিত খতিয়ান
              {libraryEntries.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-6 h-6 flex items-center justify-center px-1.5">
                  {toBengaliNumber(String(libraryEntries.length))}
                </span>
              )}
            </button>

            <button
              onClick={handleNewWorkspace}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition shadow-lg flex items-center gap-2"
            >
              <FilePlus2 size={20} /> নতুন খতিয়ান
            </button>
          </div>

          {/* Khatian Header Form */}
          <KhatiyanHeaderForm header={header} onChange={handleHeaderChange} />

          {/* Total Share Indicator */}
          <div
            className={`p-3 rounded-lg mb-4 ${
              totalSharePercentage > 100
                ? "bg-red-100 border border-red-300 dark:bg-red-900 dark:border-red-700"
                : totalSharePercentage === 100
                  ? "bg-green-100 border border-green-300 dark:bg-green-900 dark:border-green-700"
                  : "bg-blue-100 border border-blue-300 dark:bg-blue-900 dark:border-blue-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm md:text-base">মোট মালিকানা:</span>
              <span
                className={`text-lg md:text-xl font-bold ${
                  totalSharePercentage > 100
                    ? "text-red-600 dark:text-red-400"
                    : totalSharePercentage === 100
                      ? "text-green-600 dark:text-green-400"
                      : "text-blue-600 dark:text-blue-400"
                }`}
              >
                {toBengaliNumber(totalSharePercentage.toFixed(2))}%
              </span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  totalSharePercentage > 100
                    ? "bg-red-500"
                    : totalSharePercentage === 100
                      ? "bg-green-500"
                      : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(totalSharePercentage, 100)}%` }}
              />
            </div>
            {hasMutatedOwners && (
              <p className="mt-2 text-xs md:text-sm text-orange-700 dark:text-orange-300 font-semibold">
                নামজারিকৃত: {toBengaliNumber(mutatedSharePercentage.toFixed(2))}% বাদ — অবশিষ্ট{" "}
                {toBengaliNumber(activeSharePercentage.toFixed(2))}% সক্রিয় মালিকদের মধ্যে ১০০% ধরে পুনর্বণ্টন হবে
              </p>
            )}
          </div>

          {/* Owner Form */}
          <OwnerForm
            owners={owners}
            onOwnerChange={handleOwnerChange}
            onDelete={(index, name) => openDeleteModal("owner", index, name)}
            onAdd={addOwner}
            calculateShareRatio={calculateShareRatio}
            onReorder={handleReorderOwners}
            onAddHeir={handleAddHeir}
            onHeirChange={handleHeirChange}
            onDeleteHeir={handleDeleteHeir}
          />

          {/* Dag Form */}
          <DagForm
            dags={dags}
            onDagChange={handleDagChange}
            onDelete={(index, name) => openDeleteModal("dag", index, name)}
            onAdd={addDag}
            onBulkAdd={handleBulkAddDags}
            onReorder={handleReorderDags}
            onDeleteAll={handleDeleteAllDags}
          />

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Manual Save Button */}
            <button
              onClick={handleManualSave}
              disabled={isSaving}
              className="sm:w-auto bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2 border border-green-500 disabled:opacity-50"
            >
              <Save size={20} /> {isSaving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </button>

            {/* Save to Library Button */}
            <button
              onClick={handleSaveToLibrary}
              className="sm:w-auto bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition shadow-lg flex items-center justify-center gap-2 border border-amber-500"
            >
              <Archive size={20} /> লাইব্রেরিতে সংরক্ষণ
            </button>

            {/* Calculate Button */}
            <button
              onClick={calculateResult}
              className="flex-1 bg-linear-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg flex items-center justify-center gap-2 text-base md:text-lg"
            >
              <Calculator size={22} /> ফলাফল হিসাব করুন
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="sm:w-auto bg-gray-700 text-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition shadow-lg flex items-center justify-center gap-2 border border-gray-600"
            >
              <RotateCcw size={20} /> রিসেট করুন
            </button>
          </div>
        </div>
        {/* Result Section */}
        {showResult && result.length > 0 && (
          <ResultTable
            header={header}
            dags={dags}
            result={result}
            owners={owners}
            calculateShareRatio={calculateShareRatio}
            totalSharePercentage={totalSharePercentage}
          />
        )}
      </div>

      <ThemeToggle theme={theme} onToggle={toggleTheme} mounted={mounted} variant="floating" />

      <AppToast />

      {/* Modals */}
      {showErrorModal && <ErrorModal errors={errors} onClose={() => setShowErrorModal(false)} />}
      <DeleteModal deleteModal={deleteModal} onClose={closeDeleteModal} onConfirm={confirmDelete} />
      <ResetModal resetModal={resetModal} onClose={() => setResetModal({ show: false })} onConfirm={confirmReset} />
      {/* Load Data Modal */}
      <LoadDataModal
        show={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onLoad={handleLoadData}
        onDiscard={handleDiscardData}
        lastSavedTime={lastSavedTime}
      />

      <TemplateModal
        show={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleLoadTemplate}
      />
      <ComplexTemplateModal
        show={showComplexTemplateModal}
        onClose={() => setShowComplexTemplateModal(false)}
        onSelect={handleLoadComplexTemplate}
      />

      {/* ─── Saved Khatiyans Library ─── */}
      <SavedKhatiyansModal
        show={showLibraryModal}
        entries={libraryEntries}
        activeEntryId={activeEntryId}
        onClose={() => setShowLibraryModal(false)}
        onOpen={handleOpenLibraryEntry}
        onRename={handleRenameEntry}
        onDelete={handleDeleteEntry}
        onExport={handleExportLibrary}
        onImport={handleImportLibrary}
      />
    </div>
  );
}
