import { Owner, Dag, ValidationError } from "../types";

export const calculateShareRatio = (owner: Owner): number => {
  return owner.ana / 16 + owner.gonda / 320 + owner.kora / 1280 + owner.kranti / 3840 + owner.til / 76800;
};

export const validate = (owners: Owner[], dags: Dag[]): ValidationError[] => {
  const newErrors: ValidationError[] = [];

  // Validation logic here

  return newErrors;
};
