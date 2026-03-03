"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getNavigationContext,
  type NavigationContext,
} from "../../constants/navigation-map";

const INSEAD_GREEN = "#005543";
const CATEGORY_GRAY = "#666666";

/** 1段目：セクション内ナビ（標準サイズ・グリーン） */
const sectionLinkBase =
  "inline-flex items-center gap-1 rounded px-2 py-2 text-[15px] tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/30 group";

const sectionLinkClass = `${sectionLinkBase} hover:bg-[#005543]/5`;
const sectionCenterClass = `${sectionLinkBase} text-[#005543] hover:bg-[#005543]/5`;

/** 2段目：カテゴリーナビ（小さめ・グレー） */
const categoryLinkBase =
  "inline-flex items-center gap-1 rounded px-2 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/20";
const categoryLinkClass = `${categoryLinkBase} hover:bg-neutral-100`;

function SectionNavRow({ ctx }: { ctx: NavigationContext }) {
  const hasPrev = !!ctx.sectionPrev;
  const hasNext = !!ctx.sectionNext;
  const showCenter = true;

  const showRow = hasPrev || hasNext || showCenter;
  if (!showRow) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1 basis-0">
        {hasPrev && ctx.sectionPrev ? (
          <Link
            href={ctx.sectionPrev.path}
            className={`${sectionLinkClass} text-[#005543]`}
            style={{ color: INSEAD_GREEN }}
          >
            <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            <span>&lt; 前のページへ</span>
          </Link>
        ) : (
          <span aria-hidden />
        )}
      </div>
      <div className="order-last w-full flex-shrink-0 sm:order-none sm:w-auto sm:flex-none">
        <Link
          href={ctx.parentPath}
          className={`${sectionCenterClass} justify-center sm:inline-flex`}
          style={{ color: INSEAD_GREEN }}
        >
          {ctx.parentLabel}の一覧へ
        </Link>
      </div>
      <div className="min-w-0 flex-1 basis-0 text-right">
        {hasNext && ctx.sectionNext ? (
          <Link
            href={ctx.sectionNext.path}
            className={`${sectionLinkClass} ml-auto inline-flex sm:justify-end text-[#005543]`}
            style={{ color: INSEAD_GREEN }}
          >
            <span>次のページ：{ctx.sectionNext.label}へ</span>
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        ) : (
          <span aria-hidden />
        )}
      </div>
    </div>
  );
}

function CategoryNavRow({ ctx }: { ctx: NavigationContext }) {
  const prevLabel =
    ctx.categoryPrev?.path === "/"
      ? "HOMEへ"
      : ctx.categoryPrev
        ? `前のカテゴリー：${ctx.categoryPrev.label}へ`
        : null;
  const hasPrev = !!ctx.categoryPrev;
  const hasNext = !!ctx.categoryNext;

  if (!hasPrev && !hasNext) return null;

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1 basis-0">
        {hasPrev && ctx.categoryPrev ? (
          <Link
            href={ctx.categoryPrev.path}
            className={categoryLinkClass}
            style={{ color: CATEGORY_GRAY }}
          >
            <span className="text-[13px] sm:text-sm">&lt;&lt; {prevLabel}</span>
          </Link>
        ) : (
          <span aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1 basis-0 text-right">
        {hasNext && ctx.categoryNext ? (
          <Link
            href={ctx.categoryNext.path}
            className={`${categoryLinkClass} ml-auto inline-flex sm:justify-end`}
            style={{ color: CATEGORY_GRAY }}
          >
            <span className="text-[13px] sm:text-sm">次のカテゴリー：{ctx.categoryNext.label}へ &gt;&gt;</span>
          </Link>
        ) : (
          <span aria-hidden />
        )}
      </div>
    </div>
  );
}

export function PageNavigation() {
  const pathname = usePathname();
  const path = pathname?.replace(/\/$/, "") || "";
  const ctx = path && path !== "/" ? getNavigationContext(path) : null;

  if (!ctx) return null;

  const hasSectionNav =
    ctx.sectionPrev || ctx.sectionNext || ctx.parentPath !== path;
  const hasCategoryNav = !!ctx.categoryPrev || !!ctx.categoryNext;

  if (!hasSectionNav && !hasCategoryNav) return null;

  return (
    <nav
      className="mt-12 border-t border-neutral-200 pt-8"
      aria-label="ページ・カテゴリー間のナビゲーション"
    >
      {/* 1段目：セクション内ナビ */}
      {(ctx.sectionPrev || ctx.sectionNext || ctx.parentLabel) && (
        <SectionNavRow ctx={ctx} />
      )}
      {/* 2段目：カテゴリーナビ */}
      <CategoryNavRow ctx={ctx} />
    </nav>
  );
}
