import { useState } from "react";
import { X, FileText, AlertCircle, ChevronRight } from "lucide-react";
import { Owner } from "@/lib/types";
import FamilyTreeView from "./FamilyTreeView";
import HorizontalFamilyTree from "./HorizontalFamilyTree";

interface ComplexTemplate {
  id: string;
  name: string;
  description: string;
  scenario: string[];
  owners: Owner[];
  structure: {
    level: number;
    name: string;
    percentage: string;
    children?: { name: string; percentage: string; note?: string }[];
  }[];
  familyTree?: FamilyMember[];
}

interface FamilyMember {
  name: string;
  percentage: string;
  generation: number;
  children?: FamilyMember[];
  note?: string;
  isDeceased?: boolean;
  isMale?: boolean;
}

const complexTemplates: ComplexTemplate[] = [
  {
    id: "3-brothers-grandchildren",
    name: "৩ ভাইয়ের উত্তরসূরি",
    description: "তিন ভাইয়ের সন্তান ও নাতি-নাতনিদের মধ্যে বন্টন",
    scenario: [
      "মূল ৩ ভাই: হামিদ আলী, এয়ার আলী, আসাদ আলী (প্রত্যেকে ৩৩.৩৩%)",
      "হামিদ আলীর ১ ছেলে: আইয়ুব আলী চৌধুরী (৩৩.৩৩%)",
      "এয়ার আলীর ২ ছেলে: নওয়াব আলী ও নোয়াজেশ আলী (৩৩.৩৩%)",
      "  - নওয়াব আলীর ১ ছেলে (মহিউদ্দিন) ও ১ মেয়ে (নিরু ফাতেমা)",
      "  - নোয়াজেশ আলীর ২ ছেলে (জাহাঙ্গীর, আলমগীর) ও ১ মেয়ে (হাসিনা সুলতানা)",
      "আসাদ আলীর ১ ছেলে: আবদুস সবুর চৌধুরী (৩৩.৩৩%)",
      "এয়ার আলীর অংশ তার ২ ছেলের মধ্যে সমান (১৬.৬৭% করে)",
      "নওয়াব আলী ও নোয়াজেশ আলীর অংশ তাদের সন্তানদের মধ্যে ইসলামিক আইনে বন্টন",
    ],
    structure: [
      {
        level: 0,
        name: "১. হামিদ আলী চৌধুরীর পরিবার",
        percentage: "৩৩.৩৩%",
        children: [{ name: "আইয়ুব আলী চৌধুরী (ছেলে)", percentage: "৩৩.৩৩%", note: "একমাত্র সন্তান" }],
      },
      {
        level: 0,
        name: "২. এয়ার আলী চৌধুরীর পরিবার",
        percentage: "৩৩.৩৩%",
      },
      {
        level: 1,
        name: "ক) নওয়াব আলী চৌধুরীর অংশ",
        percentage: "১৬.৬৭%",
        children: [
          { name: "মহিউদ্দিন (ছেলে)", percentage: "১১.১১%", note: "২/৩ অংশ (ছেলে:মেয়ে = ২:১)" },
          { name: "নিরু ফাতেমা (মেয়ে)", percentage: "৫.৫৬%", note: "১/৩ অংশ" },
        ],
      },
      {
        level: 1,
        name: "খ) নোয়াজেশ আলী চৌধুরীর অংশ",
        percentage: "১৬.৬৭%",
        children: [
          { name: "জাহাঙ্গীর (ছেলে)", percentage: "৬.৬৭%", note: "২/৫ অংশ" },
          { name: "আলমগীর (ছেলে)", percentage: "৬.৬৭%", note: "২/৫ অংশ" },
          { name: "হাসিনা সুলতানা (মেয়ে)", percentage: "৩.৩৩%", note: "১/৫ অংশ" },
        ],
      },
      {
        level: 0,
        name: "৩. আসাদ আলী চৌধুরীর পরিবার",
        percentage: "৩৩.৩৩%",
        children: [{ name: "আবদুস সবুর চৌধুরী (ছেলে)", percentage: "৩৩.৩৩%", note: "একমাত্র সন্তান" }],
      },
    ],
    familyTree: [
      {
        name: "হামিদ আলী চৌধুরী",
        percentage: "৩৩.৩৩%",
        generation: 0,
        isDeceased: true,
        isMale: true,
        children: [
          {
            name: "আইয়ুব আলী চৌধুরী",
            percentage: "৩৩.৩৩%",
            generation: 1,
            note: "একমাত্র সন্তান",
            isMale: true,
          },
        ],
      },
      {
        name: "এয়ার আলী চৌধুরী",
        percentage: "৩৩.৩৩%",
        generation: 0,
        isDeceased: true,
        isMale: true,
        children: [
          {
            name: "নওয়াব আলী চৌধুরী",
            percentage: "১৬.৬৭%",
            generation: 1,
            isDeceased: true,
            isMale: true,
            note: "১ম ছেলে",
            children: [
              {
                name: "মহিউদ্দিন",
                percentage: "১১.১১%",
                generation: 2,
                note: "ছেলে",
                isMale: true,
              },
              {
                name: "নিরু ফাতেমা",
                percentage: "৫.৫৬%",
                generation: 2,
                note: "মেয়ে",
                isMale: false,
              },
            ],
          },
          {
            name: "নোয়াজেশ আলী চৌধুরী",
            percentage: "১৬.৬৭%",
            generation: 1,
            isDeceased: true,
            isMale: true,
            note: "২য় ছেলে",
            children: [
              {
                name: "জাহাঙ্গীর",
                percentage: "৬.৬৭%",
                generation: 2,
                note: "ছেলে",
                isMale: true,
              },
              {
                name: "আলমগীর",
                percentage: "৬.৬৭%",
                generation: 2,
                note: "ছেলে",
                isMale: true,
              },
              {
                name: "হাসিনা সুলতানা",
                percentage: "৩.৩৩%",
                generation: 2,
                note: "মেয়ে",
                isMale: false,
              },
            ],
          },
        ],
      },
      {
        name: "আসাদ আলী চৌধুরী",
        percentage: "৩৩.৩৩%",
        generation: 0,
        isDeceased: true,
        isMale: true,
        children: [
          {
            name: "আবদুস সবুর চৌধুরী",
            percentage: "৩৩.৩৩%",
            generation: 1,
            note: "একমাত্র সন্তান",
            isMale: true,
          },
        ],
      },
    ],
    owners: [
      { name: "আইয়ুব আলী চৌধুরী", ana: 5, gonda: 6, kora: 2, kranti: 0, til: 0 }, // 33.33%
      { name: "মহিউদ্দিন", ana: 1, gonda: 15, kora: 3, kranti: 1, til: 0 }, // 11.11%
      { name: "নিরু ফাতেমা", ana: 0, gonda: 17, kora: 2, kranti: 1, til: 0 }, // 5.56%
      { name: "জাহাঙ্গীর", ana: 1, gonda: 1, kora: 2, kranti: 0, til: 0 }, // 6.67%
      { name: "আলমগীর", ana: 1, gonda: 1, kora: 2, kranti: 0, til: 0 }, // 6.67%
      { name: "হাসিনা সুলতানা", ana: 0, gonda: 10, kora: 2, kranti: 1, til: 0 }, // 3.33%
      { name: "আবদুস সবুর চৌধুরী", ana: 5, gonda: 6, kora: 2, kranti: 0, til: 0 }, // 33.33%
    ],
  },
  {
    id: "2-brothers-1-deceased-with-wife",
    name: "২ ভাই (১ জনের স্ত্রী ও সন্তান)",
    description: "দুই ভাইয়ের একজন মৃত, তার স্ত্রী ও সন্তানদের অংশ",
    scenario: [
      "২ ভাই ছিল",
      "একজন মারা গেছেন",
      "তার স্ত্রী ও ২ সন্তান (১ ছেলে, ১ মেয়ে)",
      "স্ত্রী ১/৮ পাবে, বাকি সন্তানদের মধ্যে ২:১",
    ],
    structure: [
      {
        level: 0,
        name: "জীবিত ভাই",
        percentage: "৫০%",
      },
      {
        level: 0,
        name: "মৃত ভাইয়ের পরিবার",
        percentage: "৫০%",
        children: [
          { name: "স্ত্রী", percentage: "৬.২৫%", note: "১/৮ অংশ" },
          { name: "ছেলে", percentage: "২৯.১৭%", note: "বাকি ২/৩" },
          { name: "মেয়ে", percentage: "১৪.৫৮%", note: "বাকি ১/৩" },
        ],
      },
    ],
    owners: [
      { name: "জীবিত ভাই", ana: 8, gonda: 0, kora: 0, kranti: 0, til: 0 },
      { name: "স্ত্রী", ana: 1, gonda: 0, kora: 0, kranti: 0, til: 0 },
      { name: "ছেলে", ana: 4, gonda: 13, kora: 1, kranti: 0, til: 0 },
      { name: "মেয়ে", ana: 2, gonda: 6, kora: 2, kranti: 0, til: 0 },
    ],
  },
];

