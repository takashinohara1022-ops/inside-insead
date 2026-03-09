"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type BlogPost,
  type MediaSource,
  getMediaSources,
  parseBlogDate,
} from "../../../../lib/studentsBlog";
import { MarkdownBody } from "./MarkdownBody";

type CampusFilter = "all" | "fonty" | "singy";
type SortOption = "newest" | "oldest";

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

export function StudentsBlogBoard({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPostId = searchParams.get("post") ?? null;
  const [filter, setFilter] = useState<CampusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOption>("newest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(initialPostId);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((post) => {
      post.hashtags.forEach((tag) => {
        if (tag) set.add(tag);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const campusFiltered = posts.filter((post) => campusMatches(post, filter));
    const hashtagFiltered =
      selectedTags.length === 0
        ? campusFiltered
        : campusFiltered.filter((post) => selectedTags.every((tag) => post.hashtags.includes(tag)));
    const sorted = [...hashtagFiltered].sort((a, b) => {
      const aTime = a.postedAtTimestamp ?? 0;
      const bTime = b.postedAtTimestamp ?? 0;
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
    return sorted;
  }, [posts, filter, selectedTags, sortOrder]);
  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId) ?? null,
    [posts, selectedPostId],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  };

  const closeModal = () => {
    setSelectedPostId(null);
    router.replace("/students/blog", { scroll: false });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            並び替え
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOption)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#006633] focus:outline-none"
            >
              <option value="newest">投稿日時が新しい順</option>
              <option value="oldest">投稿日時が古い順</option>
            </select>
          </label>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-600">ハッシュタグで絞り込み</p>
            {selectedTags.length > 0 ? (
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className="text-xs font-medium text-[#006633] hover:underline"
              >
                クリア
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allTags.length > 0 ? (
              allTags.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                      selected
                        ? "bg-[#006633] text-white"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-slate-500">ハッシュタグがありません。</p>
            )}
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-slate-600">
          投稿データがまだありません。
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
                onClick={() => setSelectedPostId(post.id)}
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
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700">
                  {post.body.replace(/#{1,6}\s/g, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\n+/g, " ").trim() || post.body}
                </p>
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
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/55 px-4 py-8"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
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
                onClick={closeModal}
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
            <div className="mt-4 text-sm">
              <MarkdownBody content={selectedPost.body} />
            </div>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:border-[#005543] hover:text-[#005543]"
              >
                日記一覧に戻る
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
