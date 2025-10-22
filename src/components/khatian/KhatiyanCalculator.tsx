"use client";
import { useMemo, useState } from "react";

import { Dag, DeleteModalType, Owner, ResetModalType, ValidationError } from "@/lib/types";
import { parseNumber, toBengaliNumber } from "@/lib/utils/numberConversion";
import { Calculator, RotateCcw } from "lucide-react";
import { DagForm } from "./DagForm";
import { OwnerForm } from "./OwnerForm";
import { ResultTable } from "./ResultTable";
import { ErrorModal } from "./ErrorModal";
import { DeleteModal } from "./DeleteModal";
import { ResetModal } from "./ResetModal";
import { bangladeshDistricts, surveyTypes } from "@/lib/constants/options";

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
  const [surveyType, setSurveyType] = useState("বি এস");
  const [district, setDistrict] = useState("চট্টগ্রাম");
  const [khatiyanNo, setKhatiyanNo] = useState("");
  const [thana, setThana] = useState("আনোয়ারা");
  const [mouja, setMouja] = useState("গুয়াপঞ্চক");

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
    if (totalRatio > 1.0001) {
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

  const confirmReset = () => {
    setDags([]);
    setOwners([]);
    setResult([]);
    setErrors([]);
    setShowResult(false);
    setShowErrorModal(false);
    setResetModal({ show: false });
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

  return (
    <div
      className="min-h-screen bg-linear-to-br from-blue-300 to-sky-500 py-4 md:py-8 px-3 md:px-4"
      style={{ fontFamily: "'Kalpurush', 'Noto Sans Bengali', 'SolaimanLipi', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-4 md:p-6 mb-6 border border-gray-700">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-300 mb-2">খতিয়ান হিসাব</h1>
          <p className="text-center text-gray-400 mb-4 text-sm md:text-base">জমির মালিকানা ও বন্টন হিসাব</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="survey-type" className="block text-sm font-medium text-gray-300 mb-1">
                জরিপের ধরন
              </label>
              <select
                id="survey-type"
                value={surveyType}
                onChange={(e) => setSurveyType(e.target.value)}
                className="w-full bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-purple-500"
              >
                {surveyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-300 mb-1">
                জিলাঃ
              </label>
              <select
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-purple-500"
              >
                {bangladeshDistricts.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="khatiyan-no" className="block text-sm font-medium text-gray-300 mb-1">
                খতিয়ান নং
              </label>
              <input
                type="text"
                id="khatiyan-no"
                value={khatiyanNo}
                onChange={(e) => setKhatiyanNo(e.target.value)}
                className="w-full bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="thana" className="block text-sm font-medium text-gray-300 mb-1">
                থানা
              </label>
              <input
                type="text"
                id="thana"
                value={thana}
                onChange={(e) => setThana(e.target.value)}
                className="w-full bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="mouja" className="block text-sm font-medium text-gray-300 mb-1">
                মৌজা
              </label>
              <input
                type="text"
                id="mouja"
                value={mouja}
                onChange={(e) => setMouja(e.target.value)}
                className="w-full bg-gray-300 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

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
          />

          {/* Dag Form */}
          <DagForm
            dags={dags}
            onDagChange={handleDagChange}
            onDelete={(index, name) => openDeleteModal("dag", index, name)}
            onAdd={addDag}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={calculateResult}
              className="flex-1 bg-linear-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg flex items-center justify-center gap-2 text-base md:text-lg"
            >
              <Calculator size={22} /> ফলাফল হিসাব করুন
            </button>
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
            result={result}
            owners={owners}
            totalSharePercentage={totalSharePercentage}
            surveyType={surveyType}
            district={district}
            khatiyanNo={khatiyanNo}
            thana={thana}
            mouja={mouja}
          />
        )}
      </div>

      {/* Modals */}
      {showErrorModal && <ErrorModal errors={errors} onClose={() => setShowErrorModal(false)} />}
      <DeleteModal deleteModal={deleteModal} onClose={closeDeleteModal} onConfirm={confirmDelete} />
      <ResetModal resetModal={resetModal} onClose={() => setResetModal({ show: false })} onConfirm={confirmReset} />
    </div>
  );
}
