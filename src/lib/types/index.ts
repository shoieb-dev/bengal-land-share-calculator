export type HeirRelation = "wife" | "husband" | "son" | "daughter";

export type Heir = {
  id: string;
  name: string;
  relation: HeirRelation;
};

export type Owner = {
  name: string;
  ana: number;
  gonda: number;
  kora: number;
  kranti: number;
  til: number;
  /** true হলে মালিক নামজারিকৃত (খারিজ) — মূল খতিয়ানের হিসাবে গণ্য হবে না */
  mutated?: boolean;
  totalLand?: number;
  shareRatio?: number;
  /** কার্যকর (নরমালাইজড) হিস্যা: activeShare / totalActiveShare */
  effectiveShare?: number;
  /** মূল হিস্যা (mutation বাদ দেওয়ার আগের অংশ) */
  originalShare?: number;
  /** true হলে মালিক মৃত — তার অংশ ওয়ারিশদের মধ্যে ভাগ হবে */
  deceased?: boolean;
  /** মৃত মালিকের ওয়ারিশরা */
  heirs?: Heir[];
};

export type Dag = {
  name: string;
  land: number;
};

export type KhatiyanHeader = {
  surveyType: string;
  district: string;
  khatiyanNo: string;
  thana: string;
  mouja: string;
  jlNo: string;
};

export type ValidationError = {
  type: string;
  message: string;
};

export type DeleteModalType = {
  show: boolean;
  type: "owner" | "dag" | null;
  index: number;
  name: string;
};

export type ResetModalType = {
  show: boolean;
};

export type ResultRow = {
  dagName: string;
  ownerName: string;
  land: number;
  /** মৃত মালিকের মূল রো (muted/strikethrough দেখাতে) */
  isDeceased?: boolean;
  /** ওয়ারিশের রো */
  isHeir?: boolean;
  /** ওয়ারিশের পিতৃ/মাতা/স্বামী (মালিক) — চার্ট রঙের জন্য */
  parentOwner?: string;
  relation?: HeirRelation;
};