interface ComplexTemplateModalProps {
  show: boolean;
  onClose: () => void;
  onSelect: (owners: Owner[]) => void;
}

export default function ComplexTemplateModal({ show, onClose, onSelect }: ComplexTemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ComplexTemplate | null>(null);
  const [activeView, setActiveView] = useState<"tree" | "structure" | "scenario">("tree");

  if (!show) return null;

  const handleSelect = (template: ComplexTemplate) => {
    setSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      if (confirm(`"${selectedTemplate.name}" টেমপ্লেট লোড করবেন? বর্তমান ডেটা মুছে যাবে।`)) {
        onSelect(selectedTemplate.owners);
        onClose();
        setSelectedTemplate(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-purple-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-purple-900 rounded-full p-2">
              <FileText className="text-purple-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-100">জটিল উত্তরাধিকার টেমপ্লেট</h3>
              <p className="text-gray-400 text-sm">একাধিক প্রজন্মের বন্টন</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(80vh-120px)]">
          {/* Template List */}
          <div className="w-1/4 border-r border-gray-700 overflow-y-auto p-4">
            <h4 className="font-semibold text-gray-300 mb-3">টেমপ্লেট নির্বাচন করুন</h4>
            <div className="space-y-2">
              {complexTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  className={`w-full text-left p-4 rounded-lg transition ${
                    selectedTemplate?.id === template.id
                      ? "bg-purple-900 border-purple-500"
                      : "bg-gray-700 hover:bg-gray-600 border-gray-600"
                  } border`}
                >
                  <h5 className="font-bold text-gray-100 mb-1">{template.name}</h5>
                  <p className="text-gray-300 text-sm">{template.description}</p>
                  <div className="mt-2 text-xs text-purple-300">{template.owners.length} জন মালিক</div>
                </button>
              ))}
            </div>
          </div>

          {/* Template Preview */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedTemplate ? (
              <div>
                <h4 className="text-xl font-bold text-gray-100 mb-4">{selectedTemplate.name}</h4>
                {/* View Tabs */}
                <div className="flex gap-2 mb-4 border-b border-gray-700">
                  <button
                    onClick={() => setActiveView("tree")}
                    className={`px-4 py-2 font-semibold transition ${
                      activeView === "tree"
                        ? "text-blue-400 border-b-2 border-blue-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    পরিবার বৃক্ষ
                  </button>
                  <button
                    onClick={() => setActiveView("scenario")}
                    className={`px-4 py-2 font-semibold transition ${
                      activeView === "scenario"
                        ? "text-blue-400 border-b-2 border-blue-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    পরিস্থিতি
                  </button>
                  <button
                    onClick={() => setActiveView("structure")}
                    className={`px-4 py-2 font-semibold transition ${
                      activeView === "structure"
                        ? "text-blue-400 border-b-2 border-blue-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    বন্টন কাঠামো
                  </button>
                </div>
                {/* Family Tree View */}
                {/* {activeView === "tree" && selectedTemplate.familyTree && (
                  <FamilyTreeView tree={selectedTemplate.familyTree} />
                )} */}
                {/* Update the family tree view: */}
                {activeView === "tree" && selectedTemplate.familyTree && (
                  <HorizontalFamilyTree tree={selectedTemplate.familyTree} />
                )}
                {/* Scenario */}
                <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-blue-200 mb-2 flex items-center gap-2">
                    <AlertCircle size={18} />
                    পরিস্থিতি
                  </h5>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    {selectedTemplate.scenario.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ChevronRight size={16} className="text-blue-400 mt-0.5 flex-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Structure */}
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-gray-200 mb-3">বন্টন কাঠামো</h5>
                  <div className="space-y-2">
                    {selectedTemplate.structure.map((item, idx) => (
                      <div key={idx}>
                        <div
                          className={`p-3 rounded ${
                            item.level === 0
                              ? "bg-gray-600 border border-gray-500"
                              : item.level === 1
                              ? "ml-4 bg-gray-800 border border-gray-550"
                              : "ml-6 bg-purple-900 border border-purple-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-normal text-gray-100">{item.name}</span>
                            {item.percentage && <span className="text-green-400 font-bold">{item.percentage}</span>}
                          </div>
                        </div>

                        {item.children && (
                          <div className={`${item.level === 0 ? "ml-8" : "ml-12"} mt-2 space-y-2`}>
                            {/* Show header if this is a parent section */}
                            {item.level === 1 && (
                              <div className="text-xs text-purple-400 font-semibold mb-1 flex items-center gap-1">
                                <span>📋</span>
                                <span>সন্তানদের মধ্যে বন্টন (ছেলে:মেয়ে = ২:১):</span>
                              </div>
                            )}
                            {item.children.map((child, childIdx) => (
                              <div key={childIdx} className="p-2 bg-gray-900 rounded border border-gray-600">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-200 text-sm">{child.name}</span>
                                  <span className="text-green-400 text-sm font-semibold">{child.percentage}</span>
                                </div>
                                {child.note && <p className="text-gray-400 text-xs mt-1">{child.note}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Final Owners */}
                <div className="bg-gray-300 border border-green-600 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-3">চূড়ান্ত মালিক তালিকা</h5>
                  <div className="space-y-2">
                    {selectedTemplate.owners.map((owner, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                        <span className="text-gray-200">{owner.name}</span>
                        <span className="text-gray-300 text-sm">
                          {owner.ana} আনা {owner.gonda} গন্ডা {owner.kora} কড়া
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <FileText size={64} className="mx-auto mb-4 opacity-30" />
                  <p>বামদিক থেকে একটি টেমপ্লেট নির্বাচন করুন</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          <p className="text-gray-400 text-sm">এই টেমপ্লেট শুধুমাত্র মালিক তালিকা লোড করবে</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition"
            >
              বাতিল
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedTemplate}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              টেমপ্লেট লোড করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
