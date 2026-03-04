"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1AmUHbN3E-AN_Vmc3Wc2LU951_YihjP2o1xKyLY1cypI/export?format=csv";

type CsvRow = Record<string, string | undefined>;
type LatestUpdate = {
  id: string;
  title: string;
  excerpt: string;
  postedAt: string;
  postedAtDate: Date | null;
};

function normalizeForMatch(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

function getByHeaderMatch(row: CsvRow, keywords: string[]): string {
  const entries = Object.entries(row);
  for (const [header, rawValue] of entries) {
    const normalizedHeader = normalizeForMatch(header);
    const hit = keywords.some((keyword) => normalizedHeader.includes(normalizeForMatch(keyword)));
    if (hit) return (rawValue ?? "").trim();
  }
  return "";
}

function parseDate(value: string): Date | null {
  const text = value.trim();
  if (!text) return null;
  const normalized = text.replace(/\./g, "/").replace(/-/g, "/");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatDate(value: string): string {
  const date = parseDate(value);
  if (!date) return value || "-";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parseLatestUpdates(csvText: string): LatestUpdate[] {
  const parsed = Papa.parse<CsvRow>(csvText, { header: true, skipEmptyLines: true });
  return parsed.data
    .map((row, index) => {
      const title = getByHeaderMatch(row, ["タイトル"]);
      const body = getByHeaderMatch(row, ["本文"]);
      const postedAt = getByHeaderMatch(row, ["投稿日"]);
      return {
        id: `${title || "post"}-${index}`,
        title: title || "無題",
        excerpt: body || "",
        postedAt,
        postedAtDate: parseDate(postedAt),
      } satisfies LatestUpdate;
    })
    .sort((a, b) => (b.postedAtDate?.getTime() ?? 0) - (a.postedAtDate?.getTime() ?? 0));
}

function CardHeaderGraphic({ id }: { id: string }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 320 120"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id={`greenYellow-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#005543" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#2d7a6a" stopOpacity="0.85" />
          <stop offset="85%" stopColor="#facc15" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* 同心円状の半円グラフィック */}
      <path
        d="M -20 80 A 180 180 0 0 1 340 80"
        fill="none"
        stroke={`url(#greenYellow-${id})`}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M 0 90 A 140 140 0 0 1 320 90"
        fill="none"
        stroke={`url(#greenYellow-${id})`}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M 20 98 A 100 100 0 0 1 300 98"
        fill="none"
        stroke={`url(#greenYellow-${id})`}
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LatestUpdates() {
  const [updates, setUpdates] = useState<LatestUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(CSV_URL, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`CSVの取得に失敗しました (${response.status})`);
        const csvText = await response.text();
        setUpdates(parseLatestUpdates(csvText));
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "最新投稿の読み込みに失敗しました。");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  const latestThree = useMemo(() => updates.slice(0, 3), [updates]);

  return (
    <section
      id="latest-updates"
      className="scroll-mt-20 space-y-6"
      aria-labelledby="latest-updates-heading"
    >
      <h2
        id="latest-updates-heading"
        className="mb-6 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
      >
        最新のアップデート (Latest Updates)
      </h2>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md">
              <div className="h-36 animate-pulse bg-gray-100" />
              <div className="space-y-3 px-5 pb-5 pt-4">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                <div className="h-5 w-4/5 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-white p-5 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
          {latestThree.map((item) => (
            <Link
              key={item.id}
              href="/students/blog"
              className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="relative h-36 w-full overflow-hidden bg-[#005543]">
                <Image
                  src="/images/hero-chateau.png"
                  alt=""
                  fill
                  className="object-cover object-center opacity-60"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <CardHeaderGraphic id={item.id} />
              </div>
              <div className="relative flex flex-1 flex-col px-5 pb-5 pt-4">
                <span className="mb-2 inline-flex w-fit rounded bg-amber-300 px-2 py-0.5 text-[11px] font-semibold text-slate-900">
                  Blog
                </span>
                <h3 className="mb-2 line-clamp-2 font-bold leading-snug text-slate-900">
                  {item.title}
                </h3>
                <p className="mb-4 flex-1 line-clamp-3 text-xs leading-relaxed text-slate-600">
                  {item.excerpt}
                </p>
                <p className="mb-4 text-[11px] text-slate-500">{formatDate(item.postedAt)}</p>
                <div className="flex justify-end">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#005543] text-white transition-colors group-hover:bg-[#004435]"
                    aria-hidden
                  >
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* セクション下部CTA */}
      <Link
        href="/students/blog"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#005543] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#004435]"
      >
        <span>在校生ブログのページへ</span>
        <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
