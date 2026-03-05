"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type GalleryItem = {
  id: string;
  postId?: string;
  postTitle: string;
  postedAt: string;
  author: string;
  isGalleryUpload?: boolean;
  hashtags: string[];
  candidates: string[];
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
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-4 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <GalleryImage item={selected} className="max-h-[68vh] w-full rounded-lg object-contain bg-black/5" />
            <div className="mt-4 space-y-2">
              {selected.isGalleryUpload ? (
                <>
                  <p className="text-base font-semibold text-slate-900">{selected.postedAt}</p>
                  <p className="text-sm text-slate-500">{selected.author}</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-slate-900">{selected.postTitle}</h3>
                  <p className="text-sm text-slate-500">{`${selected.postedAt} ・ ${selected.author}`}</p>
                </>
              )}
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
              <div className="pt-2">
                {selected.postId ? (
                  <Link
                    href={`/students/blog?post=${encodeURIComponent(selected.postId)}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#005543] px-4 py-2 text-sm font-medium text-[#005543] transition hover:bg-[#005543] hover:text-white"
                  >
                    元の在校生ブログを見る
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
