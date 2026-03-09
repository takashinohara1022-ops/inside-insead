export const GLOBAL_RANKING_YEARS = [
  2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
];

export const GLOBAL_RANKING_SOURCES = {
  ft: {
    label: "Financial Times",
    color: "#005543",
    data: {
      2016: 1,
      2017: 1,
      2018: 2,
      2019: 3,
      2020: 4,
      2021: 1,
      2022: 3,
      2023: 2,
      2024: 2,
      2025: 2,
      2026: 2,
    } as Record<number, number>,
  },
  qs: {
    label: "QS",
    color: "#0ea5e9",
    data: {
      2018: 2,
      2019: 6,
      2020: 3,
      2021: 6,
      2022: 7,
      2023: 9,
      2024: 9,
      2025: 11,
      2026: 8,
    } as Record<number, number>,
  },
  bloomberg: {
    label: "Bloomberg",
    color: "#f59e0b",
    data: {
      2016: 1,
      2017: 1,
      2018: 1,
      2019: 2,
      2021: 2,
      2022: 3,
      2023: 5,
      2024: 5,
      2025: 5,
    } as Record<number, number>,
  },
  forbes: {
    label: "Forbes",
    color: "#8b5cf6",
    data: {
      2017: 2,
      2019: 2,
      2021: 1,
      2023: 2,
    } as Record<number, number>,
  },
} as const;
