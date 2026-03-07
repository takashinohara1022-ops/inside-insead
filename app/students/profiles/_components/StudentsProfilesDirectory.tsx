"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { SheetRow } from "../../../../lib/googleData";

type Tag = {
  key: string;
  label: string;
};

type StudentProfile = {
  id: string;
  initials: string;
  classLabel: string;
  classRank: number;
  classTag: Tag | null;
  homeCampus: string;
  homeCampusTag: Tag | null;
  yearsAtEntry: string;
  careerMajor: string;
  careerMajorTag: Tag | null;
  careerBackgrounds: Tag[];
  sponsor: string;
  sponsorTag: Tag | null;
  overseasExperience: string;
  englishTest: string;
  englishTestScore: string;
  aptitudeTest: string;
  aptitudeTestScore: string;
  mbaAdvisoryService: string;
  mbaAdvisoryTag: Tag | null;
  otherMbaApplied: string;
  otherMbaAccepted: string;
  whyCategories: Tag[];
  whyFreeText: string;
  processAdvice: string;
  profileTags: Tag[];
  filterTagKeys: string[];
};

type AccordionKey = "basic" | "application" | "why" | "message";

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

function toTagKey(label: string): string {
  return normalizeForMatch(label);
}

function toTag(label: string): Tag {
  const text = normalizeText(label).replace(/^#/, "");
  return { key: toTagKey(text), label: text };
}

function dedupeTags(tags: Tag[]): Tag[] {
  const map = new Map<string, Tag>();
  tags.forEach((tag) => {
    if (!tag.key) return;
    map.set(tag.key, tag);
  });
  return Array.from(map.values());
}

function getByHeaderMatch(row: SheetRow, keywords: string[]): string {
  const entries = Object.entries(row);
  for (const [header, rawValue] of entries) {
    const normalizedHeader = normalizeForMatch(header);
    const hit = keywords.some((keyword) => normalizedHeader.includes(normalizeForMatch(keyword)));
    if (hit) return normalizeText(rawValue ?? "");
  }
  return "";
}

function splitMultiValue(raw: string): string[] {
  const normalized = normalizeText(raw);
  if (!normalized || normalized === "* none") return [];
  return normalized
    .split(/[,、，\n]/)
    .map((part) => normalizeText(part).replace(/^#/, ""))
    .filter((part) => part.length > 0 && part !== "* none");
}

function parseClassLabel(yearRaw: string, monthRaw: string): string {
  const year = normalizeText(yearRaw);
  const month = normalizeForMatch(monthRaw);
  const yearNum = year.match(/\d{2,4}/)?.[0];
  if (!yearNum) return "";
  const fourDigitYear = yearNum.length === 2 ? `20${yearNum}` : yearNum;
  const yy = fourDigitYear.slice(-2);
  if (month.includes("july") || month === "j" || month.includes("7")) return `${yy}J`;
  if (month.includes("dec") || month === "d" || month.includes("12")) return `${yy}D`;
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

function isClassTagLabel(label: string): boolean {
  return /^\d{2}[JD]$/i.test(normalizeText(label));
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

function normalizeMajorIndustry(value: string): string {
  const normalized = normalizeText(value);
  if (!normalized) return "";
  const key = normalizeForMatch(normalized);
  if (key.includes("consult") || key.includes("コンサル")) return "コンサル";
  if (key.includes("金融")) return "金融";
  if (key.includes("商社")) return "商社";
  if (key.includes("メーカー")) return "メーカー";
  if (key.includes("tech") || key.includes("テック")) return "テック";
  if (key.includes("そのほか") || key.includes("その他")) return "その他";
  return normalized;
}

function parseProfiles(rows: SheetRow[]): StudentProfile[] {
  return rows.map((row, index) => {
    const initials = getByHeaderMatch(row, ["氏名イニシャル", "initial"]);
    const classLabel = parseClassLabel(
      getByHeaderMatch(row, ["INSEAD卒業年度", "INSEAD卒業年", "gradyear"]),
      getByHeaderMatch(row, ["INSEAD卒業月", "gradmonth"]),
    );
    const homeCampus = getByHeaderMatch(row, ["Home Campus", "ホームキャンパス", "campus"]);
    const yearsAtEntry = getByHeaderMatch(row, ["入学時社会人歴", "社会人歴", "社会人何年目"]);
    const careerMajor = normalizeMajorIndustry(
      getByHeaderMatch(row, ["キャリアバックグラウンド大分類", "出身業界(大分類)", "industry"]),
    );
    const careerBackgrounds = splitMultiValue(
      getByHeaderMatch(row, [
        "キャリアバックグラウンド",
        "出身業界(小分類)",
        "複数選択可能",
      ]),
    ).map(toTag);
    const sponsor = getByHeaderMatch(row, ["社費or私費", "sponsor"]);
    const overseasExperience = getByHeaderMatch(row, [
      "海外経験(数か月以上の滞在)",
      "海外経験(半年以上の滞在)",
      "海外経験",
      "overseas",
    ]);
    const englishTest = getByHeaderMatch(row, ["英語試験"]);
    const englishTestScore = getByHeaderMatch(row, ["英語試験スコア"]);
    const aptitudeTest = getByHeaderMatch(row, ["能力試験"]);
    const aptitudeTestScore = getByHeaderMatch(row, ["能力試験スコア"]);
    const mbaAdvisoryService = getByHeaderMatch(
      row,
      [
        "利用したMBAアドバイザリーサービス名",
        "利用したカウンセリング",
        "アドバイザリーサービス名",
      ],
    );
    const otherMbaApplied = getByHeaderMatch(row, ["他MBA併願先", "併願先した学校"]);
    const otherMbaAccepted = getByHeaderMatch(row, ["他MBA合格先", "併願合格先"]);
    const whyCategories = splitMultiValue(
      getByHeaderMatch(row, [
        "Why INSEAD? 判断軸カテゴリー",
        "Why INSEAD？ 判断軸カテゴリー",
        "Why INSEAD? 判断軸",
      ]),
    )
      .map(normalizeWhyAxisLabel)
      .filter(Boolean)
      .map(toTag);
    const whyFreeText =
      getByHeaderMatch(row, [
        "Why INSEAD? *500文字以内",
        "Why INSEAD？ *500文字以内",
        "Why INSEAD?（自由記述）",
        "Why INSEAD？（自由記述）",
        "Why INSEAD? (自由記述)",
        "Why INSEAD？ (自由記述)",
      ]) || getByHeaderMatch(row, ["自由記述"]);
    const processAdvice = getByHeaderMatch(
      row,
      [
        "MBA/INSEADアプリケーションプロセスにおけるアドバイス",
        "受験生へのアドバイス/応援/メッセージ",
        "アプリケーションプロセス",
      ],
    );
    const profileTags = splitMultiValue(
      getByHeaderMatch(row, ["プロフィールハッシュタグ", "備考"]),
    ).map(toTag);

    const classTag = classLabel ? toTag(classLabel) : null;
    const homeCampusTag = homeCampus ? toTag(homeCampus) : null;
    const careerMajorTag = careerMajor ? toTag(careerMajor) : null;
    const sponsorTag = sponsor ? toTag(sponsor) : null;
    const advisoryNormalized = normalizeForMatch(mbaAdvisoryService);
    const advisoryEmpty =
      !advisoryNormalized ||
      advisoryNormalized === "なし" ||
      advisoryNormalized === "無し" ||
      advisoryNormalized === "*none" ||
      advisoryNormalized === "none";
    const mbaAdvisoryTag = advisoryEmpty ? null : toTag(mbaAdvisoryService);

    const filterTags = dedupeTags(
      [
        classTag,
        homeCampusTag,
        careerMajorTag,
        sponsorTag,
        mbaAdvisoryTag,
        ...careerBackgrounds,
        ...whyCategories,
        ...profileTags,
      ].filter((value): value is Tag => Boolean(value)),
    );

    return {
      id: `${initials || "profile"}-${index}`,
      initials: initials || "N/A",
      classLabel,
      classRank: getClassRank(classLabel),
      classTag,
      homeCampus: homeCampus || "-",
      homeCampusTag,
      yearsAtEntry: yearsAtEntry || "-",
      careerMajor: careerMajor || "-",
      careerMajorTag,
      careerBackgrounds,
      sponsor: sponsor || "-",
      sponsorTag,
      overseasExperience: overseasExperience || "-",
      englishTest: englishTest || "-",
      englishTestScore: englishTestScore || "-",
      aptitudeTest: aptitudeTest || "-",
      aptitudeTestScore: aptitudeTestScore || "-",
      mbaAdvisoryService: mbaAdvisoryService || "-",
      mbaAdvisoryTag,
      otherMbaApplied: otherMbaApplied || "-",
      otherMbaAccepted: otherMbaAccepted || "-",
      whyCategories,
      whyFreeText: whyFreeText || "-",
      processAdvice: processAdvice || "-",
      profileTags,
      filterTagKeys: filterTags.map((tag) => tag.key),
    };
  });
}

function TagChip({
  tag,
  onClick,
  selected = false,
}: {
  tag: Tag;
  onClick?: (tag: Tag) => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(tag)}
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        selected
          ? "bg-emerald-800 text-white"
          : "bg-green-100 text-green-800 hover:bg-green-200"
      }`}
    >
      #{tag.label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-700">{value || "-"}</p>
    </div>
  );
}

function formatYearsAtEntry(value: string): string {
  const normalized = normalizeText(value);
  if (!normalized || normalized === "-") return "-";
  if (normalized.includes("年目")) return normalized;
  const numeric = normalized.match(/\d+(\.\d+)?/)?.[0];
  if (!numeric) return normalized;
  return `${numeric}年目`;
}

function AccordionSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-transparent">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-center justify-between rounded-lg bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-neutral-50"
      >
        <span>{title}</span>
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
            open
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-500 group-hover:border-slate-300 group-hover:text-slate-700"
          }`}
          aria-hidden
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
          />
        </span>
      </button>
      {open ? <div className="space-y-4 px-4 py-4">{children}</div> : null}
    </section>
  );
}

function ProfileCard({
  profile,
  selectedTagKeys,
  onTagClick,
  isLatestClassMember,
}: {
  profile: StudentProfile;
  selectedTagKeys: string[];
  onTagClick: (tag: Tag) => void;
  isLatestClassMember: boolean;
}) {
  const [accordionState, setAccordionState] = useState<Record<AccordionKey, boolean>>({
    basic: false,
    application: false,
    why: false,
    message: false,
  });

  const hasTagSelected = (tag: Tag) => selectedTagKeys.includes(tag.key);
  const toggleAccordion = (key: AccordionKey) => {
    setAccordionState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const coffeeChatTarget = `${profile.initials} / ${profile.careerMajor || "未設定"} / ${profile.homeCampus || "未設定"}`;

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">{profile.initials}</h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.classTag ? (
              <TagChip
                tag={profile.classTag}
                selected={hasTagSelected(profile.classTag)}
                onClick={onTagClick}
              />
            ) : null}
            {profile.homeCampusTag ? (
              <TagChip
                tag={profile.homeCampusTag}
                selected={hasTagSelected(profile.homeCampusTag)}
                onClick={onTagClick}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <AccordionSection
          title="基本情報"
          open={accordionState.basic}
          onToggle={() => toggleAccordion("basic")}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow label="入学時社会人歴(何年目)" value={formatYearsAtEntry(profile.yearsAtEntry)} />
              <InfoRow label="海外経験" value={profile.overseasExperience} />
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  キャリア大分類
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.careerMajorTag ? (
                    <TagChip
                      tag={profile.careerMajorTag}
                      selected={hasTagSelected(profile.careerMajorTag)}
                      onClick={onTagClick}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">-</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  キャリア小分類
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.careerBackgrounds.length > 0 ? (
                    profile.careerBackgrounds.map((tag) => (
                      <TagChip
                        key={tag.key}
                        tag={tag}
                        selected={hasTagSelected(tag)}
                        onClick={onTagClick}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-slate-700">-</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                備考（プロフィールハッシュタグ）
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {profile.profileTags.length > 0 ? (
                  profile.profileTags.map((tag) => (
                    <TagChip
                      key={tag.key}
                      tag={tag}
                      selected={hasTagSelected(tag)}
                      onClick={onTagClick}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-700">-</p>
                )}
              </div>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          title="アプリケーション"
          open={accordionState.application}
          onToggle={() => toggleAccordion("application")}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  社費 / 私費
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.sponsorTag ? (
                    <TagChip
                      tag={profile.sponsorTag}
                      selected={hasTagSelected(profile.sponsorTag)}
                      onClick={onTagClick}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{profile.sponsor}</p>
                  )}
                </div>
              </div>
              <InfoRow
                label="英語試験 / 英語試験スコア"
                value={`${profile.englishTest} / ${profile.englishTestScore}`}
              />
              <InfoRow
                label="能力試験 / 能力試験スコア"
                value={`${profile.aptitudeTest} / ${profile.aptitudeTestScore}`}
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  利用したMBAアドバイザリーサービス
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.mbaAdvisoryTag ? (
                    <TagChip
                      tag={profile.mbaAdvisoryTag}
                      selected={hasTagSelected(profile.mbaAdvisoryTag)}
                      onClick={onTagClick}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{profile.mbaAdvisoryService}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-neutral-200 pt-4">
              <InfoRow label="他MBA併願先" value={profile.otherMbaApplied} />
              <InfoRow label="他MBA合格先" value={profile.otherMbaAccepted} />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          title="Why INSEAD？"
          open={accordionState.why}
          onToggle={() => toggleAccordion("why")}
        >
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                重要視した要素：
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {profile.whyCategories.length > 0 ? (
                  profile.whyCategories.map((tag) => (
                    <TagChip
                      key={tag.key}
                      tag={tag}
                      selected={hasTagSelected(tag)}
                      onClick={onTagClick}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-700">-</p>
                )}
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {profile.whyFreeText}
            </p>
          </div>
        </AccordionSection>

        <AccordionSection
          title="応援メッセージ"
          open={accordionState.message}
          onToggle={() => toggleAccordion("message")}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {profile.processAdvice}
          </p>
        </AccordionSection>

        {isLatestClassMember ? (
          <Link
            href={`/coffee-chat?target=${encodeURIComponent(coffeeChatTarget)}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#005543] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#004435] hover:shadow-lg"
          >
            {profile.initials} とコーヒーチャットをする
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function StudentsProfilesDirectory({ rows }: { rows: SheetRow[] }) {
  const sectionTopRef = useRef<HTMLDivElement | null>(null);
  const [selectedYears, setSelectedYears] = useState<Tag[]>([]);
  const [selectedOtherTags, setSelectedOtherTags] = useState<Tag[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideClass, setSlideClass] = useState("translate-x-0 opacity-100");

  const profiles = useMemo(
    () => parseProfiles(rows).sort((a, b) => b.classRank - a.classRank),
    [rows],
  );

  const yearTags = useMemo(() => {
    const map = new Map<string, Tag>();
    profiles.forEach((profile) => {
      if (!profile.classLabel || !isClassTagLabel(profile.classLabel)) return;
      const tag = toTag(profile.classLabel);
      map.set(tag.key, tag);
    });
    return Array.from(map.values()).sort((a, b) => getClassRank(b.label) - getClassRank(a.label));
  }, [profiles]);

  const latestClassLabel = useMemo(() => {
    const validClasses = profiles
      .map((profile) => profile.classLabel)
      .filter((label) => isClassTagLabel(label));
    if (validClasses.length === 0) return "";
    return validClasses.sort((a, b) => getClassRank(b) - getClassRank(a))[0];
  }, [profiles]);

  const selectedYearKeys = useMemo(() => selectedYears.map((tag) => tag.key), [selectedYears]);
  const selectedOtherTagKeys = useMemo(
    () => selectedOtherTags.map((tag) => tag.key),
    [selectedOtherTags],
  );
  const selectedTagKeys = useMemo(
    () => [...selectedYearKeys, ...selectedOtherTagKeys],
    [selectedYearKeys, selectedOtherTagKeys],
  );

  const filteredProfiles = useMemo(() => {
    const yearFiltered =
      selectedYearKeys.length === 0
        ? profiles
        : profiles.filter((profile) => selectedYearKeys.includes(toTagKey(profile.classLabel)));
    if (selectedOtherTagKeys.length === 0) return yearFiltered;
    return yearFiltered.filter((profile) =>
      selectedOtherTagKeys.every((tagKey) => profile.filterTagKeys.includes(tagKey)),
    );
  }, [profiles, selectedYearKeys, selectedOtherTagKeys]);

  const resetPaginationState = () => {
    setPageIndex(0);
    setSlideClass("translate-x-0 opacity-100");
    setIsAnimating(false);
  };

  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / 10));
  const pagedProfiles = useMemo(
    () => filteredProfiles.slice(pageIndex * 10, pageIndex * 10 + 10),
    [filteredProfiles, pageIndex],
  );

  const toggleYearTag = (tag: Tag) => {
    resetPaginationState();
    setSelectedYears((prev) => {
      if (prev.some((item) => item.key === tag.key)) return prev.filter((item) => item.key !== tag.key);
      return [...prev, tag];
    });
  };

  const handleTagClick = (tag: Tag) => {
    if (isClassTagLabel(tag.label)) {
      toggleYearTag(tag);
      return;
    }
    resetPaginationState();
    setSelectedOtherTags((prev) => {
      if (prev.some((item) => item.key === tag.key)) {
        return prev.filter((item) => item.key !== tag.key);
      }
      return [...prev, tag];
    });
  };

  const removeOtherTag = (key: string) => {
    resetPaginationState();
    setSelectedOtherTags((prev) => prev.filter((tag) => tag.key !== key));
  };

  const animateToPage = (targetPage: number) => {
    if (isAnimating) return;
    if (targetPage < 0 || targetPage >= totalPages) return;
    if (targetPage === pageIndex) return;
    sectionTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const direction = targetPage > pageIndex ? "next" : "prev";
    setIsAnimating(true);
    setSlideClass(direction === "next" ? "-translate-x-8 opacity-0" : "translate-x-8 opacity-0");

    window.setTimeout(() => {
      setPageIndex(targetPage);
      setSlideClass(direction === "next" ? "translate-x-8 opacity-0" : "-translate-x-8 opacity-0");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSlideClass("translate-x-0 opacity-100");
          setIsAnimating(false);
        });
      });
    }, 180);
  };

  return (
    <section className="space-y-6">
      <div ref={sectionTopRef} />
      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
        <div>
          <p className="text-sm font-semibold text-slate-800">在学年度</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {yearTags.length > 0 ? (
              yearTags.map((tag) => (
                <TagChip
                  key={tag.key}
                  tag={tag}
                  selected={selectedYearKeys.includes(tag.key)}
                  onClick={toggleYearTag}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500">在学年度データがありません。</p>
            )}
          </div>
        </div>

        <div className="mt-5 border-t border-neutral-100 pt-4">
          <p className="text-sm font-semibold text-slate-800">その他選択中</p>
          <div className="mt-3 flex min-h-8 flex-wrap items-center gap-2">
            {selectedOtherTags.length > 0 ? (
              selectedOtherTags.map((tag) => (
                <span
                  key={tag.key}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-sm text-emerald-800"
                >
                  #{tag.label}
                  <button
                    type="button"
                    aria-label={`${tag.label}を解除`}
                    onClick={() => removeOtherTag(tag.key)}
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-emerald-800/80 hover:bg-emerald-200"
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">未選択</p>
            )}
          </div>
        </div>
      </div>

      {!rows.length ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-600">プロフィールデータがまだありません。</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-600">
            {filteredProfiles.length}件 / 全{profiles.length}件を表示
          </p>
          <div
            className={`grid grid-cols-1 gap-5 transition-transform duration-300 ease-out md:grid-cols-2 ${slideClass}`}
          >
            {pagedProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                selectedTagKeys={selectedTagKeys}
                onTagClick={handleTagClick}
                isLatestClassMember={Boolean(
                  latestClassLabel && normalizeText(profile.classLabel) === normalizeText(latestClassLabel),
                )}
              />
            ))}
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
              条件に一致するプロフィールがありません。フィルターを解除してください。
            </div>
          ) : null}

          {filteredProfiles.length > 10 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4">
              <p className="text-sm text-slate-600">
                {pageIndex + 1} / {totalPages} ページ
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => animateToPage(pageIndex - 1)}
                  disabled={pageIndex === 0 || isAnimating}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#005543] hover:text-[#005543] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  前の10件に戻る
                </button>
                <button
                  type="button"
                  onClick={() => animateToPage(pageIndex + 1)}
                  disabled={pageIndex >= totalPages - 1 || isAnimating}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#005543] bg-white px-4 py-2 text-sm font-semibold text-[#005543] transition hover:bg-[#005543] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  次の10件を見る
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
