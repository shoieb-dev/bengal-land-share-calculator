export const shotokToSqFeet = (shotok: number): number => shotok * 435.6;

export const shotokToKatha = (shotok: number): number => (shotok * 435.6) / 721.46;

export const shotokToKaniGonda = (shotok: number) => {
  const totalGonda = shotok / 1.9835;
  const kani = Math.floor(totalGonda / 20);
  const remainingGonda = totalGonda % 20;
  const gonda = Math.floor(remainingGonda);
  const kora = Math.floor((remainingGonda - gonda) * 4);
  return { kani, gonda, kora };
};
