"use client";
import { Dag, DeleteModalType, KhatiyanHeader, Owner, ResetModalType, ValidationError } from "@/lib/types";
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
import { Calculator, FileText, RotateCcw, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { KhatiyanTemplate } from "@/lib/constants/templates";
import { Layout } from "lucide-react";
import ComplexTemplateModal from "./modals/ComplexTemplateModal";

// Main Component
export default function KhatiyanCalculator() {
  const [dags, setDags] = useState<Dag[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [result, setResult] = useState<{ dagName: string; ownerName: string; land: number }[]>([]);
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
      alert("ডেটা সফলভাবে সংরক্ষিত হয়েছে!");
    } else {
      alert("ডেটা সংরক্ষণ করতে সমস্যা হয়েছে");
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
    clearLocalStorage(); // Clear saved data
    setLastSavedTime(null);
  };

  // Update handleHeaderChange
  const handleHeaderChange = (field: keyof KhatiyanHeader, value: string) => {
    setHeader({ ...header, [field]: value });
  };

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

  const handleOwnerChange = (index: number, field: keyof Owner, value: string | number) => {
    const newOwners = [...owners];
    if (field === "name") {
      newOwners[index][field] = value as string;
    } else if (field in newOwners[index]) {
      (newOwners[index] as any)[field] = Number(value);
    }
    setOwners(newOwners);
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

    const newResult: { dagName: string; ownerName: string; land: number }[] = [];

    const ownersWithTotalLand = owners.map((owner) => {
      const shareRatio = calculateShareRatio(owner);
      const total = dags.reduce((acc, dag) => acc + dag.land * shareRatio, 0);
      return { ...owner, totalLand: parseFloat(total.toFixed(4)), shareRatio };
    });

    ownersWithTotalLand.forEach((owner) => {
      dags.forEach((dag) => {
        const land = parseFloat((dag.land * (owner.shareRatio || 0)).toFixed(4));

        newResult.push({
          dagName: dag.name,
          ownerName: owner.name,
          land,
        });
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

  const handleReorderOwners = (newOwners: Owner[]) => {
    setOwners(newOwners);
  };

  const handleReorderDags = (newDags: Dag[]) => {
    setDags(newDags);
  };

  return (
    <div
      className="min-h-screen bg-linear-to-br from-blue-300 to-sky-500 py-4 md:py-8 px-3 md:px-4"
      style={{ fontFamily: "'Kalpurush', 'Noto Sans Bengali', 'SolaimanLipi', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-4 md:p-6 mb-6 border border-gray-700">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-300 mb-2">খতিয়ান হিসাব</h1>
          <p className="text-center text-gray-400 mb-4 text-sm md:text-base">জমির মালিকানা ও বন্টন হিসাব</p>

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
          </div>

          {/* Khatian Header Form */}
          <KhatiyanHeaderForm header={header} onChange={handleHeaderChange} />

          {/* Total Share Indicator */}
          <div
            className={`p-3 rounded-lg mb-4 ${
              totalSharePercentage > 100
                ? "bg-red-900 border border-red-700"
                : totalSharePercentage === 100
                ? "bg-green-900 border border-green-700"
                : "bg-blue-900 border border-blue-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-200 text-sm md:text-base">মোট মালিকানা:</span>
              <span
                className={`text-lg md:text-xl font-bold ${
                  totalSharePercentage > 100
                    ? "text-red-400"
                    : totalSharePercentage === 100
                    ? "text-green-400"
                    : "text-blue-400"
                }`}
              >
                {toBengaliNumber(totalSharePercentage.toFixed(2))}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
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
          </div>

          {/* Owner Form */}
          <OwnerForm
            owners={owners}
            onOwnerChange={handleOwnerChange}
            onDelete={(index, name) => openDeleteModal("owner", index, name)}
            onAdd={addOwner}
            calculateShareRatio={calculateShareRatio}
            onReorder={handleReorderOwners}
          />

          {/* Dag Form */}
          <DagForm
            dags={dags}
            onDagChange={handleDagChange}
            onDelete={(index, name) => openDeleteModal("dag", index, name)}
            onAdd={addDag}
            onBulkAdd={handleBulkAddDags}
            onReorder={handleReorderDags}
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

          {/* Result Section */}
          {showResult && result.length > 0 && (
            <ResultTable
              header={header}
              dags={dags}
              result={result}
              owners={owners}
              totalSharePercentage={totalSharePercentage}
            />
          )}
        </div>
      </div>

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
    </div>
  );
}
