"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1gGPva62UWo_U0QidDD7oPL1Qgs-NtBLisKgdWIO7FbY/export?format=csv";

type CsvRow = Record<string, string | undefined>;

type Tag = {
  key: string;
  label: string;
};

type StudentProfile = {
  id: string;
  initials: string;
  classLabel: string;
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

function getByHeaderMatch(row: CsvRow, keywords: string[]): string {
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

function parseProfiles(csvText: string): StudentProfile[] {
  const parsed = Papa.parse<CsvRow>(csvText, { header: true, skipEmptyLines: true });

  return parsed.data.map((row, index) => {
    const initials = getByHeaderMatch(row, ["氏名イニシャル", "initial"]);
    const classLabel = parseClassLabel(
      getByHeaderMatch(row, ["INSEAD卒業年度", "gradyear"]),
      getByHeaderMatch(row, ["INSEAD卒業月", "gradmonth"]),
    );
    const homeCampus = getByHeaderMatch(row, ["Home Campus", "campus"]);
    const yearsAtEntry = getByHeaderMatch(row, ["入学時社会人歴", "社会人歴"]);
    const careerMajor = getByHeaderMatch(row, ["キャリアバックグラウンド大分類", "industry"]);
    const careerBackgrounds = splitMultiValue(
      getByHeaderMatch(row, ["キャリアバックグラウンド", "複数選択可能"]),
    ).map(toTag);
    const sponsor = getByHeaderMatch(row, ["社費or私費", "sponsor"]);
    const overseasExperience = getByHeaderMatch(row, ["海外経験", "overseas"]);
    const englishTest = getByHeaderMatch(row, ["英語試験"]);
    const englishTestScore = getByHeaderMatch(row, ["英語試験スコア"]);
    const aptitudeTest = getByHeaderMatch(row, ["能力試験"]);
    const aptitudeTestScore = getByHeaderMatch(row, ["能力試験スコア"]);
    const mbaAdvisoryService = getByHeaderMatch(
      row,
      ["利用したMBAアドバイザリーサービス名", "アドバイザリーサービス名"],
    );
    const otherMbaApplied = getByHeaderMatch(row, ["他MBA併願先"]);
    const otherMbaAccepted = getByHeaderMatch(row, ["他MBA合格先"]);
    const whyCategories = splitMultiValue(
      getByHeaderMatch(row, ["Why INSEAD? 判断軸カテゴリー", "Why INSEAD？ 判断軸カテゴリー"]),
    ).map(toTag);
    const whyFreeText = getByHeaderMatch(row, ["Why INSEAD？", "自由記述"]);
    const processAdvice = getByHeaderMatch(
      row,
      ["MBA/INSEADアプリケーションプロセスにおけるアドバイス", "アプリケーションプロセス"],
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

function ProfileCard({
  profile,
  selectedTagKeys,
  onTagClick,
}: {
  profile: StudentProfile;
  selectedTagKeys: string[];
  onTagClick: (tag: Tag) => void;
}) {
  const hasTagSelected = (tag: Tag) => selectedTagKeys.includes(tag.key);

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">{profile.initials}</h3>
        <div className="flex flex-wrap justify-end gap-1.5">
          {profile.classTag ? (
            <TagChip
              tag={profile.classTag}
              selected={hasTagSelected(profile.classTag)}
              onClick={onTagClick}
            />
          ) : null}
          {profile.sponsorTag ? (
            <TagChip
              tag={profile.sponsorTag}
              selected={hasTagSelected(profile.sponsorTag)}
              onClick={onTagClick}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoRow label="Home Campus" value={profile.homeCampus} />
        <InfoRow label="入学時社会人歴(何年目)" value={profile.yearsAtEntry} />
        <InfoRow label="海外経験(数か月以上の滞在)" value={profile.overseasExperience} />
        <InfoRow label="利用したMBAアドバイザリーサービス名" value={profile.mbaAdvisoryService} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoRow label="英語試験 / 英語試験スコア" value={`${profile.englishTest} / ${profile.englishTestScore}`} />
        <InfoRow label="能力試験 / 能力試験スコア" value={`${profile.aptitudeTest} / ${profile.aptitudeTestScore}`} />
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            キャリアバックグラウンド大分類
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
            キャリアバックグラウンド（複数）
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

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Why INSEAD? 判断軸カテゴリー
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

        {profile.homeCampusTag ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Home Campus (Tag)
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <TagChip
                tag={profile.homeCampusTag}
                selected={hasTagSelected(profile.homeCampusTag)}
                onClick={onTagClick}
              />
            </div>
          </div>
        ) : null}

        {profile.mbaAdvisoryTag ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              MBAアドバイザリーサービス
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <TagChip
                tag={profile.mbaAdvisoryTag}
                selected={hasTagSelected(profile.mbaAdvisoryTag)}
                onClick={onTagClick}
              />
            </div>
          </div>
        ) : null}

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">備考タグ</p>
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

      <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4">
        <InfoRow label="他MBA併願先" value={profile.otherMbaApplied} />
        <InfoRow label="他MBA合格先" value={profile.otherMbaAccepted} />

        <details className="rounded-md bg-neutral-50 p-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-800">
            Why INSEAD？（自由記述）
          </summary>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {profile.whyFreeText}
          </p>
        </details>

        <details className="rounded-md bg-neutral-50 p-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-800">
            MBA/INSEADアプリケーションプロセスにおけるアドバイス
          </summary>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {profile.processAdvice}
          </p>
        </details>
      </div>
    </article>
  );
}

export function StudentsProfilesDirectory() {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(CSV_URL, { cache: "no-store", signal: controller.signal });
        if (!response.ok) {
          throw new Error(`CSVの取得に失敗しました (${response.status})`);
        }
        const csvText = await response.text();
        setProfiles(parseProfiles(csvText));
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "データ取得中にエラーが発生しました。");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [reloadKey]);

  const selectedTagKeys = useMemo(() => selectedTags.map((tag) => tag.key), [selectedTags]);

  const filteredProfiles = useMemo(() => {
    if (selectedTagKeys.length === 0) return profiles;
    return profiles.filter((profile) =>
      selectedTagKeys.every((tagKey) => profile.filterTagKeys.includes(tagKey)),
    );
  }, [profiles, selectedTagKeys]);

  const handleTagClick = (tag: Tag) => {
    setSelectedTags((prev) => {
      if (prev.some((item) => item.key === tag.key)) return prev;
      return [...prev, tag];
    });
  };

  const removeSelectedTag = (key: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.key !== key));
  };

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
        <p className="text-sm font-semibold text-slate-800">選択中のハッシュタグ</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {selectedTags.length === 0 ? (
            <p className="text-sm text-slate-500">未選択（カード上のタグをクリックすると絞り込みできます）</p>
          ) : (
            selectedTags.map((tag) => (
              <span
                key={tag.key}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-sm text-emerald-800"
              >
                #{tag.label}
                <button
                  type="button"
                  aria-label={`${tag.label}を解除`}
                  onClick={() => removeSelectedTag(tag.key)}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-emerald-800/80 hover:bg-emerald-200"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        {selectedTags.length > 0 ? (
          <button
            type="button"
            onClick={() => setSelectedTags([])}
            className="mt-3 text-sm font-medium text-[#006633] underline-offset-4 hover:underline"
          >
            すべてクリア
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="h-6 w-20 animate-pulse rounded bg-gray-100" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 8 }).map((__, j) => (
                  <div key={j} className="h-4 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((prev) => prev + 1)}
            className="mt-3 rounded-md bg-[#006633] px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            再読み込み
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-600">
            {filteredProfiles.length}件 / 全{profiles.length}件を表示
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                selectedTagKeys={selectedTagKeys}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
          {filteredProfiles.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
              条件に一致するプロフィールがありません。フィルターを解除してください。
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
