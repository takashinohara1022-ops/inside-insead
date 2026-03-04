"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1gGPva62UWo_U0QidDD7oPL1Qgs-NtBLisKgdWIO7FbY/export?format=csv";

type CsvRow = Record<string, string | undefined>;
type BarItem = { label: string; value: number };
type CountItem = { label: string; count: number };
type ClassTab = {
  key: string;
  displayLabel: string;
  year: number;
  monthCode: "J" | "D";
};

export type StudentProfile = {
  gradYear: number | null;
  gradMonth: string;
  classKey: string | null;
  classDisplayLabel: string | null;
  industry: string;
  sponsor: string;
  campus: string;
  aptitudeTest: string;
  aptitudeScore: number | null;
  overseasExperience: string;
  yearsOfExperienceAtEntry: number | null;
  whyInseadCategoriesRaw: string;
};

type ProfileSummary = {
  industry: BarItem[];
  sponsorship: BarItem[];
  campus: BarItem[];
  gmatScoreDistribution: BarItem[];
  greScoreDistribution: BarItem[];
  overseas: BarItem[];
  entryWorkYears: BarItem[];
  whyInseadTop3: CountItem[];
};

const SUMMARY_TITLES: { key: keyof ProfileSummary; title: string }[] = [
  { key: "industry", title: "出身業界" },
  { key: "entryWorkYears", title: "入学時社会人歴（何年目）" },
  { key: "overseas", title: "海外経験（年数）" },
  { key: "whyInseadTop3", title: "Why INSEAD? 判断軸カテゴリー Top 3（選択回数）" },
  { key: "campus", title: "スターティングキャンパス (Fonty / Singy)" },
  { key: "sponsorship", title: "社費・私費" },
  { key: "gmatScoreDistribution", title: "GMATスコア分布（受験者のみ）" },
  { key: "greScoreDistribution", title: "GREスコア分布（受験者のみ）" },
];

function toHalfWidth(value: string): string {
  return value
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/，/g, ",")
    .replace(/．/g, ".")
    .replace(/～/g, "~")
    .replace(/−/g, "-")
    .replace(/　/g, " ");
}

function normalizeText(value: string): string {
  return toHalfWidth(value).trim();
}

function normalizeForMatch(value: string): string {
  return normalizeText(value).replace(/\s+/g, "").toLowerCase();
}

function getByHeaderMatch(row: CsvRow, keywords: string[]): string {
  const entries = Object.entries(row);
  for (const [header, rawValue] of entries) {
    const normalizedHeader = normalizeForMatch(header);
    const hit = keywords.some((keyword) => normalizedHeader.includes(normalizeForMatch(keyword)));
    if (hit) {
      return normalizeText(rawValue ?? "");
    }
  }
  return "";
}

