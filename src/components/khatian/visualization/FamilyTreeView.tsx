import { Users, User, ArrowDown } from "lucide-react";

interface FamilyMember {
  name: string;
  percentage: string;
  generation: number;
  children?: FamilyMember[];
  note?: string;
  isDeceased?: boolean;
}

interface FamilyTreeViewProps {
  tree: FamilyMember[];
}

export default function FamilyTreeView({ tree }: FamilyTreeViewProps) {
  const renderMember = (member: FamilyMember, isLast: boolean = false) => (
    <div key={member.name} className={`${isLast ? "" : "mb-4"}`}>
      {/* Member Card */}
      <div className={`relative ${member.generation === 0 ? "ml-0" : member.generation === 1 ? "ml-8" : "ml-16"}`}>
        <div
          className={`p-3 rounded-lg border-2 ${
            member.generation === 0
              ? "bg-blue-900 border-blue-600"
              : member.generation === 1
              ? "bg-purple-900 border-purple-600"
              : "bg-green-900 border-green-600"
          } ${member.isDeceased ? "opacity-75" : ""}`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`p-1.5 rounded ${
                  member.generation === 0 ? "bg-blue-700" : member.generation === 1 ? "bg-purple-700" : "bg-green-700"
                }`}
              >
                {member.children ? <Users size={16} /> : <User size={16} />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-100 text-sm">
                  {member.name}
                  {member.isDeceased && <span className="ml-2 text-xs text-red-400">(মৃত)</span>}
                </div>
                {member.note && <div className="text-xs text-gray-400 mt-0.5">{member.note}</div>}
              </div>
            </div>
            <div
              className={`text-sm font-bold px-2 py-1 rounded ${
                member.generation === 0 ? "bg-blue-700" : member.generation === 1 ? "bg-purple-700" : "bg-green-700"
              }`}
            >
              {member.percentage}
            </div>
          </div>
        </div>

        {/* Connection Line */}
        {member.children && member.children.length > 0 && (
          <div className="flex items-center justify-center my-2">
            <ArrowDown size={20} className="text-gray-500" />
          </div>
        )}
      </div>

      {/* Children */}
      {member.children && member.children.length > 0 && (
        <div className="space-y-2">
          {member.children.map((child, idx) => renderMember(child, idx === member.children!.length - 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h5 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <Users size={20} className="text-blue-400" />
        পরিবার বৃক্ষ
      </h5>
      <div className="space-y-4">{tree.map((member, idx) => renderMember(member, idx === tree.length - 1))}</div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">প্রজন্ম:</div>
        <div className="flex gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-gray-300">১ম প্রজন্ম (মূল ভাই)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded"></div>
            <span className="text-gray-300">২য় প্রজন্ম (সন্তান)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span className="text-gray-300">৩য় প্রজন্ম (নাতি-নাতনি)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
