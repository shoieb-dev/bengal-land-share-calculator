import { Owner, Dag, KhatiyanHeader } from "../types";

export interface KhatiyanTemplate {
  id: string;
  name: string;
  description: string;
  category: "siblings" | "inheritance" | "custom";
  header: Partial<KhatiyanHeader>;
  owners: Omit<Owner, "totalLand" | "shareRatio">[];
  dags: Dag[];
}

export const khatiyanTemplates: KhatiyanTemplate[] = [
  // Siblings Templates
  {
    id: "two-siblings-equal",
    name: "২ ভাইবোন - সমান ভাগ",
    description: "দুই ভাইবোনের মধ্যে সমান ভাগে জমি বন্টন",
    category: "siblings",
    header: {},
    owners: [
      { name: "ভাই/বোন ১", ana: 8, gonda: 0, kora: 0, kranti: 0, til: 0 },
      { name: "ভাই/বোন ২", ana: 8, gonda: 0, kora: 0, kranti: 0, til: 0 },
    ],
    dags: [{ name: "১", land: 100 }],
  },
  {
    id: "three-siblings-equal",
    name: "৩ ভাইবোন - সমান ভাগ",
    description: "তিন ভাইবোনের মধ্যে সমান ভাগে জমি বন্টন",
    category: "siblings",
    header: {},
    owners: [
      { name: "ভাই/বোন ১", ana: 5, gonda: 6, kora: 2, kranti: 0, til: 0 },
      { name: "ভাই/বোন ২", ana: 5, gonda: 6, kora: 2, kranti: 0, til: 0 },
      { name: "ভাই/বোন ৩", ana: 5, gonda: 6, kora: 2, kranti: 0, til: 0 },
    ],
    dags: [{ name: "১", land: 100 }],
  },
  {
    id: "four-siblings-equal",
    name: "৪ ভাইবোন - সমান ভাগ",
    description: "চার ভাইবোনের মধ্যে সমান ভাগে জমি বন্টন",
    category: "siblings",
    header: {},
    owners: [
      { name: "ভাই/বোন ১", ana: 4, gonda: 0, kora: 0, kranti: 0, til: 0 },
      { name: "ভাই/বোন ২", ana: 4, gonda: 0, kora: 0, kranti: 0, til: 0 },
      { name: "ভাই/বোন ৩", ana: 4, gonda: 0, kora: 0, kranti: 0, til: 0 },
      { name: "ভাই/বোন ৪", ana: 4, gonda: 0, kora: 0, kranti: 0, til: 0 },
    ],
    dags: [{ name: "১", land: 100 }],
  },
  {
    id: "five-siblings-equal",
    name: "৫ ভাইবোন - সমান ভাগ",
    description: "পাঁচ ভাইবোনের মধ্যে সমান ভাগে জমি বন্টন",
    category: "siblings",
    header: {},
    owners: [
      { name: "ভাই/বোন ১", ana: 3, gonda: 4, kora: 0, kranti: 0, til: 0 },
      { name: "ভাই/বোন ২", ana: 3, gonda: 4, kora: 0, kranti: 0, til: 0 },
      { name: "ভাই/বোন ৩", ana: 3, gonda: 4, kora: 0, kranti: 0, til: 0 },
      { name: "ভাই/বোন ৪", ana: 3, gonda: 4, kora: 0, kranti: 0, til: 0 },
      { name: "ভাই/বোন ৫", ana: 3, gonda: 4, kora: 0, kranti: 0, til: 0 },
    ],
    dags: [{ name: "১", land: 100 }],
  },

  // Inheritance Templates (Islamic)
  {
    id: "inheritance-1son-1daughter",
    name: "ওয়ারিশ: ১ ছেলে, ১ মেয়ে",
    description: "ইসলামিক উত্তরাধিকার - ১ ছেলে ও ১ মেয়ে (২:১ অনুপাত)",
    category: "inheritance",
    header: {},
    owners: [
      { name: "ছেলে", ana: 10, gonda: 13, kora: 1, kranti: 0, til: 0 }, // 2/3
      { name: "মেয়ে", ana: 5, gonda: 6, kora: 2, kranti: 0, til: 0 }, // 1/3
    ],
    dags: [{ name: "১", land: 100 }],
  },
  {
    id: "inheritance-2sons-1daughter",
    name: "ওয়ারিশ: ২ ছেলে, ১ মেয়ে",
    description: "ইসলামিক উত্তরাধিকার - ২ ছেলে ও ১ মেয়ে",
    category: "inheritance",
    header: {},
    owners: [
      { name: "ছেলে ১", ana: 6, gonda: 8, kora: 0, kranti: 0, til: 0 }, // 2/5
      { name: "ছেলে ২", ana: 6, gonda: 8, kora: 0, kranti: 0, til: 0 }, // 2/5
      { name: "মেয়ে", ana: 3, gonda: 4, kora: 0, kranti: 0, til: 0 }, // 1/5
    ],
    dags: [{ name: "১", land: 100 }],
  },
  {
    id: "inheritance-1son-2daughters",
    name: "ওয়ারিশ: ১ ছেলে, ২ মেয়ে",
    description: "ইসলামিক উত্তরাধিকার - ১ ছেলে ও ২ মেয়ে",
    category: "inheritance",
    header: {},
    owners: [
      { name: "ছেলে", ana: 8, gonda: 0, kora: 0, kranti: 0, til: 0 }, // 1/2
      { name: "মেয়ে ১", ana: 4, gonda: 0, kora: 0, kranti: 0, til: 0 }, // 1/4
      { name: "মেয়ে ২", ana: 4, gonda: 0, kora: 0, kranti: 0, til: 0 }, // 1/4
    ],
    dags: [{ name: "১", land: 100 }],
  },
  {
    id: "inheritance-3sons",
    name: "ওয়ারিশ: ৩ ছেলে",
    description: "তিন ছেলের মধ্যে সমান ভাগ",
    category: "inheritance",
    header: {},
    owners: [
      { name: "ছেলে ১", ana: 5, gonda: 6, kora: 2, kranti: 0, til: 0 },
      { name: "ছেলে ২", ana: 5, gonda: 6, kora: 2, kranti: 0, til: 0 },
      { name: "ছেলে ৩", ana: 5, gonda: 6, kora: 2, kranti: 0, til: 0 },
    ],
    dags: [{ name: "১", land: 100 }],
  },
  {
    id: "inheritance-2daughters",
    name: "ওয়ারিশ: ২ মেয়ে",
    description: "দুই মেয়ের মধ্যে সমান ভাগ",
    category: "inheritance",
    header: {},
    owners: [
      { name: "মেয়ে ১", ana: 8, gonda: 0, kora: 0, kranti: 0, til: 0 },
      { name: "মেয়ে ২", ana: 8, gonda: 0, kora: 0, kranti: 0, til: 0 },
    ],
    dags: [{ name: "১", land: 100 }],
  },
  {
    id: "inheritance-3brothers-2deceased",
    name: "ওয়ারিশ: ৩ ভাইয়ের উত্তরসূরি",
    description: "তিন ভাইয়ের সন্তানদের মধ্যে ইসলামিক বন্টন",
    category: "inheritance",
    header: {},
    owners: [
      // 1. Ayub Ali - 33.33% = 5 ana 6 gonda 2 kora
      { name: "আইয়ুব আলী চৌধুরী", ana: 5, gonda: 6, kora: 2, kranti: 0, til: 0 },

      // Nowab Ali's children - 16.67% total
      // Mohiuddin (2/3 of 16.67%) = 11.11% = 1 ana 15 gonda 3 kora
      { name: "মহিউদ্দিন", ana: 1, gonda: 15, kora: 3, kranti: 1, til: 0 },
      // Niru Fatema (1/3 of 16.67%) = 5.56% = 0 ana 17 gonda 2 kora
      { name: "নিরু ফাতেমা", ana: 0, gonda: 17, kora: 2, kranti: 1, til: 0 },

      // Nowazesh Ali's children - 16.67% total
      // Zahangir (2/5 of 16.67%) = 6.67% = 1 ana 1 gonda 2 kora
      { name: "জাহাঙ্গীর", ana: 1, gonda: 1, kora: 2, kranti: 0, til: 0 },
      // Alamgir (2/5 of 16.67%) = 6.67% = 1 ana 1 gonda 2 kora
      { name: "আলমগীর", ana: 1, gonda: 1, kora: 2, kranti: 0, til: 0 },
      // Hasina (1/5 of 16.67%) = 3.33% = 0 ana 10 gonda 2 kora
      { name: "হাসিনা সুলতানা", ana: 0, gonda: 10, kora: 2, kranti: 1, til: 0 },

      // 3. Abdus Sabur - 33.33% = 5 ana 6 gonda 2 kora
      { name: "আবদুস সবুর চৌধুরী", ana: 5, gonda: 6, kora: 2, kranti: 0, til: 0 },
    ],
    dags: [{ name: "১", land: 100 }],
  },

  // Custom Templates
  {
    id: "custom-half-half",
    name: "অর্ধেক-অর্ধেক",
    description: "দুই মালিকের মধ্যে অর্ধেক করে ভাগ",
    category: "custom",
    header: {},
    owners: [
      { name: "মালিক ১", ana: 8, gonda: 0, kora: 0, kranti: 0, til: 0 },
      { name: "মালিক ২", ana: 8, gonda: 0, kora: 0, kranti: 0, til: 0 },
    ],
    dags: [{ name: "১", land: 100 }],
  },
  {
    id: "custom-three-quarter-one-quarter",
    name: "৩/৪ এবং ১/৪",
    description: "একজন তিন-চতুর্থাংশ, অন্যজন এক-চতুর্থাংশ",
    category: "custom",
    header: {},
    owners: [
      { name: "মালিক ১", ana: 12, gonda: 0, kora: 0, kranti: 0, til: 0 }, // 3/4
      { name: "মালিক ২", ana: 4, gonda: 0, kora: 0, kranti: 0, til: 0 }, // 1/4
    ],
    dags: [{ name: "১", land: 100 }],
  },
  {
    id: "custom-multiple-dags",
    name: "একাধিক দাগ",
    description: "৩টি দাগ সহ নমুনা",
    category: "custom",
    header: {},
    owners: [
      { name: "মালিক ১", ana: 8, gonda: 0, kora: 0, kranti: 0, til: 0 },
      { name: "মালিক ২", ana: 8, gonda: 0, kora: 0, kranti: 0, til: 0 },
    ],
    dags: [
      { name: "১", land: 50 },
      { name: "২", land: 75 },
      { name: "৩", land: 100 },
    ],
  },
];
