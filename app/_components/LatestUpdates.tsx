"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  STUDENTS_BLOG_CSV_URL,
  type BlogPost,
  getCardBackgroundImage,
  parseBlogDate,
  parseBlogPosts,
} from "../../lib/studentsBlog";

function formatDate(value: string): string {
  const date = parseBlogDate(value);
  if (!date) return value || "-";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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
  const [updates, setUpdates] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(STUDENTS_BLOG_CSV_URL, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`CSVの取得に失敗しました (${response.status})`);
        const csvText = await response.text();
        setUpdates(parseBlogPosts(csvText));
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
        最新の在校生の投稿
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
              href={`/students/blog?post=${encodeURIComponent(item.id)}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="relative h-44 w-full overflow-hidden bg-[#005543]">
                {getCardBackgroundImage(item) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getCardBackgroundImage(item)!}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : null}
                <div className="absolute inset-0 bg-black/45" aria-hidden />
                <CardHeaderGraphic id={item.id} />
                <div className="absolute inset-0 flex flex-col justify-end px-5 pb-4 pt-3">
                  <span className="mb-2 inline-flex w-fit rounded bg-amber-300 px-2 py-0.5 text-[11px] font-semibold text-slate-900">
                    Blog
                  </span>
                  <h3 className="line-clamp-2 font-bold leading-snug text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[11px] text-white/85">{formatDate(item.postedAt)}</p>
                </div>
              </div>
              <div className="relative flex flex-1 flex-col px-5 pb-5 pt-4">
                <p className="mb-4 flex-1 line-clamp-3 text-xs leading-relaxed text-slate-600">
                  {item.body}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.hashtags.slice(0, 3).map((tag) => (
                    <span
                      key={`${item.id}-${tag}`}
                      className="rounded-full bg-green-100 px-2 py-1 text-[11px] text-green-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
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
