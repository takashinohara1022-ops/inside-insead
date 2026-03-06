"use client";

import { useMemo, useState } from "react";
import type { SheetRow } from "../../lib/googleData";

type BarItem = { label: string; value: number };
type CountItem = { label: string; count: number };
type ClassTab = {
  key: string;
  shortLabel: string;
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
  englishTest: string;
  englishTestScore: number | null;
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
  toeflScoreDistribution: BarItem[];
  ieltsScoreDistribution: BarItem[];
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
  { key: "gmatScoreDistribution", title: "GMAT Focusスコア分布" },
  { key: "greScoreDistribution", title: "GREスコア分布" },
  { key: "toeflScoreDistribution", title: "TOEFLスコア分布" },
  { key: "ieltsScoreDistribution", title: "IELTSスコア分布" },
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

function getByHeaderMatch(row: SheetRow, keywords: string[]): string {
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

function parseStudentProfiles(rows: SheetRow[]): StudentProfile[] {
  return rows.map((row) => {
    const gradYear = parseGradYear(
      getByHeaderMatch(row, ["INSEAD卒業年度", "INSEAD卒業年", "gradyear"]),
    );
    const gradMonth = getByHeaderMatch(row, ["INSEAD卒業月", "gradmonth"]);
    const classMeta = getClassMeta(gradYear, gradMonth);

    return {
      gradYear,
      gradMonth,
      classKey: classMeta.key,
      classDisplayLabel: classMeta.label,
      industry: getByHeaderMatch(row, [
        "キャリアバックグラウンド大分類",
        "出身業界(大分類)",
        "industry",
      ]),
      sponsor: getByHeaderMatch(row, ["社費or私費", "sponsor"]),
      campus: getByHeaderMatch(row, ["Home Campus", "ホームキャンパス", "campus"]),
      aptitudeTest: getByHeaderMatch(row, ["能力試験", "aptitude", "gmat", "gre"]),
      aptitudeScore: parseNumber(getByHeaderMatch(row, ["能力試験スコア", "aptitudescore"])),
      englishTest: getByHeaderMatch(row, ["英語試験", "englishtest", "toefl", "ielts"]),
      englishTestScore:
        parseNumber(getByHeaderMatch(row, ["英語試験スコア", "englishtestscore"])) ??
        parseNumber(getByHeaderMatch(row, ["英語試験"])),
      overseasExperience: getByHeaderMatch(row, [
        "海外経験(数か月以上の滞在)",
        "海外経験(半年以上の滞在)",
        "海外経験",
        "overseas",
      ]),
      yearsOfExperienceAtEntry: parseNumber(
        getByHeaderMatch(row, ["入学時社会人歴", "社会人歴", "社会人何年目", "yearsofexperience"]),
      ),
      whyInseadCategoriesRaw: getByHeaderMatch(
        row,
        [
          "Why INSEAD? 判断軸カテゴリー",
          "Why INSEAD？ 判断軸カテゴリー",
          "Why INSEAD? 判断軸",
          "判断軸カテゴリー",
        ],
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

function sortIndustryItems(items: BarItem[]): BarItem[] {
  const isOther = (label: string) => {
    const normalized = normalizeForMatch(label);
    return normalized === "その他" || normalized === "other";
  };
  const regular = items.filter((item) => !isOther(item.label));
  const other = items.filter((item) => isOther(item.label));
  return [...sortByValueDesc(regular), ...other];
}

function sortByLabelOrder(items: BarItem[], order: string[]): BarItem[] {
  const rank = new Map(order.map((label, index) => [label, index]));
  return [...items].sort((a, b) => {
    const ra = rank.get(a.label) ?? Number.MAX_SAFE_INTEGER;
    const rb = rank.get(b.label) ?? Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    return b.value - a.value;
  });
}

function normalizeIndustryLabel(industry: string): string {
  const value = industry || "未回答";
  if (!value.trim()) return "未回答";
  const key = normalizeForMatch(value);
  if (key.includes("consult") || key.includes("コンサル")) return "コンサル";
  if (key.includes("金融")) return "金融";
  if (key.includes("商社")) return "商社";
  if (key.includes("メーカー")) return "メーカー";
  if (key.includes("tech") || key.includes("テック")) return "テック";
  if (key.includes("そのほか") || key.includes("その他")) return "その他";
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
  const normalized = normalizeForMatch(test);
  return normalized.includes("gmatfocus") || (normalized.includes("gmat") && normalized.includes("focus"));
}

function isGreTaker(test: string): boolean {
  return normalizeForMatch(test).includes("gre");
}

function isToeflTaker(test: string): boolean {
  return normalizeForMatch(test).includes("toefl");
}

function isIeltsTaker(test: string): boolean {
  return normalizeForMatch(test).includes("ielts");
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

function classifyToeflBucket(
  score: number | null,
): "115~120" | "110~115" | "105~110" | "100~105" | "100未満" | null {
  if (score === null) return null;
  if (score >= 115) return "115~120";
  if (score >= 110) return "110~115";
  if (score >= 105) return "105~110";
  if (score >= 100) return "100~105";
  return "100未満";
}

function classifyIeltsBucket(
  score: number | null,
): "8.0~9.0" | "7.5~7.9" | "7.0~7.4" | "6.5~6.9" | "6.5未満" | null {
  if (score === null) return null;
  if (score >= 8.0) return "8.0~9.0";
  if (score >= 7.5) return "7.5~7.9";
  if (score >= 7.0) return "7.0~7.4";
  if (score >= 6.5) return "6.5~6.9";
  return "6.5未満";
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

function normalizeWhyAxisLabel(value: string): string {
  const normalized = normalizeText(value);
  if (!normalized) return "";
  const key = normalizeForMatch(normalized);
  if (key.includes("費用") || key.includes("roi")) return "費用/ROI";
  if (key.includes("キャリア") || key.includes("就職")) return "キャリア/就職実績";
  if (key.includes("ブランド") || key.includes("ranking")) return "ブランド";
  if (key.includes("カルチャー") || key.includes("diversity") || key.includes("多様")) {
    return "カルチャー/Diversity";
  }
  if (key.includes("network") || key.includes("ネットワーク") || key.includes("alumni")) {
    return "Alumni/ネットワーク";
  }
  if (key.includes("教授") || key.includes("授業") || key.includes("academic")) return "教授・授業";
  if (key.includes("プログラム") || key.includes("交換留学") || key.includes("1年制")) {
    return "プログラム(交換留学,1年制等)";
  }
  if (key.includes("その他")) return "その他";
  return normalized;
}

function parseWhyInseadCategories(raw: string): string[] {
  const normalized = normalizeText(raw);
  if (!normalized) return [];
  return normalized
    .split(/[,、，]/)
    .map((part) => normalizeWhyAxisLabel(part))
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
      toeflScoreDistribution: [],
      ieltsScoreDistribution: [],
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
  const toeflCounter = new Map<string, number>([
    ["115~120", 0],
    ["110~115", 0],
    ["105~110", 0],
    ["100~105", 0],
    ["100未満", 0],
  ]);
  const ieltsCounter = new Map<string, number>([
    ["8.0~9.0", 0],
    ["7.5~7.9", 0],
    ["7.0~7.4", 0],
    ["6.5~6.9", 0],
    ["6.5未満", 0],
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
  let toeflTakerCount = 0;
  let ieltsTakerCount = 0;

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
    if (isToeflTaker(profile.englishTest)) {
      toeflTakerCount += 1;
      const bucket = classifyToeflBucket(profile.englishTestScore);
      if (bucket) incrementCount(toeflCounter, bucket);
    }
    if (isIeltsTaker(profile.englishTest)) {
      ieltsTakerCount += 1;
      const bucket = classifyIeltsBucket(profile.englishTestScore);
      if (bucket) incrementCount(ieltsCounter, bucket);
    }
    incrementCount(overseasCounter, classifyOverseasYears(profile.overseasExperience));
    incrementCount(entryWorkYearsCounter, classifyEntryWorkYears(profile.yearsOfExperienceAtEntry));
    parseWhyInseadCategories(profile.whyInseadCategoriesRaw).forEach((category) => {
      incrementCount(whyCounter, category);
    });
  }

  const industry = sortIndustryItems(toPercentItems(industryCounter, total));

  const sponsorship = toPercentItems(sponsorCounter, total).filter((item) => item.value > 0);
  const campus = toPercentItems(campusCounter, total).filter((item) => item.value > 0);
  const gmatScoreDistribution = toPercentItems(gmatCounter, gmatTakerCount).filter(
    (item) => item.value > 0,
  );
  const greScoreDistribution = toPercentItems(greCounter, greTakerCount).filter(
    (item) => item.value > 0,
  );
  const toeflScoreDistribution = toPercentItems(toeflCounter, toeflTakerCount).filter(
    (item) => item.value > 0,
  );
  const ieltsScoreDistribution = toPercentItems(ieltsCounter, ieltsTakerCount).filter(
    (item) => item.value > 0,
  );
  const overseas = sortByLabelOrder(
    toPercentItems(overseasCounter, total).filter((item) => item.value > 0),
    ["5年以上", "3-5年", "1-3年", "なし"],
  );
  const entryWorkYears = sortByLabelOrder(
    toPercentItems(entryWorkYearsCounter, total).filter((item) => item.value > 0),
    ["10年以上", "7-9年目", "4-6年目", "1-3年目", "未回答"],
  );
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
    toeflScoreDistribution,
    ieltsScoreDistribution,
    overseas,
    entryWorkYears,
    whyInseadTop3,
  };
}

function buildRespondentCountByChart(profiles: StudentProfile[]): Record<keyof ProfileSummary, number> {
  const baseCount = profiles.length;
  const whyCount = profiles.filter(
    (profile) => parseWhyInseadCategories(profile.whyInseadCategoriesRaw).length > 0,
  ).length;
  const gmatFocusCount = profiles.filter((profile) => isGmatTaker(profile.aptitudeTest)).length;
  const greCount = profiles.filter((profile) => isGreTaker(profile.aptitudeTest)).length;
  const toeflCount = profiles.filter((profile) => isToeflTaker(profile.englishTest)).length;
  const ieltsCount = profiles.filter((profile) => isIeltsTaker(profile.englishTest)).length;

  return {
    industry: baseCount,
    sponsorship: baseCount,
    campus: baseCount,
    overseas: baseCount,
    entryWorkYears: baseCount,
    whyInseadTop3: whyCount,
    gmatScoreDistribution: gmatFocusCount,
    greScoreDistribution: greCount,
    toeflScoreDistribution: toeflCount,
    ieltsScoreDistribution: ieltsCount,
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
      shortLabel: profile.classKey,
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

export function ClassProfileDashboard({ rows }: { rows: SheetRow[] }) {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const profiles = useMemo(() => parseStudentProfiles(rows), [rows]);

  const classTabs = useMemo(() => buildClassTabs(profiles), [profiles]);
  const availableClassKeys = useMemo(() => new Set(classTabs.map((tab) => tab.key)), [classTabs]);
  const activeSelectedClasses = useMemo(
    () => selectedClasses.filter((key) => availableClassKeys.has(key)),
    [selectedClasses, availableClassKeys],
  );

  const filteredProfiles = useMemo(() => {
    if (activeSelectedClasses.length === 0) return profiles;
    return profiles.filter(
      (profile) => profile.classKey != null && activeSelectedClasses.includes(profile.classKey),
    );
  }, [profiles, activeSelectedClasses]);

  const toggleClass = (classKey: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classKey) ? prev.filter((key) => key !== classKey) : [...prev, classKey],
    );
  };

  const summary = useMemo(() => buildSummary(filteredProfiles), [filteredProfiles]);
  const respondentCountByChart = useMemo(
    () => buildRespondentCountByChart(filteredProfiles),
    [filteredProfiles],
  );

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-lg">
        <p className="text-sm text-slate-600">プロフィールデータがまだありません。</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-lg">
      <div className="flex flex-col gap-4 border-b border-neutral-100 px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-4">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="クラスでフィルター"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeSelectedClasses.length === 0}
            onClick={() => setSelectedClasses([])}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/40 ${
              activeSelectedClasses.length === 0
                ? "bg-emerald-800 text-white"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            #ALL
          </button>
          {classTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeSelectedClasses.includes(tab.key)}
              onClick={() => toggleClass(tab.key)}
              title={tab.displayLabel}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/40 ${
                activeSelectedClasses.includes(tab.key)
                  ? "bg-emerald-800 text-white"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              #{tab.shortLabel}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          対象:{" "}
          {activeSelectedClasses.length === 0
            ? "全クラス"
            : classTabs
                .filter((tab) => activeSelectedClasses.includes(tab.key))
                .map((tab) => tab.displayLabel)
                .join(" / ")}
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
            <p className="mb-3 shrink-0 text-[11px] text-slate-500">
              回答者数：{respondentCountByChart[key]}人
            </p>
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
