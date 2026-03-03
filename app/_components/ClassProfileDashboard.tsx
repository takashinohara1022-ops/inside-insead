"use client";

import { useState } from "react";

const FILTERS = ["26D", "26J", "25D", "25J", "All"] as const;
type FilterKey = (typeof FILTERS)[number];

type BarItem = { label: string; value: number };

// 各フィルター用のダミーデータ（合計100%）
const CHART_DATA: Record<
  FilterKey,
  {
    industry: BarItem[];
    gender: BarItem[];
    sponsorship: BarItem[];
    overseas: BarItem[];
    campus: BarItem[];
    gmatGre: BarItem[];
  }
> = {
  "26D": {
    industry: [
      { label: "コンサルティング", value: 32 },
      { label: "金融", value: 24 },
      { label: "事業会社", value: 28 },
      { label: "起業・その他", value: 16 },
    ],
    gender: [
      { label: "男性", value: 62 },
      { label: "女性", value: 38 },
    ],
    sponsorship: [
      { label: "社費", value: 45 },
      { label: "私費", value: 55 },
    ],
    overseas: [
      { label: "0–2年", value: 18 },
      { label: "3–5年", value: 35 },
      { label: "6–10年", value: 28 },
      { label: "11年～", value: 19 },
    ],
    campus: [
      { label: "Fontainebleau", value: 58 },
      { label: "Singapore", value: 42 },
    ],
    gmatGre: [
      { label: "95%以上", value: 15 },
      { label: "90%〜95%未満", value: 35 },
      { label: "85%〜90%未満", value: 28 },
      { label: "80%〜85%未満", value: 14 },
      { label: "80%未満", value: 8 },
    ],
  },
  "26J": {
    industry: [
      { label: "コンサルティング", value: 28 },
      { label: "金融", value: 26 },
      { label: "事業会社", value: 30 },
      { label: "起業・その他", value: 16 },
    ],
    gender: [
      { label: "男性", value: 58 },
      { label: "女性", value: 42 },
    ],
    sponsorship: [
      { label: "社費", value: 52 },
      { label: "私費", value: 48 },
    ],
    overseas: [
      { label: "0–2年", value: 22 },
      { label: "3–5年", value: 38 },
      { label: "6–10年", value: 26 },
      { label: "11年～", value: 14 },
    ],
    campus: [
      { label: "Fontainebleau", value: 55 },
      { label: "Singapore", value: 45 },
    ],
    gmatGre: [
      { label: "95%以上", value: 12 },
      { label: "90%〜95%未満", value: 38 },
      { label: "85%〜90%未満", value: 26 },
      { label: "80%〜85%未満", value: 16 },
      { label: "80%未満", value: 8 },
    ],
  },
  "25D": {
    industry: [
      { label: "コンサルティング", value: 30 },
      { label: "金融", value: 22 },
      { label: "事業会社", value: 30 },
      { label: "起業・その他", value: 18 },
    ],
    gender: [
      { label: "男性", value: 65 },
      { label: "女性", value: 35 },
    ],
    sponsorship: [
      { label: "社費", value: 48 },
      { label: "私費", value: 52 },
    ],
    overseas: [
      { label: "0–2年", value: 20 },
      { label: "3–5年", value: 32 },
      { label: "6–10年", value: 30 },
      { label: "11年～", value: 18 },
    ],
    campus: [
      { label: "Fontainebleau", value: 62 },
      { label: "Singapore", value: 38 },
    ],
    gmatGre: [
      { label: "95%以上", value: 18 },
      { label: "90%〜95%未満", value: 32 },
      { label: "85%〜90%未満", value: 27 },
      { label: "80%〜85%未満", value: 13 },
      { label: "80%未満", value: 10 },
    ],
  },
  "25J": {
    industry: [
      { label: "コンサルティング", value: 26 },
      { label: "金融", value: 28 },
      { label: "事業会社", value: 32 },
      { label: "起業・その他", value: 14 },
    ],
    gender: [
      { label: "男性", value: 60 },
      { label: "女性", value: 40 },
    ],
    sponsorship: [
      { label: "社費", value: 50 },
      { label: "私費", value: 50 },
    ],
    overseas: [
      { label: "0–2年", value: 24 },
      { label: "3–5年", value: 36 },
      { label: "6–10年", value: 24 },
      { label: "11年～", value: 16 },
    ],
    campus: [
      { label: "Fontainebleau", value: 52 },
      { label: "Singapore", value: 48 },
    ],
    gmatGre: [
      { label: "95%以上", value: 14 },
      { label: "90%〜95%未満", value: 36 },
      { label: "85%〜90%未満", value: 26 },
      { label: "80%〜85%未満", value: 14 },
      { label: "80%未満", value: 10 },
    ],
  },
  All: {
    industry: [
      { label: "コンサルティング", value: 29 },
      { label: "金融", value: 25 },
      { label: "事業会社", value: 30 },
      { label: "起業・その他", value: 16 },
    ],
    gender: [
      { label: "男性", value: 61 },
      { label: "女性", value: 39 },
    ],
    sponsorship: [
      { label: "社費", value: 49 },
      { label: "私費", value: 51 },
    ],
    overseas: [
      { label: "0–2年", value: 21 },
      { label: "3–5年", value: 35 },
      { label: "6–10年", value: 27 },
      { label: "11年～", value: 17 },
    ],
    campus: [
      { label: "Fontainebleau", value: 57 },
      { label: "Singapore", value: 43 },
    ],
    gmatGre: [
      { label: "95%以上", value: 15 },
      { label: "90%〜95%未満", value: 35 },
      { label: "85%〜90%未満", value: 27 },
      { label: "80%〜85%未満", value: 14 },
      { label: "80%未満", value: 9 },
    ],
  },
};

