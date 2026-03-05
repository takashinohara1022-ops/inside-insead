"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type BlogPost,
  getMediaSources,
  toYouTubeThumbnailUrl,
  parseBlogDate,
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

function CoverImage({ post }: { post: BlogPost }) {
  const primaryMedia = getMediaSources(post)[0];
  const candidates = useMemo(() => {
    if (!primaryMedia) return [] as string[];
    if (primaryMedia.kind === "youtube") {
      const thumb = toYouTubeThumbnailUrl(post.youtubeLink);
      return thumb ? [thumb] : [];
    }
    if (primaryMedia.kind === "image" && primaryMedia.driveFileId) {
      return [
        `https://drive.google.com/thumbnail?id=${primaryMedia.driveFileId}&sz=w2000`,
        `https://drive.google.com/uc?export=view&id=${primaryMedia.driveFileId}`,
        `https://drive.google.com/uc?export=download&id=${primaryMedia.driveFileId}`,
      ];
    }
    if (primaryMedia.kind === "image" && primaryMedia.src) {
      return [primaryMedia.src];
    }
    return [] as string[];
  }, [post, primaryMedia]);
  const [index, setIndex] = useState(0);

  if (candidates.length === 0) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={candidates[index]}
      alt={post.title}
      className="absolute inset-0 h-full w-full object-cover object-center"
      onError={() => {
        if (index < candidates.length - 1) setIndex((prev) => prev + 1);
      }}
    />
  );
}

export function LatestUpdates({ updates }: { updates: BlogPost[] }) {
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

      {updates.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 text-sm text-slate-600">
          投稿データがまだありません。
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
                <CoverImage post={item} />
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
