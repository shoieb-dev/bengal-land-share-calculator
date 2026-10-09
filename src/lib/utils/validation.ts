import { Owner, Dag, ValidationError } from "../types";

export const calculateShareRatio = (owner: Owner): number => {
  return owner.ana / 16 + owner.gonda / 320 + owner.kora / 1280 + owner.kranti / 3840 + owner.til / 76800;
};

export const totalShareRatio = (owners: Owner[]): number => {
  return owners.reduce((sum, owner) => sum + calculateShareRatio(owner), 0);
};

export const validate = (owners: Owner[], dags: Dag[]): ValidationError[] => {
  const newErrors: ValidationError[] = [];

  if (owners.length === 0) {
    newErrors.push({ type: "owners", message: "অন্তত একজন মালিক যোগ করুন" });
  }

  if (dags.length === 0) {
    newErrors.push({ type: "dags", message: "অন্তত একটি দাগ যোগ করুন" });
  }

  owners.forEach((owner, i) => {
    const name = owner.name.trim();
    if (!name) {
      newErrors.push({ type: "owner", message: `মালিক #${i + 1} এর নাম লিখুন` });
    }

    const ratio = calculateShareRatio(owner);
    if (ratio === 0) {
      newErrors.push({ type: "owner", message: `${name || `মালিক #${i + 1}`} এর অংশ নির্বাচন করুন` });
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

  const totalRatioValue = totalShareRatio(owners);
  if (totalRatioValue > 1.009) {
    newErrors.push({ type: "total", message: "মোট মালিকানা ১৬ আনা (১০০%) বেশি হতে পারে না!" });
  }

  return newErrors;
};