const CHART_TITLES: { key: keyof (typeof CHART_DATA)[FilterKey]; title: string }[] = [
  { key: "industry", title: "出身業界" },
  { key: "gender", title: "男女比" },
  { key: "sponsorship", title: "社費・私費" },
  { key: "overseas", title: "海外経験（年別）" },
  { key: "campus", title: "スターティングキャンパス (Fonty / Singy)" },
  { key: "gmatGre", title: "GMAT Focus / GRE スコア (Percentile)" },
];

function HorizontalBarChart({ items }: { items: BarItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs text-slate-600 sm:w-32">
            {item.label}
          </span>
          <div className="min-w-0 flex-1">
            <div className="h-6 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-[#005543] transition-[width] duration-500 ease-out"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
          <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-700">
            {item.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function ClassProfileDashboard() {
  const [filter, setFilter] = useState<FilterKey>("All");
  const data = CHART_DATA[filter];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-lg">
      <div className="flex flex-col gap-4 border-b border-neutral-100 px-5 pt-5 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-6 sm:pb-4">
        <div
          className="flex flex-wrap gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1"
          role="tablist"
          aria-label="クラスでフィルター"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/40 ${
                filter === f
                  ? "bg-[#005543] text-white shadow-sm"
                  : "text-slate-600 hover:bg-neutral-200/80 hover:text-slate-900"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:gap-8 sm:p-6 lg:grid-cols-2 lg:grid-rows-3">
        {CHART_TITLES.map(({ key, title }) => (
          <div
            key={key}
            className="flex min-h-0 flex-col rounded-lg border border-neutral-100 bg-neutral-50/50 p-4 sm:p-5"
          >
            <h3 className="mb-4 shrink-0 text-xs font-semibold uppercase tracking-wider text-[#005543]">
              {title}
            </h3>
            <div className="min-h-0 flex-1">
              <HorizontalBarChart items={data[key]} />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 px-5 pb-5 text-center text-[11px] text-slate-500 sm:px-6 sm:pb-6">
        表示データは仮のダミーデータです。合計100%。
      </p>
    </div>
  );
}
