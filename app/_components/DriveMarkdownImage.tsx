"use client";

import { useMemo, useState } from "react";
import { extractDriveFileId, toDriveProxyUrl } from "../../lib/studentsBlog";

type DriveMarkdownImageProps = {
  src?: string;
  alt?: string;
  title?: string;
};

export function DriveMarkdownImage({ src, alt, title }: DriveMarkdownImageProps) {
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const candidates = useMemo(() => {
    const raw = (src ?? "").trim();
    if (!raw) return [];

    const driveId = extractDriveFileId(raw);
    if (!driveId) return [raw];
    return [toDriveProxyUrl(driveId)];
  }, [src]);

  const currentSrc = candidates[fallbackIndex];

  if (!currentSrc || failed) {
    return (
      <span className="my-8 block">
        <span className="mx-auto block w-full rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-center text-sm text-slate-500 md:w-4/5">
          画像を表示できません
        </span>
        {alt?.trim() ? (
          <span className="mt-2 block text-center text-sm text-gray-500">{alt}</span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="my-8 block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={alt ?? ""}
        title={title}
        className="mx-auto w-full rounded-lg border border-neutral-200 object-contain md:w-4/5"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => {
          if (fallbackIndex < candidates.length - 1) {
            setFallbackIndex((index) => index + 1);
            return;
          }
          setFailed(true);
        }}
      />
      {alt?.trim() ? (
        <span className="mt-2 block text-center text-sm text-gray-500">{alt}</span>
      ) : null}
    </span>
  );
}