function parseNumber(value: string): number | null {
  const normalized = normalizeText(value);
  const match = normalized.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseGradYear(value: string): number | null {
  const parsed = parseNumber(value);
  if (parsed === null) return null;
  if (parsed < 100) return 2000 + parsed;
  return Math.round(parsed);
}

function monthCodeFromText(monthRaw: string): "J" | "D" | null {
  const normalized = normalizeForMatch(monthRaw);
  if (!normalized) return null;
  if (normalized.includes("july") || normalized === "j" || normalized.includes("7")) return "J";
  if (normalized.includes("dec") || normalized === "d" || normalized.includes("12")) return "D";
  return null;
}

function getClassMeta(gradYear: number | null, gradMonth: string) {
  const code = monthCodeFromText(gradMonth);
  if (!gradYear || !code) return { key: null, label: null };
  const yy = String(gradYear).slice(-2);
  const monthLabel = code === "J" ? "July" : "December";
  return {
    key: `${yy}${code}`,
    label: `${yy}${code}(${gradYear}年${monthLabel}卒業)`,
  };
}

function parseStudentProfiles(csvText: string): StudentProfile[] {
  const parsed = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data.map((row) => {
    const gradYear = parseGradYear(getByHeaderMatch(row, ["INSEAD卒業年度", "gradyear"]));
    const gradMonth = getByHeaderMatch(row, ["INSEAD卒業月", "gradmonth"]);
    const classMeta = getClassMeta(gradYear, gradMonth);

    return {
      gradYear,
      gradMonth,
      classKey: classMeta.key,
      classDisplayLabel: classMeta.label,
      industry: getByHeaderMatch(row, ["キャリアバックグラウンド大分類", "industry"]),
      sponsor: getByHeaderMatch(row, ["社費or私費", "sponsor"]),
      campus: getByHeaderMatch(row, ["Home Campus", "campus"]),
      aptitudeTest: getByHeaderMatch(row, ["能力試験", "aptitude", "gmat", "gre"]),
      aptitudeScore: parseNumber(getByHeaderMatch(row, ["能力試験スコア", "aptitudescore"])),
      overseasExperience: getByHeaderMatch(row, ["海外経験", "overseas"]),
      yearsOfExperienceAtEntry: parseNumber(
        getByHeaderMatch(row, ["入学時社会人歴", "社会人歴", "yearsofexperience"]),
      ),
      whyInseadCategoriesRaw: getByHeaderMatch(
        row,
        ["Why INSEAD? 判断軸カテゴリー", "Why INSEAD？ 判断軸カテゴリー", "判断軸カテゴリー"],
      ),
    };
  });
}

function incrementCount(counter: Map<string, number>, key: string) {
  counter.set(key, (counter.get(key) ?? 0) + 1);
}

function toPercentItems(counter: Map<string, number>, total: number): BarItem[] {
  if (total <= 0) return [];
  const entries = Array.from(counter.entries());
  const drafts = entries.map(([label, count], index) => {
    const raw = (count / total) * 100;
    const floored = Math.floor(raw);
    return {
      label,
      count,
      index,
      raw,
      floored,
      fraction: raw - floored,
    };
  });

  const floorSum = drafts.reduce((sum, item) => sum + item.floored, 0);
  let remainder = 100 - floorSum;
  if (remainder > 0) {
    const sortedByFraction = [...drafts].sort((a, b) => {
      if (b.fraction !== a.fraction) return b.fraction - a.fraction;
      if (b.count !== a.count) return b.count - a.count;
      return a.index - b.index;
    });
    for (let i = 0; i < sortedByFraction.length && remainder > 0; i += 1) {
      sortedByFraction[i].floored += 1;
      remainder -= 1;
    }
  }

  return drafts.map(({ label, floored }) => ({
    label,
    value: floored,
  }));
}

function sortByValueDesc(items: BarItem[]): BarItem[] {
  return [...items].sort((a, b) => b.value - a.value);
}

function normalizeIndustryLabel(industry: string): string {
  const value = industry || "未回答";
  if (!value.trim()) return "未回答";
  return value;
}

function classifySponsor(sponsor: string): "社費" | "私費" | "その他" {
  const normalized = normalizeForMatch(sponsor);
  if (normalized.includes("社費")) return "社費";
  if (normalized.includes("私費")) return "私費";
  return "その他";
}

function classifyCampus(campus: string): "Fonty" | "Singy" | "その他" {
  const normalized = normalizeForMatch(campus);
  if (!normalized) return "その他";
  if (normalized.includes("sing")) return "Singy";
  if (normalized.includes("font") || normalized.includes("bleau")) return "Fonty";
  return "その他";
}

function isGmatTaker(test: string): boolean {
  return normalizeForMatch(test).includes("gmat");
}

function isGreTaker(test: string): boolean {
  return normalizeForMatch(test).includes("gre");
}

function classifyGmatBucket(score: number | null): "705~" | "685~705" | "665~685" | "645~665" | "~645" | null {
  if (score === null) return null;
  if (score >= 705) return "705~";
  if (score >= 685) return "685~705";
  if (score >= 665) return "665~685";
  if (score >= 645) return "645~665";
  return "~645";
}

function classifyGreBucket(score: number | null): "330~" | "325~330" | "320~325" | "315~320" | "~315" | null {
  if (score === null) return null;
  if (score >= 330) return "330~";
  if (score >= 325) return "325~330";
  if (score >= 320) return "320~325";
  if (score >= 315) return "315~320";
  return "~315";
}

function classifyOverseasYears(value: string): "なし" | "1-3年" | "3-5年" | "5年以上" {
  const normalized = normalizeText(value);
  if (!normalized) return "なし";
  if (normalized.includes("なし")) return "なし";

  const halfWidth = toHalfWidth(normalized);
  if (halfWidth.includes("5年以上")) return "5年以上";
  if (halfWidth.includes("2年~5年未満") || halfWidth.includes("2年〜5年未満")) return "3-5年";
  if (halfWidth.includes("2年未満")) return "1-3年";

  const nums = (halfWidth.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  if (nums.length >= 2) {
    const max = nums[1];
    if (max <= 3) return "1-3年";
    if (max <= 5) return "3-5年";
    return "5年以上";
  }
  if (nums.length === 1) {
    const only = nums[0];
    if (only <= 0) return "なし";
    if (only <= 3) return "1-3年";
    if (only <= 5) return "3-5年";
    return "5年以上";
  }

  return "なし";
}

function classifyEntryWorkYears(year: number | null): "1-3年目" | "4-6年目" | "7-9年目" | "10年以上" | "未回答" {
  if (year === null || Number.isNaN(year)) return "未回答";
  if (year <= 3) return "1-3年目";
  if (year <= 6) return "4-6年目";
  if (year <= 9) return "7-9年目";
  return "10年以上";
}

function parseWhyInseadCategories(raw: string): string[] {
  const normalized = normalizeText(raw);
  if (!normalized) return [];
  return normalized
    .split(/[,、，]/)
    .map((part) => normalizeText(part))
    .filter((part) => part.length > 0 && part !== "* none");
}

function buildSummary(profiles: StudentProfile[]): ProfileSummary {
  const total = profiles.length;
  if (total === 0) {
    return {
      industry: [],
      sponsorship: [],
      campus: [],
      gmatScoreDistribution: [],
      greScoreDistribution: [],
      overseas: [],
      entryWorkYears: [],
      whyInseadTop3: [],
    };
  }

  const industryCounter = new Map<string, number>();
  const sponsorCounter = new Map<string, number>([
    ["社費", 0],
    ["私費", 0],
    ["その他", 0],
  ]);
  const campusCounter = new Map<string, number>([
    ["Fonty", 0],
    ["Singy", 0],
    ["その他", 0],
  ]);
  const gmatCounter = new Map<string, number>([
    ["705~", 0],
    ["685~705", 0],
    ["665~685", 0],
    ["645~665", 0],
    ["~645", 0],
  ]);
  const greCounter = new Map<string, number>([
    ["330~", 0],
    ["325~330", 0],
    ["320~325", 0],
    ["315~320", 0],
    ["~315", 0],
  ]);
  const overseasCounter = new Map<string, number>([
    ["なし", 0],
    ["1-3年", 0],
    ["3-5年", 0],
    ["5年以上", 0],
  ]);
  const entryWorkYearsCounter = new Map<string, number>([
    ["1-3年目", 0],
    ["4-6年目", 0],
    ["7-9年目", 0],
    ["10年以上", 0],
    ["未回答", 0],
  ]);
  const whyCounter = new Map<string, number>();
  let gmatTakerCount = 0;
  let greTakerCount = 0;

  for (const profile of profiles) {
    incrementCount(industryCounter, normalizeIndustryLabel(profile.industry));
    incrementCount(sponsorCounter, classifySponsor(profile.sponsor));
    incrementCount(campusCounter, classifyCampus(profile.campus));
    if (isGmatTaker(profile.aptitudeTest)) {
      gmatTakerCount += 1;
      const bucket = classifyGmatBucket(profile.aptitudeScore);
      if (bucket) incrementCount(gmatCounter, bucket);
    }
    if (isGreTaker(profile.aptitudeTest)) {
      greTakerCount += 1;
      const bucket = classifyGreBucket(profile.aptitudeScore);
      if (bucket) incrementCount(greCounter, bucket);
    }
    incrementCount(overseasCounter, classifyOverseasYears(profile.overseasExperience));
    incrementCount(entryWorkYearsCounter, classifyEntryWorkYears(profile.yearsOfExperienceAtEntry));
    parseWhyInseadCategories(profile.whyInseadCategoriesRaw).forEach((category) => {
      incrementCount(whyCounter, category);
    });
  }

  const industry = sortByValueDesc(toPercentItems(industryCounter, total));

  const sponsorship = toPercentItems(sponsorCounter, total).filter((item) => item.value > 0);
  const campus = toPercentItems(campusCounter, total).filter((item) => item.value > 0);
  const gmatScoreDistribution = toPercentItems(gmatCounter, gmatTakerCount).filter(
    (item) => item.value > 0,
  );
  const greScoreDistribution = toPercentItems(greCounter, greTakerCount).filter(
    (item) => item.value > 0,
  );
  const overseas = toPercentItems(overseasCounter, total).filter((item) => item.value > 0);
  const entryWorkYears = toPercentItems(entryWorkYearsCounter, total).filter((item) => item.value > 0);
  const whyInseadTop3 = Array.from(whyCounter.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    industry,
    sponsorship,
    campus,
    gmatScoreDistribution,
    greScoreDistribution,
    overseas,
    entryWorkYears,
    whyInseadTop3,
  };
}

function buildClassTabs(profiles: StudentProfile[]): ClassTab[] {
  const unique = new Map<string, ClassTab>();
  for (const profile of profiles) {
    if (!profile.classKey || !profile.gradYear) continue;
    const code = monthCodeFromText(profile.gradMonth);
    if (!code) continue;
    unique.set(profile.classKey, {
      key: profile.classKey,
      displayLabel: profile.classDisplayLabel ?? profile.classKey,
      year: profile.gradYear,
      monthCode: code,
    });
  }
  return Array.from(unique.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    const orderA = a.monthCode === "J" ? 0 : 1;
    const orderB = b.monthCode === "J" ? 0 : 1;
    return orderA - orderB;
  });
}

function HorizontalBarChart({ items }: { items: BarItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs text-slate-600 sm:w-32">
            {item.label}
          </span>
          <div className="min-w-0 flex-1">
            <div className="h-6 w-full overflow-hidden rounded-md bg-gray-100">
              <div
                className="h-full rounded-sm bg-[#006633] transition-[width] duration-500 ease-out"
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

function HorizontalCountBarChart({ items }: { items: CountItem[] }) {
  const maxCount = items.reduce((max, item) => Math.max(max, item.count), 0);
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const width = maxCount > 0 ? Math.max(6, Math.round((item.count / maxCount) * 100)) : 0;
        return (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-xs text-slate-600 sm:w-36">{item.label}</span>
            <div className="min-w-0 flex-1">
              <div className="h-6 w-full overflow-hidden rounded-md bg-gray-100">
                <div
                  className="h-full rounded-sm bg-[#006633] transition-[width] duration-500 ease-out"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
            <span className="w-12 shrink-0 text-right text-xs font-medium text-slate-700">
              {item.count}件
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ClassProfileDashboard() {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [selectedClass, setSelectedClass] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadCsv() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(CSV_URL, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`CSVの取得に失敗しました (${response.status})`);
        }
        const csvText = await response.text();
        const parsedProfiles = parseStudentProfiles(csvText);
        setProfiles(parsedProfiles);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "データ取得中にエラーが発生しました。");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    loadCsv();
    return () => controller.abort();
  }, [reloadKey]);

  const classTabs = useMemo(() => buildClassTabs(profiles), [profiles]);

  useEffect(() => {
    if (selectedClass === "All") return;
    const exists = classTabs.some((tab) => tab.key === selectedClass);
    if (!exists) setSelectedClass("All");
  }, [classTabs, selectedClass]);

  const filteredProfiles = useMemo(() => {
    if (selectedClass === "All") return profiles;
    return profiles.filter((profile) => profile.classKey === selectedClass);
  }, [profiles, selectedClass]);

  const summary = useMemo(() => buildSummary(filteredProfiles), [filteredProfiles]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white shadow-lg">
        <div className="border-b border-neutral-100 px-5 py-5 sm:px-6 sm:py-6">
          <div className="h-9 w-full animate-pulse rounded-lg bg-gray-100 sm:w-96" />
        </div>
        <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2 sm:p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-4 sm:p-5">
              <div className="mb-4 h-4 w-40 animate-pulse rounded bg-gray-100" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((__, j) => (
                  <div key={j} className="h-6 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6 text-center shadow-lg">
        <p className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => setReloadKey((prev) => prev + 1)}
          className="mt-4 inline-flex items-center rounded-md bg-[#005543] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#004435]"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-lg">
      <div className="flex flex-col gap-4 border-b border-neutral-100 px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-4">
        <div
          className="flex flex-wrap gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1"
          role="tablist"
          aria-label="クラスでフィルター"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedClass === "All"}
            onClick={() => setSelectedClass("All")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/40 ${
              selectedClass === "All"
                ? "bg-[#005543] text-white shadow-sm"
                : "text-slate-600 hover:bg-neutral-200/80 hover:text-slate-900"
            }`}
          >
            All
          </button>
          {classTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={selectedClass === tab.key}
              onClick={() => setSelectedClass(tab.key)}
              title={tab.displayLabel}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/40 ${
                selectedClass === tab.key
                  ? "bg-[#005543] text-white shadow-sm"
                  : "text-slate-600 hover:bg-neutral-200/80 hover:text-slate-900"
              }`}
            >
              {tab.displayLabel}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          対象: {selectedClass === "All" ? "全クラス" : classTabs.find((tab) => tab.key === selectedClass)?.displayLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2 sm:gap-8 sm:p-6">
        {SUMMARY_TITLES.map(({ key, title }) => (
          <div
            key={key}
            className="flex min-h-0 flex-col rounded-lg border border-neutral-100 bg-neutral-50/50 p-4 sm:p-5"
          >
            <h3 className="mb-4 shrink-0 text-xs font-semibold uppercase tracking-wider text-[#005543]">
              {title}
            </h3>
            <div className="min-h-0 flex-1">
              {summary[key].length > 0 ? (
                key === "whyInseadTop3" ? (
                  <HorizontalCountBarChart items={summary[key]} />
                ) : (
                  <HorizontalBarChart items={summary[key]} />
                )
              ) : (
                <p className="text-xs text-slate-500">表示できるデータがありません。</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 px-5 pb-5 text-center text-[11px] text-slate-500 sm:px-6 sm:pb-6">
        Googleスプレッドシートの回答データを集計して表示しています。
      </p>
    </div>
  );
}
