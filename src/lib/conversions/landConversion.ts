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

  // এই fraction-টাই তিল ও দন্ত উভয়ের উৎস (দুটোই ক্রান্তির একই অবশিষ্টাংশের
  // ভিন্ন ভিন্ন এককে প্রকাশ — একটির উপর আরেকটি নির্ভর করে না)
  const krantiFraction = remainingKranti - kranti;

  // ১. প্রথমে সম্পূর্ণ নিখুঁতভাবে তিল বের করি (১ ক্রান্তি = ২০ তিল)
  let til = Math.round(krantiFraction * 20);

  // ২. এবার এই তিল-এর ওপর ভিত্তি করে দন্ত বের করি
  // যেহেতু ১ ক্রান্তি = ২০ তিল = ৬ দন্ত, সেহেতু ১ দন্ত = (২০ / ৬) তিল = ৩.৩৩৩৩... তিল
  // তাই তিলকে (২০ / ৬) দিয়ে ভাগ করলেই সমমান দন্ত পাওয়া যাবে

  // let dontho = Math.min(5, Math.round(krantiFraction * 6));
  let dontho = Math.min(5, Math.round(til / (20 / 6)));

  // Handle overflow: if til rounds up to 20, carry over to kranti
  if (til >= 20) {
    til = 0;
    dontho = 0; // fraction rolled over to next kranti, so dontho resets too
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

  return { kani, gonda, kora, kranti, til, dontho };
};
