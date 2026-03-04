"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  STUDENTS_BLOG_CSV_URL,
  type BlogPost,
  type MediaSource,
  getMediaSources,
  parseBlogDate,
  parseBlogPosts,
} from "../../../../lib/studentsBlog";

type CampusFilter = "all" | "fonty" | "singy";

function DriveImage({
  fileId,
  alt,
  className,
}: {
  fileId: string;
  alt: string;
  className: string;
}) {
  const candidates = [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://drive.google.com/uc?export=download&id=${fileId}`,
  ];
  const [index, setIndex] = useState(0);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={candidates[index]}
      alt={alt}
      className={className}
      onError={() => {
        if (index < candidates.length - 1) setIndex((prev) => prev + 1);
      }}
    />
  );
}

function MediaPreview({
  post,
  className,
  showAll = false,
}: {
  post: BlogPost;
  className?: string;
  showAll?: boolean;
}) {
  const mediaSources = getMediaSources(post);
  const renderSource = (media: MediaSource, index: number) => {
    const key = `${media.kind}-${media.src ?? "none"}-${index}`;
    if (media.kind === "youtube" && media.src) {
      return (
        <iframe
          key={key}
          src={media.src}
          title={`${post.title}-${index}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={className ?? "aspect-video w-full rounded-lg border border-neutral-200"}
        />
      );
    }

    if (media.kind === "video" && media.src) {
      return (
        <video
          key={key}
          controls
          className={className ?? "aspect-video w-full rounded-lg border border-neutral-200 bg-black"}
        >
          <source src={media.src} />
        </video>
      );
    }

    if (media.kind === "image" && media.src) {
      if (media.driveFileId) {
        return (
          <DriveImage
            key={key}
            fileId={media.driveFileId}
            alt={post.title}
            className={className ?? "aspect-video w-full rounded-lg border border-neutral-200 object-cover"}
          />
        );
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={media.src}
          alt={post.title}
          className={className ?? "aspect-video w-full rounded-lg border border-neutral-200 object-cover"}
        />
      );
    }

    return (
      <div
        key={key}
        className={
          className ??
          "flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-sm text-slate-500"
        }
      >
        メディアなし
      </div>
    );
  };

  if (showAll) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {mediaSources.map((media, index) => renderSource(media, index))}
      </div>
    );
  }

  return renderSource(mediaSources[0], 0);
}

function formatDate(postedAt: string): string {
  const date = parseBlogDate(postedAt);
  if (!date) return postedAt || "-";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function campusMatches(post: BlogPost, filter: CampusFilter): boolean {
  if (filter === "all") return true;
  if (filter === "fonty") return post.campus === "Fonty";
  if (filter === "singy") return post.campus === "Singy";
  return true;
}

export function StudentsBlogBoard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPostId = searchParams.get("post");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CampusFilter>("all");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

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
        if (!response.ok) {
          throw new Error(`CSVの取得に失敗しました (${response.status})`);
        }
        const csvText = await response.text();
        setPosts(parseBlogPosts(csvText));
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "投稿データの読み込みに失敗しました。");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [reloadKey]);

  const filteredPosts = useMemo(
    () => posts.filter((post) => campusMatches(post, filter)),
    [posts, filter],
  );

  useEffect(() => {
    if (!initialPostId || posts.length === 0) return;
    const matched = posts.find((post) => post.id === initialPostId);
    if (matched) {
      setSelectedPost(matched);
    }
  }, [initialPostId, posts]);

  return (
    <section className="space-y-6">
      <div
        className="inline-flex flex-wrap gap-2 rounded-lg border border-neutral-200 bg-white p-1"
        role="tablist"
        aria-label="キャンパスで絞り込み"
      >
        {[
          { key: "all" as const, label: "すべてのキャンパス" },
          { key: "fonty" as const, label: "Fonty" },
          { key: "singy" as const, label: "Singy" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={filter === tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-[#006633] text-white"
                : "text-slate-700 hover:bg-neutral-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="aspect-video animate-pulse rounded-lg bg-gray-100" />
              <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-100" />
              <div className="mt-3 space-y-2">
                <div className="h-3 animate-pulse rounded bg-gray-100" />
                <div className="h-3 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
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
            {filteredPosts.length}件 / 全{posts.length}件
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedPost(post)}
                className="group rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative">
                  <MediaPreview post={post} />
                  {getMediaSources(post).filter((m) => m.kind !== "none").length > 1 ? (
                    <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
                      +{getMediaSources(post).filter((m) => m.kind !== "none").length - 1}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 line-clamp-2 text-lg font-semibold tracking-tight text-slate-900">
                  {post.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(post.postedAt)} ・ {post.author}
                </p>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700">{post.body}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.hashtags.map((tag) => (
                    <span
                      key={`${post.id}-${tag}`}
                      className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
              該当する投稿がありません。
            </div>
          ) : null}
        </>
      )}

      {selectedPost ? (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/55 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                  {selectedPost.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(selectedPost.postedAt)} ・ {selectedPost.author}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPost(null);
                  router.replace("/students/blog", { scroll: false });
                }}
                className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-neutral-50"
              >
                閉じる
              </button>
            </div>
            <MediaPreview
              post={selectedPost}
              showAll
              className="aspect-video w-full rounded-lg border border-neutral-200 object-cover"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedPost.hashtags.map((tag) => (
                <span
                  key={`modal-${selectedPost.id}-${tag}`}
                  className="rounded-full bg-green-100 px-2.5 py-1 text-xs text-green-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {selectedPost.body}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
