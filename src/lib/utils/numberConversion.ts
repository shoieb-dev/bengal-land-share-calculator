export const toBengaliNumber = (num: number | string): string => {
  return num.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
};

export const toEnglishNumber = (bengaliNum: string): string => {
  const bengaliDigits = "০১২৩৪৫৬৭৮৯";
  return bengaliNum.replace(/[০-৯]/g, (d) => bengaliDigits.indexOf(d).toString());
};

export const parseNumber = (value: string): number => {
  const englishValue = toEnglishNumber(value);
  return parseFloat(englishValue) || 0;
};
