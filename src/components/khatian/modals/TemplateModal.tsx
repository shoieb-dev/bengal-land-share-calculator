import { useState } from "react";
import { X, FileText, Users, Layers, Search } from "lucide-react";
import { khatiyanTemplates, KhatiyanTemplate } from "@/lib/constants/templates";

interface TemplateModalProps {
  show: boolean;
  onClose: () => void;
  onSelect: (template: KhatiyanTemplate) => void;
}

export default function TemplateModal({ show, onClose, onSelect }: TemplateModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (!show) return null;

  const categories = [
    { id: "all", name: "সব", icon: Layers },
    { id: "siblings", name: "ভাইবোন", icon: Users },
    { id: "inheritance", name: "ওয়ারিশ", icon: FileText },
    { id: "custom", name: "কাস্টম", icon: Layers },
  ];

  const filteredTemplates = khatiyanTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: KhatiyanTemplate) => {
    if (confirm(`"${template.name}" টেমপ্লেট লোড করবেন? বর্তমান ডেটা মুছে যাবে।`)) {
      onSelect(template);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-indigo-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-900 rounded-full p-2">
              <FileText className="text-indigo-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-100">টেমপ্লেট নির্বাচন করুন</h3>
              <p className="text-gray-400 text-sm">সাধারণ পরিস্থিতির জন্য প্রি-মেড টেমপ্লেট</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-700 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="টেমপ্লেট খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 pl-10 pr-4 py-2 rounded focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm ${
                    selectedCategory === cat.id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <Icon size={16} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-280px)]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>কোনো টেমপ্লেট পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-indigo-500 rounded-lg p-4 text-left transition group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-100 group-hover:text-indigo-400 transition">{template.name}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        template.category === "siblings"
                          ? "bg-blue-900 text-blue-300"
                          : template.category === "inheritance"
                          ? "bg-green-900 text-green-300"
                          : "bg-purple-900 text-purple-300"
                      }`}
                    >
                      {template.category === "siblings"
                        ? "ভাইবোন"
                        : template.category === "inheritance"
                        ? "ওয়ারিশ"
                        : "কাস্টম"}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-3">{template.description}</p>

                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {template.owners.length} মালিক
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers size={14} />
                      {template.dags.length} দাগ
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-750">
          <p className="text-gray-800 text-shadow-md text-center">
            টেমপ্লেট নির্বাচন করলে আপনার বর্তমান ডেটা মুছে যাবে
          </p>
        </div>
      </div>
    </div>
  );
}
