export type Owner = {
  name: string;
  ana: number;
  gonda: number;
  kora: number;
  kranti: number;
  til: number;
  totalLand?: number;
  shareRatio?: number;
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
