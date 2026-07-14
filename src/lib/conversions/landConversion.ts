export const shotokToSqFeet = (shotok: number): number => shotok * 435.6;

export const shotokToKatha = (shotok: number): number => (shotok * 435.6) / 721.46;

export const shotokToKaniGonda = (shotok: number) => {
  // Conversion factor
  const SHOTOK_PER_GONDA = 2; // 1 gonda = 1.9835 (2) shotok = 864 sqft

  const totalGonda = shotok / SHOTOK_PER_GONDA;

  // ১ কানি = ২০ গণ্ডা
  let kani = Math.floor(totalGonda / 20);
  let remainingGonda = totalGonda % 20;

  // গণ্ডা বের করা
  let gonda = Math.floor(remainingGonda);

  // অবশিষ্ট গণ্ডা থেকে কড়া বের করা (১ গণ্ডা = ৪ কড়া)
  let remainingKora = (remainingGonda - gonda) * 4;
  let kora = Math.floor(remainingKora);

  // অবশিষ্ট কড়া থেকে ক্রান্তি বের করা (১ কড়া = ৩ ক্রান্তি)
  let remainingKranti = (remainingKora - kora) * 3;
  let kranti = Math.floor(remainingKranti);

  // অবশিষ্ট ক্রান্তি থেকে তিল বের করা (১ ক্রান্তি = ২০ তিল)
  let remainingTil = (remainingKranti - kranti) * 20;
  let til = Math.round(remainingTil);

  // Handle overflow: if til rounds up to 20, carry over to kranti
  if (til >= 20) {
    til = 0;
    kranti += 1;
  }
  if (kranti >= 3) {
    kranti = 0;
    kora += 1;
  }
  if (kora >= 4) {
    kora = 0;
    gonda += 1;
  }
  if (gonda >= 20) {
    gonda = 0;
    kani += 1;
  }

  return { kani, gonda, kora, kranti, til };
};
