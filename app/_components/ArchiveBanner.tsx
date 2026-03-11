"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ARCHIVE_URL = "https://insideinseadjp.blogspot.com/";
const DISMISS_STORAGE_KEY = "archive-banner-dismissed";

export function ArchiveBanner() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = window.localStorage.getItem(DISMISS_STORAGE_KEY);
    if (saved === "1") {
      setDismissed(true);
    }
  }, []);

  const handleClose = () => {
    setDismissed(true);
    window.localStorage.setItem(DISMISS_STORAGE_KEY, "1");
  };

  if (!mounted || dismissed) return null;

  return (
    <div className="bg-gray-100 py-2 text-sm text-gray-700">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="アーカイブ案内バナーを閉じる"
          onClick={handleClose}
          className="shrink-0 text-gray-500 transition-colors hover:text-gray-900"
        >
          ×
        </button>
        <p className="text-center">
          <Link
            href={ARCHIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            旧サイト(アーカイブ)
          </Link>
          をご覧になりたい場合は、
          <Link
            href={ARCHIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            こちら
          </Link>
          のリンクをご確認ください。
        </p>
      </div>
    </div>
  );
}
