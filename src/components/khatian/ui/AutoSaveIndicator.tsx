import { useState, useEffect } from "react";
import { Save, Check, Clock } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils/storage";

interface AutoSaveIndicatorProps {
  lastSaved: Date | null;
  isSaving: boolean;
  autoSaveEnabled: boolean;
  onToggleAutoSave: (enabled: boolean) => void;
}

export default function AutoSaveIndicator({
  lastSaved,
  isSaving,
  autoSaveEnabled,
  onToggleAutoSave,
}: AutoSaveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    if (lastSaved) {
      setTimeAgo(formatTimeAgo(lastSaved));
      const interval = setInterval(() => {
        setTimeAgo(formatTimeAgo(lastSaved));
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [lastSaved]);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Auto-save Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="auto-save"
          checked={autoSaveEnabled}
          onChange={(e) => onToggleAutoSave(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="auto-save" className="text-gray-300 text-sm cursor-pointer">
          স্বয়ংক্রিয় সংরক্ষণ
        </label>
      </div>

      {/* Save Status */}
      {autoSaveEnabled && (
        <div className="flex items-center gap-2 text-sm">
          {isSaving ? (
            <>
              <Save className="animate-pulse text-blue-400" size={16} />
              <span className="text-gray-400">সংরক্ষণ করা হচ্ছে...</span>
            </>
          ) : lastSaved ? (
            <>
              <Check className="text-green-400" size={16} />
              <span className="text-gray-400 flex items-center gap-1">
                <Clock size={14} />
                {timeAgo}
              </span>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
