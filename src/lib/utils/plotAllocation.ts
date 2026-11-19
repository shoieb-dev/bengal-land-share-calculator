import { Dag, DagGongAllocation, Owner } from "../types";

export const getGongShareRatio = (gongAllocation: DagGongAllocation): number => {
  const units = [
    gongAllocation.ana,
    gongAllocation.gonda,
    gongAllocation.kora,
    gongAllocation.kranti,
    gongAllocation.til,
  ];
  if (units.every((unit) => unit === undefined)) return 1;

  return (
    (gongAllocation.ana ?? 0) / 16 +
    (gongAllocation.gonda ?? 0) / 320 +
    (gongAllocation.kora ?? 0) / 1280 +
    (gongAllocation.kranti ?? 0) / 3840 +
    (gongAllocation.til ?? 0) / 76800
  );
};

/** Allocates configured dag shares first, then distributes remaining land by each owner's entitlement. */
export const allocateDagLand = (owners: Owner[], dags: Dag[], ownerShares: number[]): number[][] => {
  const allocation = dags.map(() => owners.map(() => 0));
  const specificDagLand = dags.map((dag) => {
    const entries = dag.gongEntries ??
      dag.gongAllocations ??
      (dag.gongAllocation ? [dag.gongAllocation] : []);
    return entries.reduce(
      (sum, entry) => sum + dag.land * getGongShareRatio(entry),
      0,
    );
  });
  const generalDagLand = dags.map((dag, dagIndex) => dag.land - specificDagLand[dagIndex]);

  dags.forEach((dag, dagIndex) => {
    const entries = dag.gongEntries ??
      dag.gongAllocations ??
      (dag.gongAllocation ? [dag.gongAllocation] : []);
    entries.forEach((entry) => {
      const selectedOwnerNames = new Set(entry.ownerNames);
      const ownerIndexes = owners.flatMap((owner, ownerIndex) =>
        selectedOwnerNames.has(owner.name) ? [ownerIndex] : [],
      );
      const selectedShareTotal = ownerIndexes.reduce((sum, ownerIndex) => sum + ownerShares[ownerIndex], 0);
      const entryLand = dag.land * getGongShareRatio(entry);
      ownerIndexes.forEach((ownerIndex) => {
        allocation[dagIndex][ownerIndex] +=
          selectedShareTotal > 0
            ? (entryLand * ownerShares[ownerIndex]) / selectedShareTotal
            : 0;
      });
    });
  });

  const totalLand = dags.reduce((sum, dag) => sum + dag.land, 0);
  const remainingEntitlements = owners.map((_, ownerIndex) => {
    const specificLand = allocation.reduce((sum, dagAllocation) => sum + dagAllocation[ownerIndex], 0);
    return Math.max(0, totalLand * ownerShares[ownerIndex] - specificLand);
  });
  const totalRemainingEntitlement = remainingEntitlements.reduce((sum, amount) => sum + amount, 0);
  const totalGeneralLand = generalDagLand.reduce((sum, amount) => sum + amount, 0);
  const allocatedGeneralLand = Math.min(totalGeneralLand, totalRemainingEntitlement);

  if (totalRemainingEntitlement > 0 && totalGeneralLand > 0) {
    generalDagLand.forEach((dagLand, dagIndex) => {
      owners.forEach((_, ownerIndex) => {
        allocation[dagIndex][ownerIndex] +=
          dagLand * (allocatedGeneralLand / totalGeneralLand) * (remainingEntitlements[ownerIndex] / totalRemainingEntitlement);
      });
    });
  }

  return allocation;
};
