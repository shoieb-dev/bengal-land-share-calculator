import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Heir, HeirRelation, Owner } from "@/lib/types";
import { anaOptions, gondaOptions, koraOptions, krantiOptions, tilOptions } from "@/lib/constants/options";
import {
  HeirTemplate,
  loadHeirTemplates,
  loadOwnerPresets,
  OwnerPreset,
  saveHeirTemplates,
  saveOwnerPresets,
} from "@/lib/utils/presets";
import { showToast } from "@/lib/utils/toast";
import { FileText, Plus, Save, Search, Settings2, Trash2, Users, X } from "lucide-react";

const PRESETS_UPDATED_EVENT = "khatiyan-presets-updated";
const controlClass =
  "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-2 rounded text-sm";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `preset_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const createBlankOwner = (): Owner => ({ name: "", ana: 0, gonda: 0, kora: 0, kranti: 0, til: 0 });

const makePresetOwners = (owners: Owner[]) =>
  owners.map((owner) => ({
    name: owner.name,
    ana: owner.ana,
    gonda: owner.gonda,
    kora: owner.kora,
    kranti: owner.kranti,
    til: owner.til,
    mutated: owner.mutated,
    deceased: owner.deceased,
    heirs: owner.heirs?.map(({ name, relation, mutated }) => ({
      id: createId(),
      name,
      relation,
      mutated,
    })),
  }));

const broadcastPresetsUpdated = () => {
  window.dispatchEvent(new Event(PRESETS_UPDATED_EVENT));
};

function usePresetList<T>(load: () => T[]) {
  const [presets, setPresets] = useState<T[]>([]);

  useEffect(() => {
    const refresh = () => {
      try {
        setPresets(load());
      } catch (error) {
        console.error("Error loading presets:", error);
        showToast("প্রিসেট লোড করা যায়নি। ব্রাউজারের সংরক্ষিত ডেটা পরীক্ষা করুন।", "error");
      }
    };
    refresh();
    window.addEventListener(PRESETS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(PRESETS_UPDATED_EVENT, refresh);
  }, [load]);

  return presets;
}

export default function OwnerPresetControls({ owners }: { owners: Owner[] }) {
  const ownerPresets = usePresetList(loadOwnerPresets);
  const heirTemplates = usePresetList(loadHeirTemplates);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"owners" | "heirs">("owners");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!showModal) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showModal]);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1 rounded bg-gray-700 px-3 py-1 text-sm text-white transition hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500"
      >
        <Settings2 size={16} /> প্রিসেট সেটিংস
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="preset-settings-title"
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-indigo-300 bg-white shadow-2xl shadow-indigo-500/25 ring-1 ring-indigo-400/40 dark:border-indigo-500 dark:bg-gray-800 dark:shadow-indigo-400/30 dark:ring-indigo-400/50"
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div>
                <h2 id="preset-settings-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  প্রিসেট সেটিংস
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  মালিক টেমপ্লেট ও ওয়ারিশ টেমপ্লেট পরিচালনা করুন
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="প্রিসেট সেটিংস বন্ধ করুন"
                className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </header>

            <div className="space-y-4 overflow-y-auto p-4">
              <label className="relative block">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="প্রিসেট খুঁজুন..."
                  aria-label="প্রিসেট খুঁজুন"
                  className={`${controlClass} w-full pl-10`}
                />
              </label>

              <div
                role="tablist"
                aria-label="প্রিসেটের ধরন"
                className="flex gap-2 border-b border-gray-200 dark:border-gray-700"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "owners"}
                  onClick={() => setActiveTab("owners")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
                    activeTab === "owners"
                      ? "border-indigo-600 text-indigo-700 dark:text-indigo-300"
                      : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <Users size={16} /> মালিক টেমপ্লেট
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "heirs"}
                  onClick={() => setActiveTab("heirs")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
                    activeTab === "heirs"
                      ? "border-violet-600 text-violet-700 dark:text-violet-300"
                      : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <FileText size={16} />
                  ওয়ারিশ টেমপ্লেট
                </button>
              </div>

              {activeTab === "owners" ? (
                <OwnerPresetManager owners={owners} presets={ownerPresets} searchTerm={searchTerm} />
              ) : (
                <HeirTemplateManager templates={heirTemplates} searchTerm={searchTerm} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function OwnerPresetManager({
  owners,
  presets,
  searchTerm,
}: {
  owners: Owner[];
  presets: OwnerPreset[];
  searchTerm: string;
}) {
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [members, setMembers] = useState<Owner[]>([]);
  const filteredPresets = presets.filter((preset) => {
    const query = searchTerm.trim().toLocaleLowerCase();
    return (
      !query ||
      preset.name.toLocaleLowerCase().includes(query) ||
      preset.owners.some((owner) => owner.name.toLocaleLowerCase().includes(query))
    );
  });

  const selectPreset = (id: string) => {
    setSelectedId(id);
    const preset = presets.find((item) => item.id === id);
    setName(preset?.name ?? "");
    setMembers(preset?.owners.map((owner) => ({ ...owner, heirs: owner.heirs?.map((heir) => ({ ...heir })) })) ?? []);
  };

  const startNewGroup = () => {
    setSelectedId("");
    setName("");
    setMembers([createBlankOwner()]);
  };

  const loadCurrentOwners = () => {
    setSelectedId("");
    setName("");
    setMembers(makePresetOwners(owners));
  };

  const save = (updateSelected: boolean) => {
    const trimmedName = name.trim();
    if (!trimmedName || members.length === 0 || members.some((member) => !member.name.trim())) {
      showToast("টেমপ্লেটের নাম দিন এবং প্রত্যেক সদস্যের নাম পূরণ করুন।", "info");
      return;
    }

    const next =
      updateSelected && selectedId
        ? presets.map((preset) =>
            preset.id === selectedId ? { ...preset, name: trimmedName, owners: makePresetOwners(members) } : preset,
          )
        : [...presets, { id: createId(), name: trimmedName, owners: makePresetOwners(members) }];
    try {
      saveOwnerPresets(next);
      broadcastPresetsUpdated();
      if (!updateSelected || !selectedId) {
        const addedPreset = next[next.length - 1];
        setSelectedId(addedPreset.id);
      }
      showToast(updateSelected ? "মালিক টেমপ্লেট আপডেট হয়েছে।" : "মালিক টেমপ্লেট সংরক্ষণ হয়েছে।", "success");
    } catch (error) {
      console.error("Error saving owner group preset:", error);
      showToast("মালিক টেমপ্লেট সংরক্ষণ করা যায়নি। ব্রাউজারের স্টোরেজ পরীক্ষা করুন।", "error");
    }
  };

  const remove = () => {
    if (!selectedId) return;
    try {
      saveOwnerPresets(presets.filter((preset) => preset.id !== selectedId));
      broadcastPresetsUpdated();
      setSelectedId("");
      setName("");
      setMembers([]);
      showToast("মালিক টেমপ্লেট মুছে ফেলা হয়েছে।", "success");
    } catch (error) {
      console.error("Error deleting owner group preset:", error);
      showToast("মালিক টেমপ্লেট মুছে ফেলা যায়নি।", "error");
    }
  };

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">মালিক টেমপ্লেট</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadCurrentOwners}
            disabled={owners.length === 0}
            className="rounded border border-green-700 px-2.5 py-1.5 text-xs text-green-800 hover:bg-green-50 disabled:opacity-50 dark:text-green-200 dark:hover:bg-green-950/30"
          >
            বর্তমান তালিকা নিন
          </button>
          <button
            type="button"
            onClick={startNewGroup}
            className="flex items-center gap-1 rounded bg-green-700 px-3 py-1.5 text-sm text-white hover:bg-green-800"
          >
            <Plus size={14} /> নতুন টেমপ্লেট
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {filteredPresets.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                aria-pressed={selectedId === preset.id}
                onClick={() => selectPreset(preset.id)}
                className={`rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedId === preset.id
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 dark:bg-indigo-950/40 dark:ring-indigo-900"
                    : "border-gray-200 bg-white hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-700"
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{preset.name}</span>
                  <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200">
                    {preset.owners.length} জন
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                  {preset.owners
                    .map((owner) => owner.name)
                    .filter(Boolean)
                    .join("، ") || "সদস্যের নাম নেই"}
                </p>
                <span className="mt-2 inline-block text-[11px] text-gray-400">
                  {selectedId === preset.id ? "নির্বাচিত" : "মালিক টেমপ্লেট"}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {presets.length === 0
              ? "এখনো কোনো মালিক টেমপ্লেট নেই। নতুন টেমপ্লেট তৈরি করুন।"
              : "কোনো মিল পাওয়া যায়নি।"}
          </p>
        )}

        {(selectedId || members.length > 0) && (
          <>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="টেমপ্লেটের নাম"
              aria-label="মালিক টেমপ্লেটের নাম"
              className={`${controlClass} w-full`}
            />
            {members.length > 0 && (
              <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  টেমপ্লেটের সদস্য ({members.length})
                </p>

                {members.map((member, index) => (
                  <div key={index} className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">সদস্য {index + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setMembers((previous) => previous.filter((_, memberIndex) => memberIndex !== index))
                        }
                        aria-label={`সদস্য ${index + 1} মুছুন`}
                        className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <input
                      value={member.name}
                      onChange={(event) =>
                        setMembers((previous) =>
                          previous.map((item, memberIndex) =>
                            memberIndex === index ? { ...item, name: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder="সদস্যের নাম"
                      aria-label={`সদস্য ${index + 1} এর নাম`}
                      className={`${controlClass} mb-2 w-full`}
                    />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      <ShareSelect
                        label="আনা"
                        value={member.ana}
                        options={anaOptions}
                        onChange={(value) => updateMember(index, "ana", value, setMembers)}
                      />
                      <ShareSelect
                        label="গন্ডা"
                        value={member.gonda}
                        options={gondaOptions}
                        onChange={(value) => updateMember(index, "gonda", value, setMembers)}
                      />
                      <ShareSelect
                        label="কড়া"
                        value={member.kora}
                        options={koraOptions}
                        onChange={(value) => updateMember(index, "kora", value, setMembers)}
                      />
                      <ShareSelect
                        label="ক্রান্তি"
                        value={member.kranti}
                        options={krantiOptions}
                        onChange={(value) => updateMember(index, "kranti", value, setMembers)}
                      />
                      <ShareSelect
                        label="তিল"
                        value={member.til}
                        options={tilOptions}
                        onChange={(value) => updateMember(index, "til", value, setMembers)}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-300">
                      <label className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={!!member.mutated}
                          onChange={(event) =>
                            setMembers((previous) =>
                              previous.map((item, memberIndex) =>
                                memberIndex === index ? { ...item, mutated: event.target.checked } : item,
                              ),
                            )
                          }
                        />
                        নামজারি হয়েছে
                      </label>
                      <label className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={!!member.deceased}
                          onChange={(event) =>
                            setMembers((previous) =>
                              previous.map((item, memberIndex) =>
                                memberIndex === index ? { ...item, deceased: event.target.checked } : item,
                              ),
                            )
                          }
                        />
                        মৃত মালিক
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setMembers((previous) => [...previous, createBlankOwner()])}
                  className="flex items-center gap-1 rounded bg-green-700 px-2.5 py-1.5 text-xs text-white hover:bg-green-800"
                >
                  <Plus size={13} /> সদস্য যোগ
                </button>
              </div>
            )}
          </>
        )}
        {(selectedId || members.length > 0) && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => (selectedId ? save(true) : save(false))}
              className="flex items-center gap-1 rounded bg-blue-700 px-3 py-2 text-sm text-white hover:bg-blue-800"
            >
              {selectedId ? <Save size={14} /> : <Plus size={14} />}
              {selectedId ? "আপডেট সংরক্ষণ" : "নতুন সংরক্ষণ"}
            </button>
            {selectedId && (
              <button
                type="button"
                onClick={remove}
                className="flex items-center gap-1 rounded bg-red-700 px-3 py-2 text-sm text-white hover:bg-red-800"
              >
                <Trash2 size={14} /> মুছুন
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function updateMember(
  index: number,
  field: "ana" | "gonda" | "kora" | "kranti" | "til",
  value: number,
  setMembers: Dispatch<SetStateAction<Owner[]>>,
) {
  setMembers((previous) =>
    previous.map((member, memberIndex) => (memberIndex === index ? { ...member, [field]: value } : member)),
  );
}

function ShareSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: Array<{ label: string; value: number }>;
  onChange: (value: number) => void;
}) {
  return (
    <label className="min-w-0 text-[11px] text-gray-500 dark:text-gray-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className={`${controlClass} mt-1 w-full !px-1.5 !py-1.5 text-xs`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function HeirTemplateManager({ templates, searchTerm }: { templates: HeirTemplate[]; searchTerm: string }) {
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [heirs, setHeirs] = useState<Array<Pick<Heir, "name" | "relation" | "mutated">>>([]);
  const filteredTemplates = templates.filter((template) => {
    const query = searchTerm.trim().toLocaleLowerCase();
    return (
      !query ||
      template.name.toLocaleLowerCase().includes(query) ||
      template.heirs.some((heir) => heir.name.toLocaleLowerCase().includes(query))
    );
  });

  const selectTemplate = (id: string) => {
    setSelectedId(id);
    const template = templates.find((item) => item.id === id);
    setName(template?.name ?? "");
    setHeirs(template?.heirs.map((heir) => ({ ...heir })) ?? []);
  };

  const startNewTemplate = () => {
    setSelectedId("");
    setName("");
    setHeirs([{ name: "", relation: "son" }]);
  };

  const save = (updateSelected: boolean) => {
    const trimmedName = name.trim();
    if (!trimmedName || heirs.length === 0 || heirs.some((heir) => !heir.name.trim())) {
      showToast("টেমপ্লেটের নাম দিন এবং প্রত্যেক ওয়ারিশের নাম পূরণ করুন।", "info");
      return;
    }

    const next =
      updateSelected && selectedId
        ? templates.map((template) =>
            template.id === selectedId
              ? { ...template, name: trimmedName, heirs: heirs.map((heir) => ({ ...heir })) }
              : template,
          )
        : [...templates, { id: createId(), name: trimmedName, heirs: heirs.map((heir) => ({ ...heir })) }];
    try {
      saveHeirTemplates(next);
      broadcastPresetsUpdated();
      if (!updateSelected || !selectedId) setSelectedId(next[next.length - 1].id);
      showToast(updateSelected ? "ওয়ারিশ টেমপ্লেট আপডেট হয়েছে।" : "ওয়ারিশ টেমপ্লেট সংরক্ষণ হয়েছে।", "success");
    } catch (error) {
      console.error("Error saving heir template:", error);
      showToast("ওয়ারিশ টেমপ্লেট সংরক্ষণ করা যায়নি। ব্রাউজারের স্টোরেজ পরীক্ষা করুন।", "error");
    }
  };

  const remove = () => {
    if (!selectedId) return;
    try {
      saveHeirTemplates(templates.filter((template) => template.id !== selectedId));
      broadcastPresetsUpdated();
      setSelectedId("");
      setName("");
      setHeirs([]);
      showToast("ওয়ারিশ টেমপ্লেট মুছে ফেলা হয়েছে।", "success");
    } catch (error) {
      console.error("Error deleting heir template:", error);
      showToast("ওয়ারিশ টেমপ্লেট মুছে ফেলা যায়নি।", "error");
    }
  };

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">ওয়ারিশ টেমপ্লেট</h3>
        <button
          type="button"
          onClick={startNewTemplate}
          className="flex items-center gap-1 rounded bg-violet-700 px-3 py-1.5 text-sm text-white hover:bg-violet-800"
        >
          <Plus size={14} /> নতুন টেমপ্লেট
        </button>
      </div>
      <div className="space-y-3">
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                aria-pressed={selectedId === template.id}
                onClick={() => selectTemplate(template.id)}
                className={`rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedId === template.id
                    ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200 dark:bg-violet-950/40 dark:ring-violet-900"
                    : "border-gray-200 bg-white hover:border-violet-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-violet-700"
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{template.name}</span>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200">
                    {template.heirs.length} জন
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                  {template.heirs
                    .map((heir) => heir.name)
                    .filter(Boolean)
                    .join("، ") || "ওয়ারিশের নাম নেই"}
                </p>
                <span className="mt-2 inline-block text-[11px] text-gray-400">
                  {selectedId === template.id ? "নির্বাচিত" : "ওয়ারিশ টেমপ্লেট"}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {templates.length === 0
              ? "এখনো কোনো ওয়ারিশ টেমপ্লেট নেই। নতুন টেমপ্লেট তৈরি করুন।"
              : "কোনো মিল পাওয়া যায়নি।"}
          </p>
        )}

        {(selectedId || heirs.length > 0) && (
          <>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="টেমপ্লেটের নাম"
              aria-label="ওয়ারিশ টেমপ্লেটের নাম"
              className={`${controlClass} w-full`}
            />
            {heirs.length > 0 && (
              <div className="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    ওয়ারিশ তালিকা ({heirs.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => setHeirs((previous) => [...previous, { name: "", relation: "son" }])}
                    className="flex items-center gap-1 rounded bg-violet-700 px-2.5 py-1.5 text-xs text-white hover:bg-violet-800"
                  >
                    <Plus size={13} /> ওয়ারিশ যোগ
                  </button>
                </div>
                {heirs.map((heir, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-2">
                    <input
                      value={heir.name}
                      onChange={(event) =>
                        setHeirs((previous) =>
                          previous.map((item, heirIndex) =>
                            heirIndex === index ? { ...item, name: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder={`ওয়ারিশ ${index + 1} এর নাম`}
                      aria-label={`ওয়ারিশ ${index + 1} এর নাম`}
                      className={`${controlClass} min-w-40 flex-1`}
                    />
                    <select
                      value={heir.relation}
                      onChange={(event) =>
                        setHeirs((previous) =>
                          previous.map((item, heirIndex) =>
                            heirIndex === index ? { ...item, relation: event.target.value as HeirRelation } : item,
                          ),
                        )
                      }
                      aria-label={`ওয়ারিশ ${index + 1} এর সম্পর্ক`}
                      className={controlClass}
                    >
                      <option value="wife">স্ত্রী</option>
                      <option value="husband">স্বামী</option>
                      <option value="son">ছেলে</option>
                      <option value="daughter">মেয়ে</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setHeirs((previous) => previous.filter((_, heirIndex) => heirIndex !== index))}
                      aria-label={`ওয়ারিশ ${index + 1} মুছুন`}
                      className="rounded p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {(selectedId || heirs.length > 0) && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => (selectedId ? save(true) : save(false))}
              className="flex items-center gap-1 rounded bg-blue-700 px-3 py-2 text-sm text-white hover:bg-blue-800"
            >
              {selectedId ? <Save size={14} /> : <Plus size={14} />}
              {selectedId ? "আপডেট সংরক্ষণ" : "নতুন সংরক্ষণ"}
            </button>
            {selectedId && (
              <button
                type="button"
                onClick={remove}
                className="flex items-center gap-1 rounded bg-red-700 px-3 py-2 text-sm text-white hover:bg-red-800"
              >
                <Trash2 size={14} /> মুছুন
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function OwnerPresetDropdown({ onApply }: { onApply: (owners: Owner[]) => void }) {
  const presets = usePresetList(loadOwnerPresets);

  return (
    <select
      defaultValue=""
      onChange={(event) => {
        const preset = presets.find((item) => item.id === event.target.value);
        event.currentTarget.value = "";
        if (preset) onApply(preset.owners);
      }}
      aria-label="এই রোতে মালিক টেমপ্লেট প্রয়োগ"
      className="min-w-40 rounded border border-green-300 bg-white px-2 py-1.5 text-xs text-gray-800 dark:border-green-700 dark:bg-gray-700 dark:text-gray-100"
    >
      <option value="">মালিক টেমপ্লেট প্রিসেট</option>
      {presets.map((preset) => (
        <option key={preset.id} value={preset.id}>
          {preset.name}
        </option>
      ))}
    </select>
  );
}

export function HeirTemplateDropdown({
  onApply,
}: {
  onApply: (heirs: Array<Pick<Heir, "name" | "relation" | "mutated">>) => void;
}) {
  const templates = usePresetList(loadHeirTemplates);

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue=""
        onChange={(event) => {
          const template = templates.find((item) => item.id === event.target.value);
          event.currentTarget.value = "";
          if (template) {
            onApply(template.heirs);
            showToast("ওয়ারিশ টেমপ্লেট প্রয়োগ হয়েছে।", "success");
          }
        }}
        aria-label="ওয়ারিশ প্রিসেট প্রয়োগ"
        className="min-w-40 rounded border border-violet-300 bg-white px-2 py-1.5 text-xs text-gray-800 dark:border-violet-700 dark:bg-gray-700 dark:text-gray-100"
      >
        <option value="">ওয়ারিশ প্রিসেট</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
    </div>
  );
}
