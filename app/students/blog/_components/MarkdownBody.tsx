"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { Components } from "react-markdown";
import { extractDriveFileId, toDriveProxyUrl } from "../../../../lib/studentsBlog";

/**
 * Google Drive の共有URLを内部プロキシURL形式に変換する。
 * 例: drive.google.com/file/d/FILE_ID/view → /api/drive/file/FILE_ID
 */
function toDirectViewUrl(src: string | undefined): string {
  if (!src || typeof src !== "string") return "";
  const trimmed = src.trim();
  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    return toDriveProxyUrl(fileId);
  }
  return trimmed;
}

/**
 * 画像読み込み失敗時もページが落ちないよう、フォールバック表示を行う img コンポーネント。
 * Google Drive の共有URLは自動で直リンクに変換する。
 */
function SafeMarkdownImage({
  src,
  alt,
  title,
}: {
  src?: string | null;
  alt?: string | null;
  title?: string | null;
}) {
  const [error, setError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const resolvedSrc = toDirectViewUrl(src ?? undefined);
  const driveId = resolvedSrc ? extractDriveFileId(resolvedSrc) : null;

  const candidates = driveId
    ? [toDriveProxyUrl(driveId)]
    : resolvedSrc
      ? [resolvedSrc]
      : [];

  const currentSrc = candidates[fallbackIndex];

  if (!currentSrc || error) {
    return (
      <span className="my-2 inline-block rounded border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-slate-500">
        画像を表示できません
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt ?? ""}
      title={title ?? undefined}
      className="my-3 w-3/4 rounded-lg border border-neutral-200 object-contain"
      loading="lazy"
      onError={() => {
        if (fallbackIndex < candidates.length - 1) {
          setFallbackIndex((i) => i + 1);
        } else {
          setError(true);
        }
      }}
    />
  );
}

const markdownComponents: Components = {
  img: ({ src, alt, title }) => (
    <SafeMarkdownImage
      src={typeof src === "string" ? src : undefined}
      alt={typeof alt === "string" ? alt : undefined}
      title={typeof title === "string" ? title : undefined}
    />
  ),
};

type MarkdownBodyProps = {
  content: string;
  className?: string;
};

/**
 * ブログ本文用マークダウン表示。
 * - remark-gfm: テーブル・打ち消し線など GFM 対応
 * - remark-breaks: 単純な改行を <br> として反映
 * - prose: 見出し・リスト・リンクなどのスタイル
 * - img: Google Drive URL を直リンクに変換し、読み込み失敗時も安全に表示
 */
export function MarkdownBody({ content, className = "" }: MarkdownBodyProps) {
  if (!content?.trim()) {
    return null;
  }

  return (
    <div
      className={`prose prose-slate max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-[#005543] prose-a:no-underline hover:prose-a:underline prose-img:mx-auto prose-img:w-3/4 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
