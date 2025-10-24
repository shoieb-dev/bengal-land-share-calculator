import { toBengaliNumber } from "../utils/numberConversion";

// Constants
export const anaOptions = [
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

export const koraOptions = [
  { label: "০ কড়া", value: 0 },
  { label: "৷ (১ কড়া)", value: 1 },
  { label: "৷৷ (২ কড়া)", value: 2 },
  { label: "৸ (৩ কড়া)", value: 3 },
];

export const krantiOptions = [
  { label: "০ ক্রান্তি", value: 0 },
  { label: "৴ (১ ক্রান্তি)", value: 1 },
  { label: "৴৴ (২ ক্রান্তি)", value: 2 },
];

export const gondaOptions = Array.from({ length: 20 }, (_, i) => ({
  label: `${toBengaliNumber(i)} (গন্ডা)`,
  value: i,
}));

export const tilOptions = Array.from({ length: 20 }, (_, i) => ({
  label: `${toBengaliNumber(i)} (তিল)`,
  value: i,
}));

// Add this new constant array
export const bangladeshDistricts = [
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "সিলেট",
  "বরিশাল",
  "রংপুর",
  "ময়মনসিংহ",
  "ফরিদপুর",
  "কুমিল্লা",
  "নোয়াখালী",
  "যশোর",
  "কুষ্টিয়া",
  "বগুড়া",
  "দিনাজপুর",
  "পাবনা",
  "টাঙ্গাইল",
  "গাজীপুর",
  "নরসিংদী",
  "মুন্সিগঞ্জ",
  "নারায়ণগঞ্জ",
  "মানিকগঞ্জ",
  "কিশোরগঞ্জ",
  "নেত্রকোনা",
  "শেরপুর",
  "জামালপুর",
  "চাঁদপুর",
  "লক্ষ্মীপুর",
  "ব্রাহ্মণবাড়িয়া",
  "হবিগঞ্জ",
  "মৌলভীবাজার",
  "সুনামগঞ্জ",
  "পটুয়াখালী",
  "ভোলা",
  "বরগুনা",
  "ঝালকাঠি",
  "পিরোজপুর",
  "বাগেরহাট",
  "সাতক্ষীরা",
  "নড়াইল",
  "মাগুরা",
  "ঝিনাইদহ",
  "চুয়াডাঙ্গা",
  "মেহেরপুর",
  "নাটোর",
  "নওগাঁ",
  "চাঁপাইনবাবগঞ্জ",
  "পঞ্চগড়",
  "ঠাকুরগাঁও",
  "নীলফামারী",
  "লালমনিরহাট",
  "কুড়িগ্রাম",
  "গাইবান্ধা",
  "সিরাজগঞ্জ",
  "জয়পুরহাট",
  "বান্দরবান",
  "রাঙ্গামাটি",
  "খাগড়াছড়ি",
  "কক্সবাজার",
  "শরীয়তপুর",
  "মাদারীপুর",
];

export const surveyTypes = ["সি এস", "আর এস", "বি এস", "এস এ", "অন্যান্য"];
