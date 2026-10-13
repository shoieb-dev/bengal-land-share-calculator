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
