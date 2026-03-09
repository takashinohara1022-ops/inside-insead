"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const buttonBase =
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#005543] px-4 py-2.5 text-sm font-medium text-[#005543] transition hover:bg-[#005543] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#005543] focus:ring-offset-2 sm:px-5 sm:py-2";

export type GalleryItem = {
  id: string;
  postId?: string;
  postTitle: string;
  postedAt: string;
  author: string;
  isGalleryUpload?: boolean;
  hashtags: string[];
  candidates: string[];
  /** 日付ソート用（ミリ秒）。未設定時は 0 として扱う */
  sortTimestamp?: number;
  /** ギャラリー投稿時の写真コメント（スプレッドシート「写真コメント」列） */
  photoComment?: string;
};

function GalleryImage({
  item,
  className,
}: {
  item: GalleryItem;
  className: string;
}) {
  const [index, setIndex] = useState(0);
  const src = item.candidates[index];
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={item.postTitle}
      className={className}
      loading="lazy"
      onError={() => {
        if (index < item.candidates.length - 1) setIndex((prev) => prev + 1);
      }}
    />
  );
}

export function BlogGallery({ items }: { items: GalleryItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-slate-600">
        表示できる画像がまだありません。
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <GalleryImage
              item={item}
              className={`w-full object-cover transition duration-500 group-hover:scale-[1.03] ${
                index % 5 === 0 ? "aspect-[4/5]" : index % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/3]"
              }`}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 text-left">
              {item.isGalleryUpload ? (
                <>
                  <p className="text-xs font-semibold text-white">{item.postedAt}</p>
                  <p className="mt-1 text-[11px] text-white/85">{item.author}</p>
                </>
              ) : (
                <>
                  <p className="line-clamp-2 text-sm font-semibold text-white">{item.postTitle}</p>
                  <p className="mt-1 text-[11px] text-white/85">{`${item.postedAt} ・ ${item.author}`}</p>
                </>
              )}
            </div>
          </button>
        ))}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-3 sm:p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:max-h-[90vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <GalleryImage
                item={selected}
                className="max-h-[60vh] w-full rounded-lg object-contain bg-black/5 sm:max-h-[65vh]"
              />
              <div className="mt-4 space-y-3">
                {selected.isGalleryUpload ? (
                  <>
                    <p className="text-base font-semibold text-slate-900">{selected.postedAt}</p>
                    <p className="text-sm text-slate-500">{selected.author}</p>
                    {selected.photoComment?.trim() ? (
                      <blockquote className="border-l-4 border-[#005543] bg-slate-50 py-2 pl-4 pr-3 text-sm italic text-slate-700">
                        {selected.photoComment.trim()}
                      </blockquote>
                    ) : null}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-slate-900">{selected.postTitle}</h3>
                    <p className="text-sm text-slate-500">{`${selected.postedAt} ・ ${selected.author}`}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.hashtags.map((tag) => (
                        <span
                          key={`${selected.id}-${tag}`}
                          className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/80 p-3 sm:p-4">
              {selected.postId && !selected.isGalleryUpload ? (
                <Link
                  href={`/students/blog?post=${encodeURIComponent(selected.postId)}`}
                  className={buttonBase}
                >
                  元の在校生ブログを見る
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className={`${buttonBase} bg-[#005543] text-white hover:bg-[#004235] hover:text-white`}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
