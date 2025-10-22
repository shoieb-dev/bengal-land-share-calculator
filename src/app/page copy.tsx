import { useState, useMemo } from "react";
import { AlertCircle, Trash2, Plus, Calculator, Printer, X, RotateCcw } from "lucide-react";

// Types
type Owner = {
  name: string;
  ana: number;
  gonda: number;
  kora: number;
  kranti: number;
  til: number;
  totalLand?: number;
  shareRatio?: number;
};

type Dag = {
  name: string;
  land: number;
};

type ValidationError = {
  type: string;
  message: string;
};

type DeleteModal = {
  show: boolean;
  type: "owner" | "dag" | null;
  index: number;
  name: string;
};

type ResetModal = {
  show: boolean;
};

// Constants
const anaOptions = [
  { label: "আনার অংশ", value: 0 },
  { label: "⁄ (১ আনা)", value: 1 },
  { label: "৵ (২ আনা)", value: 2 },
  { label: "৶ (৩ আনা)", value: 3 },
  { label: "৷ (৪ আনা)", value: 4 },
  { label: "৷⁄ (৫ আনা)", value: 5 },
  { label: "৷৵ (৬ আনা)", value: 6 },
  { label: "৷৶ (৭ আনা)", value: 7 },
  { label: "৷৷ (৮ আনা)", value: 8 },
  { label: "৷৷⁄ (৯ আনা)", value: 9 },
  { label: "৷৷৵ (১০ আনা)", value: 10 },
  { label: "৷৷৶ (১১ আনা)", value: 11 },
  { label: "৸ (১২ আনা)", value: 12 },
  { label: "৸⁄ (১৩ আনা)", value: 13 },
  { label: "৸৵ (১৪ আনা)", value: 14 },
  { label: "৸৶ (১৫ আনা)", value: 15 },
  { label: "১ (১৬ আনা)", value: 16 },
];

const koraOptions = [
  { label: "০ কড়া", value: 0 },
  { label: "৷ (১ কড়া)", value: 1 },
  { label: "৷৷ (২ কড়া)", value: 2 },
  { label: "৸ (৩ কড়া)", value: 3 },
];

const krantiOptions = [
  { label: "০ ক্রান্তি", value: 0 },
  { label: "৴ (১ ক্রান্তি)", value: 1 },
  { label: "৴৴ (২ ক্রান্তি)", value: 2 },
];

// Utility Functions
const toBengaliNumber = (num: number | string): string => {
  return num.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
};

const toEnglishNumber = (bengaliNum: string): string => {
  const bengaliDigits = "০১২৩৪৫৬৭৮৯";
  return bengaliNum.replace(/[০-৯]/g, (d) => bengaliDigits.indexOf(d).toString());
};

const parseNumber = (value: string): number => {
  const englishValue = toEnglishNumber(value);
  return parseFloat(englishValue) || 0;
};

const shotokToSqFeet = (shotok: number): number => shotok * 435.6;
const shotokToKatha = (shotok: number): number => (shotok * 435.6) / 721.46;
const shotokToKaniGonda = (shotok: number): { kani: number; gonda: number; kora: number } => {
  const totalGonda = shotok / 1.9835;
  const kani = Math.floor(totalGonda / 20);
  const remainingGonda = totalGonda % 20;
  const gonda = Math.floor(remainingGonda);
  const kora = Math.floor((remainingGonda - gonda) * 4);
  return { kani, gonda, kora };
};

const gondaOptions = Array.from({ length: 20 }, (_, i) => ({
  label: `${toBengaliNumber(i)} গন্ডা`,
  value: i,
}));

const tilOptions = Array.from({ length: 20 }, (_, i) => ({
  label: `${toBengaliNumber(i)} তিল`,
  value: i,
}));

