"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { SheetRow } from "../../../../lib/googleData";

// ===== 型定義 =====

type AdmissionReport = {
  id: string;
  authorId: string;
  classLabel: string;
  classRank: number;
  yearsAtEntry: string;
  industryMajor: string;
  sponsor: string;
  overseasExperience: string;
  englishTest: string;
  aptitudeTest: string;
  hasProfile: boolean;
  profileHref: string;
  sections: AdmissionSection[];
};

type AdmissionSection = {
  id: string;
  title: string;
  items: AdmissionItem[];
};

type AdmissionItem = {
  label: string;
  value: string;
};

// ===== カテゴリー構造の定義 =====

const ADMISSION_SECTIONS: Array<{
  id: string;
  title: string;
  items: Array<{ label: string; columnKeywords: string[] }>;
}> = [
  {
    id: "profile",
    title: "1. 受験者プロフィール",
    items: [
      { label: "学歴・職歴", columnKeywords: ["学歴", "職歴"] },
      { label: "GPA", columnKeywords: ["GPA"] },
    ],
  },
  {
    id: "motivation",
    title: "2. 受験動機",
    items: [
      { label: "Why MBA", columnKeywords: ["Why MBA", "WhyMBA"] },
      { label: "キャリアビジョン", columnKeywords: ["キャリアビジョン"] },
    ],
  },
  {
    id: "preparation",
    title: "3. 受験準備",
    items: [
      { label: "情報収集の仕方", columnKeywords: ["情報収集"] },
      { label: "全体スケジュール", columnKeywords: ["全体スケジュール"] },
    ],
  },
  {
    id: "english-test",
    title: "4. 英語試験",
    items: [
      { label: "選定理由", columnKeywords: ["英語能力試験 選定理由", "英語試験 選定理由"] },
      { label: "実績", columnKeywords: ["英語能力試験 実績", "英語試験 実績"] },
      { label: "学習方法", columnKeywords: ["英語能力試験 学習方法", "英語試験 学習方法"] },
      { label: "アドバイス", columnKeywords: ["英語能力試験 アドバイス", "英語試験 アドバイス"] },
    ],
  },
  {
    id: "aptitude-test",
    title: "5. 能力試験",
    items: [
      { label: "選定理由", columnKeywords: ["能力試験 選定理由"] },
      { label: "実績", columnKeywords: ["能力試験 実績"] },
      { label: "学習方法", columnKeywords: ["能力試験 学習方法"] },
      { label: "アドバイス", columnKeywords: ["能力試験 アドバイス"] },
    ],
  },
  {
    id: "essay",
    title: "6. Essay",
    items: [
      { label: "サービス利用方法", columnKeywords: ["Essay サービス利用方法"] },
      { label: "作成プロセス", columnKeywords: ["Essay 作成プロセス"] },
      { label: "キャリアビジョンの論理性", columnKeywords: ["Essay キャリアビジョンの論理性"] },
      { label: "INSEAD Fitの論理性", columnKeywords: ["Essay INSEAD Fit"] },
    ],
  },
  {
    id: "other-selection",
    title: "7. その他選考対策",
    items: [
      { label: "推薦状の作成プロセス", columnKeywords: ["推薦状"] },
      { label: "Video Essay対策方法", columnKeywords: ["Video Essay"] },
      { label: "Interview対策方法", columnKeywords: ["Interview対策"] },
      { label: "Interview実録", columnKeywords: ["Interview実録"] },
    ],
  },
  {
    id: "cost-advice",
    title: "8. 費用とアドバイス",
    items: [
      { label: "受験費用総額", columnKeywords: ["受験費用"] },
      { label: "その他アドバイス", columnKeywords: ["その他", "アドバイスがあれば"] },
    ],
  },
];

// ===== ユーティリティ関数（StudentsProfilesDirectory.tsx から踏襲） =====

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

function normalizeJoinKey(value: string): string {
  return normalizeForMatch(value).replace(/[._\-・/]/g, "");
}

function getByHeaderMatch(row: SheetRow, keywords: string[]): string {
  const entries = Object.entries(row);
  for (const [header, rawValue] of entries) {
    const normalizedHeader = normalizeForMatch(header);
    const hit = keywords.some((keyword) =>
      normalizedHeader.includes(normalizeForMatch(keyword))
    );
    if (hit) return normalizeText(rawValue ?? "");
  }
  return "";
}

function getByColumnIndex(row: SheetRow, oneBasedIndex: number): string {
  return normalizeText(Object.values(row)[oneBasedIndex - 1] ?? "");
}

