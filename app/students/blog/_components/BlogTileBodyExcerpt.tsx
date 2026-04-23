"use client";

import { useEffect } from "react";
import type { CSSProperties } from "react";
import { ensureGfmTableDelimiters } from "../../../../lib/blogMarkdownGfmPrep";
import { blogBodyToPlainPreview } from "../../../../lib/blogBodyPlainPreview";

export type BlogTileBodyExcerptProps = {
  body: string;
  /** 抜粋の最大行数（単一テキストブロックへの line-clamp） */
  lineClamp?: number;
  className?: string;
  /** true のとき本文が空でも「（本文なし）」を表示（カバー無しのヒーロースロット用） */
  placeholderWhenEmpty?: boolean;
  /** ヒーロースロット用の一段小さいタイポ */
  compactProse?: boolean;
};

/**
 * ブログ一覧タイル用の本文抜粋。マルチブロックの Markdown + line-clamp で描画が壊れるのを避けるためプレーン表示。
 */
export function BlogTileBodyExcerpt({
  body,
  lineClamp = 3,
  className = "",
  placeholderWhenEmpty = false,
  compactProse = false,
}: BlogTileBodyExcerptProps) {
  const trimmed = body?.trim() ?? "";
  const preparedForLog = trimmed ? ensureGfmTableDelimiters(trimmed) : "";

  // #region agent log
  useEffect(() => {
    if (!trimmed && !placeholderWhenEmpty) return;
    const slotNoCover = className.includes("flex-1");
    const paraApprox = preparedForLog ? preparedForLog.split(/\n{2,}/).filter(Boolean).length : 0;
    const hasTableMd = /^\s*\|[^|\n]+\|/m.test(preparedForLog);
    const singleNewlineRuns = preparedForLog
      ? (preparedForLog.match(/[^\n]\n(?!\n)/g) || []).length
      : 0;
    fetch("http://127.0.0.1:7654/ingest/2b670903-b8b8-47ef-b44c-297786fa4d2f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "3272fd",
      },
      body: JSON.stringify({
        sessionId: "3272fd",
        runId: "post-fix-3",
        location: "BlogTileBodyExcerpt.tsx:useEffect",
        message: "BlogTileBodyExcerpt mount/update",
        data: {
          lineClamp,
          bodyLen: trimmed.length,
          slotNoCover,
          paraApprox,
          hasTableMd,
          singleNewlineRuns,
          compactProse,
          placeholderOnly: !trimmed && placeholderWhenEmpty,
          clampShell: "plain-single-p",
        },
        timestamp: Date.now(),
        hypothesisId: "H1-H5",
      }),
    }).catch(() => {});
  }, [
    trimmed,
    preparedForLog,
    lineClamp,
    className,
    compactProse,
    placeholderWhenEmpty,
  ]);
  // #endregion

  if (!trimmed) {
    if (!placeholderWhenEmpty) return null;
    return (
      <div
        className={`flex h-full min-h-0 w-full items-center justify-center overflow-hidden p-2 text-center text-xs text-slate-400 ${className}`}
      >
        （本文なし）
      </div>
    );
  }

  const plain = blogBodyToPlainPreview(preparedForLog);

  const proseSize = compactProse
    ? "text-xs leading-snug"
    : "text-sm leading-relaxed";

  const clampStyle: CSSProperties = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: lineClamp,
    overflow: "hidden",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  };

  return (
    <div className={`w-full min-h-0 overflow-hidden ${className}`}>
      <p className={`m-0 text-slate-700 ${proseSize}`} style={clampStyle}>
        {plain}
      </p>
    </div>
  );
}