// Components
const ErrorModal = ({ errors, onClose }: { errors: ValidationError[]; onClose: () => void }) => {
  if (errors.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border border-red-500">
        <div className="flex items-start mb-4">
          <div className="bg-red-900 rounded-full p-2 mr-3">
            <AlertCircle className="text-red-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-400 mb-2">ত্রুটি পাওয়া গেছে</h3>
            <ul className="list-disc list-inside space-y-2">
              {errors.map((error, i) => (
                <li key={i} className="text-gray-300 text-sm">
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center gap-2"
        >
          <X size={18} /> বন্ধ করুন
        </button>
      </div>
    </div>
  );
};

const DeleteModal = ({
  deleteModal,
  onClose,
  onConfirm,
}: {
  deleteModal: DeleteModal;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!deleteModal.show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-700">
        <div className="flex items-start mb-4">
          <div className="bg-red-900 rounded-full p-2 mr-3">
            <AlertCircle className="text-red-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-100 mb-2">নিশ্চিত করুন</h3>
            <p className="text-gray-300">
              আপনি কি নিশ্চিত যে <strong className="text-red-400">{deleteModal.name}</strong> মুছে ফেলতে চান?
            </p>
            <p className="text-sm text-gray-400 mt-2">এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition"
          >
            বাতিল
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center gap-1"
          >
            <Trash2 size={18} /> মুছে ফেলুন
          </button>
        </div>
      </div>
    </div>
  );
};

const ResetModal = ({
  resetModal,
  onClose,
  onConfirm,
}: {
  resetModal: ResetModal;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!resetModal.show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border border-yellow-700">
        <div className="flex items-start mb-4">
          <div className="bg-yellow-900 rounded-full p-2 mr-3">
            <RotateCcw className="text-yellow-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-100 mb-2">সব তথ্য মুছে ফেলবেন?</h3>
            <p className="text-gray-300">আপনি কি নিশ্চিত যে সব তথ্য মুছে নতুন করে শুরু করতে চান?</p>
            <p className="text-sm text-gray-400 mt-2">
              সকল মালিক, দাগ এবং ফলাফল মুছে যাবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition"
          >
            বাতিল
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition flex items-center gap-1"
          >
            <RotateCcw size={18} /> রিসেট করুন
          </button>
        </div>
      </div>
    </div>
  );
};

const OwnerForm = ({
  owners,
  onOwnerChange,
  onDelete,
  onAdd,
  calculateShareRatio,
}: {
  owners: Owner[];
  onOwnerChange: (index: number, field: keyof Owner, value: string | number) => void;
  onDelete: (index: number, name: string) => void;
  onAdd: () => void;
  calculateShareRatio: (owner: Owner) => number;
}) => (
  <div className="bg-gradient-to-br from-green-900 to-emerald-900 p-4 md:p-5 rounded-lg shadow-lg mb-6 border border-green-700">
    <h3 className="font-bold text-lg mb-3 text-green-200 flex items-center">
      <span className="bg-green-700 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">১</span>
      মালিকের তালিকা
    </h3>

    {owners.length === 0 ? (
      <div className="text-center py-8 text-gray-400">
        <p className="mb-2">কোনো মালিক যোগ করা হয়নি</p>
        <p className="text-sm">নিচের বাটনে ক্লিক করে মালিক যোগ করুন</p>
      </div>
    ) : (
      <div className="space-y-3">
        {owners.map((owner, index) => (
          <div key={index} className="bg-gray-800 p-3 md:p-4 rounded-lg shadow-sm border border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-2 md:gap-3 items-center">
              <input
                type="text"
                placeholder="মালিকের নাম"
                value={owner.name}
                onChange={(e) => onOwnerChange(index, "name", e.target.value)}
                className="bg-gray-700 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
              />

              <select
                value={owner.ana}
                onChange={(e) => onOwnerChange(index, "ana", Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
              >
                {anaOptions.map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={owner.gonda}
                onChange={(e) => onOwnerChange(index, "gonda", Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
              >
                {gondaOptions.map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={owner.kora}
                onChange={(e) => onOwnerChange(index, "kora", Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
              >
                {koraOptions.map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={owner.kranti}
                onChange={(e) => onOwnerChange(index, "kranti", Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
              >
                {krantiOptions.map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={owner.til}
                onChange={(e) => onOwnerChange(index, "til", Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-green-500"
              >
                {tilOptions.map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => onDelete(index, owner.name || `মালিক #${index + 1}`)}
                className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition flex items-center justify-center gap-1"
              >
                <Trash2 size={16} /> <span className="hidden sm:inline">মুছুন</span>
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-300">
              মালিকানা: {toBengaliNumber((calculateShareRatio(owner) * 100).toFixed(2))}%
            </div>
          </div>
        ))}
      </div>
    )}

    <button
      onClick={onAdd}
      className="bg-green-600 text-white px-4 py-2 rounded mt-3 hover:bg-green-700 transition flex items-center gap-2 shadow w-full sm:w-auto"
    >
      <Plus size={18} /> নতুন মালিক যোগ করুন
    </button>
  </div>
);

const DagForm = ({
  dags,
  onDagChange,
  onDelete,
  onAdd,
}: {
  dags: Dag[];
  onDagChange: (index: number, field: keyof Dag, value: string | number) => void;
  onDelete: (index: number, name: string) => void;
  onAdd: () => void;
}) => (
  <div className="bg-gradient-to-br from-blue-900 to-sky-900 p-4 md:p-5 rounded-lg shadow-lg mb-6 border border-blue-700">
    <h3 className="font-bold text-lg mb-3 text-blue-200 flex items-center">
      <span className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">২</span>
      দাগের তালিকা
    </h3>

    {dags.length === 0 ? (
      <div className="text-center py-8 text-gray-400">
        <p className="mb-2">কোনো দাগ যোগ করা হয়নি</p>
        <p className="text-sm">নিচের বাটনে ক্লিক করে দাগ যোগ করুন</p>
      </div>
    ) : (
      <div className="space-y-2">
        {dags.map((dag, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row gap-2 bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-700"
          >
            <input
              type="text"
              placeholder="দাগ নং"
              value={dag.name}
              onChange={(e) => onDagChange(index, "name", e.target.value)}
              className="bg-gray-700 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-blue-500 flex-1"
            />
            <input
              type="text"
              placeholder="জমি (শতক)"
              value={dag.land || ""}
              onChange={(e) => onDagChange(index, "land", e.target.value)}
              className="bg-gray-700 border border-gray-600 text-gray-100 p-2 rounded focus:ring-2 focus:ring-blue-500 flex-1"
            />
            <button
              onClick={() => onDelete(index, dag.name || `দাগ #${index + 1}`)}
              className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition flex items-center justify-center gap-1"
            >
              <Trash2 size={16} /> <span className="hidden sm:inline">মুছুন</span>
            </button>
          </div>
        ))}
      </div>
    )}

    <button
      onClick={onAdd}
      className="bg-blue-600 text-white px-4 py-2 rounded mt-3 hover:bg-blue-700 transition flex items-center gap-2 shadow w-full sm:w-auto"
    >
      <Plus size={18} /> নতুন দাগ যোগ করুন
    </button>
  </div>
);

const ResultTable = ({
  result,
  owners,
  totalSharePercentage,
}: {
  result: { dagName: string; ownerName: string; land: number }[];
  owners: Owner[];
  totalSharePercentage: number;
}) => (
  <div className="bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 border border-gray-700" id="printable-area">
    <h2 className="text-2xl font-bold text-center text-blue-300 mb-4">হিসাবের ফলাফল</h2>

    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse border border-gray-600 text-xs md:text-sm">
        <thead>
          <tr className="bg-blue-900">
            <th className="border border-gray-600 p-2 text-left text-gray-200">দাগ নং</th>
            <th className="border border-gray-600 p-2 text-left text-gray-200">মালিকের নাম</th>
            <th className="border border-gray-600 p-2 text-right text-gray-200">জমি (শতক)</th>
            <th className="border border-gray-600 p-2 text-right text-gray-200">জমি (কানি-গন্ডা)</th>
            <th className="border border-gray-600 p-2 text-right text-gray-200">জমি (কাঠা)</th>
            <th className="border border-gray-600 p-2 text-right text-gray-200">জমি (বর্গফুট)</th>
          </tr>
        </thead>
        <tbody>
          {result.map((row, i) => {
            const kaniGonda = shotokToKaniGonda(row.land);
            const katha = shotokToKatha(row.land);
            const sqFeet = shotokToSqFeet(row.land);

            return (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-700" : "bg-gray-750"}>
                <td className="border border-gray-600 p-2 text-gray-200">{row.dagName}</td>
                <td className="border border-gray-600 p-2 text-gray-200">{row.ownerName}</td>
                <td className="border border-gray-600 p-2 text-right text-gray-200">
                  {toBengaliNumber(row.land.toFixed(4))}
                </td>
                <td className="border border-gray-600 p-2 text-right text-gray-200">
                  {kaniGonda.kani > 0 ? `${toBengaliNumber(kaniGonda.kani)} কানি ` : ""}
                  {kaniGonda.gonda > 0 ? `${toBengaliNumber(kaniGonda.gonda)} গন্ডা ` : ""}
                  {kaniGonda.kora > 0 ? `${toBengaliNumber(kaniGonda.kora)} কড়া` : ""}
                  {kaniGonda.kani === 0 && kaniGonda.gonda === 0 && kaniGonda.kora === 0 ? "০" : ""}
                </td>
                <td className="border border-gray-600 p-2 text-right text-gray-200">
                  {toBengaliNumber(katha.toFixed(4))}
                </td>
                <td className="border border-gray-600 p-2 text-right text-gray-200">
                  {toBengaliNumber(sqFeet.toFixed(2))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    <div className="overflow-x-auto mb-4">
      <h3 className="font-bold text-lg mb-2 text-gray-200">মালিকদের মোট জমি</h3>
      <table className="w-full border-collapse border border-gray-600 text-xs md:text-sm">
        <thead>
          <tr className="bg-green-900">
            <th className="border border-gray-600 p-2 text-left text-gray-200">মালিকের নাম</th>
            <th className="border border-gray-600 p-2 text-right text-gray-200">মোট জমি (শতক)</th>
            <th className="border border-gray-600 p-2 text-right text-gray-200">মালিকানার অংশ</th>
          </tr>
        </thead>
        <tbody>
          {owners.map((owner, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-gray-700" : "bg-gray-750"}>
              <td className="border border-gray-600 p-2 text-gray-200">{owner.name}</td>
              <td className="border border-gray-600 p-2 text-right text-gray-200">
                {toBengaliNumber((owner.totalLand || 0).toFixed(4))}
              </td>
              <td className="border border-gray-600 p-2 text-right text-gray-200">
                {toBengaliNumber(((owner.shareRatio || 0) * 100).toFixed(2))}%
              </td>
            </tr>
          ))}
          <tr className="bg-blue-900 font-bold">
            <td className="border border-gray-600 p-2 text-gray-200">মোট</td>
            <td className="border border-gray-600 p-2 text-right text-gray-200">
              {toBengaliNumber(owners.reduce((sum, o) => sum + (o.totalLand || 0), 0).toFixed(4))}
            </td>
            <td className="border border-gray-600 p-2 text-right text-gray-200">
              {toBengaliNumber(totalSharePercentage.toFixed(2))}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <button
      onClick={() => window.print()}
      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2 w-full md:w-auto mx-auto"
    >
      <Printer size={20} /> প্রিন্ট / এক্সপোর্ট করুন
    </button>
  </div>
);

// Main Component
export default function KhatiyanCalculator() {
  const [dags, setDags] = useState<Dag[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [result, setResult] = useState<{ dagName: string; ownerName: string; land: number }[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({ show: false, type: null, index: -1, name: "" });
  const [resetModal, setResetModal] = useState<ResetModal>({ show: false });

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
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-4 md:py-8 px-3 md:px-4"
      style={{ fontFamily: "'Kalpurush', 'Noto Sans Bengali', 'SolaimanLipi', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-4 md:p-6 mb-6 border border-gray-700">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-300 mb-2">খতিয়ান হিসাব</h1>
          <p className="text-center text-gray-400 mb-4 text-sm md:text-base">জমির মালিকানা ও বন্টন হিসাব</p>

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
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg flex items-center justify-center gap-2 text-base md:text-lg"
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
          <ResultTable result={result} owners={owners} totalSharePercentage={totalSharePercentage} />
        )}
      </div>

      {/* Modals */}
      <ErrorModal errors={errors} onClose={() => setShowErrorModal(false)} />
      {showErrorModal && <ErrorModal errors={errors} onClose={() => setShowErrorModal(false)} />}
      <DeleteModal deleteModal={deleteModal} onClose={closeDeleteModal} onConfirm={confirmDelete} />
      <ResetModal resetModal={resetModal} onClose={() => setResetModal({ show: false })} onConfirm={confirmReset} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
        
        .bg-gray-750 {
          background-color: #374151;
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area,
          #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
            color: black;
          }
          #printable-area table {
            border-color: #000 !important;
          }
          #printable-area th,
          #printable-area td {
            color: black !important;
            border-color: #000 !important;
          }
          #printable-area .bg-blue-900,
          #printable-area .bg-green-900,
          #printable-area .bg-gray-700,
          #printable-area .bg-gray-750 {
            background: white !important;
          }
          button {
            display: none !important;
          }
        }
        
        /* Responsive table scrolling */
        @media (max-width: 768px) {
          table {
            font-size: 0.75rem;
          }
          th, td {
            padding: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