function parseClassLabel(yearRaw: string, monthRaw: string): string {
  const year = normalizeText(yearRaw);
  const month = normalizeForMatch(monthRaw);
  const yearNum = year.match(/\d{2,4}/)?.[0];
  if (!yearNum) return "";
  const fourDigitYear = yearNum.length === 2 ? `20${yearNum}` : yearNum;
  const yy = fourDigitYear.slice(-2);
  if (month.includes("july") || month === "j" || month.includes("7"))
    return `${yy}J`;
  if (month.includes("dec") || month === "d" || month.includes("12"))
    return `${yy}D`;
  return yy;
}

function getClassRank(classLabel: string): number {
  const normalized = normalizeText(classLabel).toUpperCase();
  const match = normalized.match(/^(\d{2})([JD])$/);
  if (!match) return -1;
  const year = Number(match[1]);
  const monthWeight = match[2] === "D" ? 2 : 1;
  return year * 10 + monthWeight;
}

function toStudentProfileId(
  uniqueDisplayName: string,
  fallback: string
): string {
  const source =
    normalizeText(uniqueDisplayName) || normalizeText(fallback) || "student";
  return source
    .toLowerCase()
    .replace(/[^\w\u3040-\u30ff\u3400-\u9fff-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ===== 結合ロジック =====

function buildAdmissionReports(
  reportRows: SheetRow[],
  profileRows: SheetRow[]
): AdmissionReport[] {
  const profileMap = new Map<string, SheetRow>();
  profileRows.forEach((row) => {
    const authorId = getByColumnIndex(row, 22); // V列
    const key = normalizeJoinKey(authorId);
    if (key && !profileMap.has(key)) {
      profileMap.set(key, row);
    }
  });

  return reportRows
    .map((row, index) => {
      const authorId =
        getByHeaderMatch(row, ["投稿者"]) || getByColumnIndex(row, 2);
      if (!authorId) return null;

      const profile = profileMap.get(normalizeJoinKey(authorId));

      const classLabel = profile
        ? parseClassLabel(
            getByHeaderMatch(profile, ["INSEAD卒業年度", "INSEAD卒業年"]),
            getByHeaderMatch(profile, ["INSEAD卒業月"])
          )
        : "";

      const profileId = profile
        ? toStudentProfileId(authorId, `report-${index}`)
        : "";

      const sections = ADMISSION_SECTIONS.map((sectionDef) => ({
        id: sectionDef.id,
        title: sectionDef.title,
        items: sectionDef.items
          .map((itemDef) => ({
            label: itemDef.label,
            value: getByHeaderMatch(row, itemDef.columnKeywords),
          }))
          .filter((item) => item.value && item.value !== "-"),
      })).filter((section) => section.items.length > 0);

      return {
        id:
          getByHeaderMatch(row, ["タイムスタンプ"]) || `report-${index}`,
        authorId,
        classLabel,
        classRank: getClassRank(classLabel),
        yearsAtEntry: profile
          ? getByHeaderMatch(profile, [
              "入学時社会人歴",
              "社会人歴",
              "社会人何年目",
            ])
          : "-",
        industryMajor: profile
          ? getByHeaderMatch(profile, [
              "キャリアバックグラウンド大分類",
              "出身業界(大分類)",
            ])
          : "-",
        sponsor: profile
          ? getByHeaderMatch(profile, ["社費or私費"])
          : "-",
        overseasExperience: profile
          ? getByHeaderMatch(profile, ["海外経験"])
          : "-",
        englishTest: profile
          ? getByHeaderMatch(profile, ["英語試験"])
          : "-",
        aptitudeTest: profile
          ? getByHeaderMatch(profile, ["能力試験"])
          : "-",
        hasProfile: Boolean(profile),
        profileHref: profileId
          ? `/students/profiles?student=${encodeURIComponent(profileId)}`
          : "",
        sections,
      };
    })
    .filter((r): r is AdmissionReport => r !== null);
}

// ===== サブコンポーネント =====

const COLLAPSE_THRESHOLD = 150;

function CollapsibleText({ value }: { value: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const needsCollapse = value.length > COLLAPSE_THRESHOLD;

  return (
    <div className="mt-1 w-full min-w-0">
      <p className="w-full whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
        {needsCollapse && !isOpen
          ? `${value.slice(0, COLLAPSE_THRESHOLD)}…`
          : value}
      </p>
      {needsCollapse && (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="mt-1 text-xs font-medium text-[#005543] hover:underline"
        >
          {isOpen ? "折りたたむ" : "続きを読む"}
        </button>
      )}
    </div>
  );
}

function ReportAccordion({ report }: { report: AdmissionReport }) {
  return (
    <div className="space-y-5">
      {/* プロフィールリンクボタン */}
      {report.hasProfile && (
        <Link
          href={report.profileHref}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#005543] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#004435] hover:shadow-lg"
        >
          この投稿者のプロフィールを見る
        </Link>
      )}

      {/* カテゴリー別本文 */}
      {report.sections.map((section) => (
        <div key={section.id}>
          <h4 className="sticky top-[64px] z-10 border-b border-neutral-200 bg-stone-50 py-2 text-sm font-semibold text-slate-800">
            {section.title}
          </h4>
          <div className="mt-3 w-full space-y-4">
            {section.items.map((item) => (
              <div key={item.label} className="w-full">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {item.label}
                </p>
                <CollapsibleText value={item.value} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {report.sections.length === 0 && (
        <p className="text-sm text-slate-500">
          この投稿者の体験記本文はまだありません。
        </p>
      )}
    </div>
  );
}

// ===== テーブル表示コンポーネント =====

function ReportRow({
  report,
  isExpanded,
  onToggle,
}: {
  report: AdmissionReport;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      {/* メイン行 — 開閉によらず常に同じ見た目 */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-2 border-b border-neutral-100 px-4 py-3 transition hover:bg-neutral-50 md:grid-cols-[1fr_120px_40px]"
      >
        <span className="text-sm font-medium text-slate-900">
          {report.authorId}
        </span>
        <span className="hidden text-sm text-slate-700 md:block">
          {report.sponsor || "-"}
        </span>
        <span className="flex items-center justify-end gap-2">
          <span className="text-xs text-slate-500 md:hidden">
            {report.sponsor && report.sponsor !== "-" ? report.sponsor : ""}
          </span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </span>
      </div>

      {/* 展開部分 — 開いているときだけ表示。メイン行には一切影響しない */}
      {isExpanded && (
        <div
          className="border-b border-neutral-200 bg-neutral-50 px-4 py-5"
          style={{ width: "100%", boxSizing: "border-box" }}
        >
          <ReportAccordion report={report} />
        </div>
      )}
    </div>
  );
}

// ===== ヘルパー関数 =====

function parseYearsAtEntry(value: string): number | null {
  if (!value || value === "-") return null;
  const match = value.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function extractUniqueValues(
  reports: AdmissionReport[],
  key: "sponsor" | "englishTest" | "aptitudeTest"
): string[] {
  const set = new Set<string>();
  reports.forEach((r) => {
    const value = r[key];
    if (value && value !== "-") set.add(value);
  });
  return Array.from(set).sort();
}

function extractClassLabels(reports: AdmissionReport[]): string[] {
  const set = new Set<string>();
  reports.forEach((r) => {
    if (r.classLabel) set.add(r.classLabel);
  });
  return Array.from(set).sort(
    (a, b) => getClassRank(b) - getClassRank(a)
  );
}

// ===== フィルターコンポーネント =====

function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  if (options.length === 0) return null;
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };
  return (
    <div>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              selected.includes(opt)
                ? "bg-emerald-800 text-white"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterPanel({
  reports,
  selectedClassLabels,
  onChangeClassLabels,
  selectedSponsors,
  onChangeSponsors,
  selectedEnglishTests,
  onChangeEnglishTests,
  selectedAptitudeTests,
  onChangeAptitudeTests,
  sortOrder,
  onChangeSortOrder,
}: {
  reports: AdmissionReport[];
  selectedClassLabels: string[];
  onChangeClassLabels: (v: string[]) => void;
  selectedSponsors: string[];
  onChangeSponsors: (v: string[]) => void;
  selectedEnglishTests: string[];
  onChangeEnglishTests: (v: string[]) => void;
  selectedAptitudeTests: string[];
  onChangeAptitudeTests: (v: string[]) => void;
  sortOrder: "newest" | "oldest";
  onChangeSortOrder: (v: "newest" | "oldest") => void;
}) {
  const classLabels = useMemo(() => extractClassLabels(reports), [reports]);
  const sponsors = useMemo(
    () => extractUniqueValues(reports, "sponsor"),
    [reports]
  );
  const englishTests = useMemo(
    () => extractUniqueValues(reports, "englishTest"),
    [reports]
  );
  const aptitudeTests = useMemo(
    () => extractUniqueValues(reports, "aptitudeTest"),
    [reports]
  );

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
      <CheckboxGroup
        label="卒業年月"
        options={classLabels}
        selected={selectedClassLabels}
        onChange={onChangeClassLabels}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CheckboxGroup
          label="社費/私費"
          options={sponsors}
          selected={selectedSponsors}
          onChange={onChangeSponsors}
        />
        <CheckboxGroup
          label="英語試験"
          options={englishTests}
          selected={selectedEnglishTests}
          onChange={onChangeEnglishTests}
        />
        <CheckboxGroup
          label="能力試験"
          options={aptitudeTests}
          selected={selectedAptitudeTests}
          onChange={onChangeAptitudeTests}
        />
      </div>

      {/* 並び順 */}
      <div>
        <p className="text-sm font-semibold text-slate-800">並び順</p>
        <select
          value={sortOrder}
          onChange={(e) =>
            onChangeSortOrder(e.target.value as "newest" | "oldest")
          }
          className="mt-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          <option value="newest">卒業年月の新しい順</option>
          <option value="oldest">卒業年月の古い順</option>
        </select>
      </div>
    </div>
  );
}

// ===== メインコンポーネント =====

export function AdmissionReportsBoard({
  reportRows,
  profileRows,
}: {
  reportRows: SheetRow[];
  profileRows: SheetRow[];
}) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedClassLabels, setSelectedClassLabels] = useState<string[]>([]);
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
  const [selectedEnglishTests, setSelectedEnglishTests] = useState<string[]>(
    []
  );
  const [selectedAptitudeTests, setSelectedAptitudeTests] = useState<string[]>(
    []
  );
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const reports = useMemo(
    () => buildAdmissionReports(reportRows, profileRows),
    [reportRows, profileRows]
  );

  const filteredReports = useMemo(() => {
    let result = reports;
    if (selectedClassLabels.length > 0) {
      result = result.filter((r) =>
        selectedClassLabels.includes(r.classLabel)
      );
    }
    if (selectedSponsors.length > 0) {
      result = result.filter((r) => selectedSponsors.includes(r.sponsor));
    }
    if (selectedEnglishTests.length > 0) {
      result = result.filter((r) =>
        selectedEnglishTests.includes(r.englishTest)
      );
    }
    if (selectedAptitudeTests.length > 0) {
      result = result.filter((r) =>
        selectedAptitudeTests.includes(r.aptitudeTest)
      );
    }
    return [...result].sort((a, b) =>
      sortOrder === "newest"
        ? b.classRank - a.classRank
        : a.classRank - b.classRank
    );
  }, [
    reports,
    selectedClassLabels,
    selectedSponsors,
    selectedEnglishTests,
    selectedAptitudeTests,
    sortOrder,
  ]);

  // データが1件もない場合は「近日公開予定」のみ表示
  if (reports.length === 0) {
    return (
      <section>
        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-12 text-center">
          <p className="text-lg font-semibold text-slate-700">近日公開予定</p>
          <p className="mt-2 text-sm text-slate-500">
            合格体験記は現在準備中です。公開までしばらくお待ちください。
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* フィルター部 */}
      <FilterPanel
        reports={reports}
        selectedClassLabels={selectedClassLabels}
        onChangeClassLabels={setSelectedClassLabels}
        selectedSponsors={selectedSponsors}
        onChangeSponsors={setSelectedSponsors}
        selectedEnglishTests={selectedEnglishTests}
        onChangeEnglishTests={setSelectedEnglishTests}
        selectedAptitudeTests={selectedAptitudeTests}
        onChangeAptitudeTests={setSelectedAptitudeTests}
        sortOrder={sortOrder}
        onChangeSortOrder={setSortOrder}
      />

      {/* 件数表示 */}
      <p className="text-sm text-slate-600">
        {filteredReports.length}件 / 全{reports.length}件を表示
      </p>

      {/* テーブル本体 */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {/* ヘッダー */}
        <div className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-3 md:grid-cols-[1fr_120px_40px]">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            投稿者
          </span>
          <span className="hidden text-xs font-semibold uppercase tracking-wide text-slate-500 md:block">
            社費/私費
          </span>
          <span className="hidden md:block" />
        </div>

        {/* 行一覧 */}
        {filteredReports.map((report) => (
          <ReportRow
            key={report.id}
            report={report}
            isExpanded={expandedRowId === report.id}
            onToggle={() =>
              setExpandedRowId((prev) =>
                prev === report.id ? null : report.id
              )
            }
          />
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
          条件に一致する合格体験記がありません。フィルターを解除してください。
        </div>
      )}
    </section>
  );
}
