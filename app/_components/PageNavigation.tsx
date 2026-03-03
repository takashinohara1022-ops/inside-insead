"use client";

import { usePathname } from "next/navigation";
import {
  getNavigationContext,
} from "../../constants/navigation-map";

const INSEAD_GREEN = "#005543";
const CATEGORY_GRAY = "#666666";

const mainLinkClass =
  "inline-flex items-center rounded px-2 py-2 text-sm md:text-base tracking-wide text-[#005543] transition-colors hover:bg-[#005543]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/30";
const subLinkClass =
  "inline-flex items-center rounded px-2 py-1.5 text-sm md:text-base text-[#666666] transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/20";

export function PageNavigation() {
  const pathname = usePathname();
  const path = pathname?.replace(/\/$/, "") || "";
  const ctx = path && path !== "/" ? getNavigationContext(path) : null;

  if (!ctx) return null;

  const isCategoryTop = ctx.isCategoryTop;

  // 上段（前後ページ）表示条件
  const hideTopPrev =
    (isCategoryTop && ctx.parentPath === "/about") ||
    (!isCategoryTop && ctx.isFirstChild);
  const hideTopNext =
    (isCategoryTop && ctx.isLastCategory) ||
    (!isCategoryTop && ctx.isLastCategory && ctx.isLastChild);

  const showTopPrev = !!ctx.pagePrev && !hideTopPrev;
  const showTopNext = !!ctx.pageNext && !hideTopNext;

  // 下段リンクの文言と遷移先
  const bottomLeftHref = isCategoryTop
    ? ctx.parentPath === "/about"
      ? "/"
      : (ctx.categoryPrev?.path ?? "/")
    : ctx.parentPath;
  const bottomLeftLabel = isCategoryTop
    ? ctx.parentPath === "/about"
      ? "<< ホーム画面へ"
      : "<< 前カテゴリートップへ"
    : "<< 本カテゴリートップへ";

  const bottomRightHref =
    ctx.categoryNext?.path ??
    ((isCategoryTop && ctx.isLastCategory) ||
    (!isCategoryTop && ctx.isLastCategory && ctx.isLastChild)
      ? "/"
      : null);
  const bottomRightLabel = bottomRightHref
    ? ctx.categoryNext
      ? "次カテゴリートップへ >>"
      : "ホーム画面へ >>"
    : null;

  return (
    <nav
      className="mt-12 border-t border-neutral-200 pt-8"
      aria-label="ページ・カテゴリー間のナビゲーション"
    >
      {/* 上段: 前後ページ + 本ページトップ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 basis-0">
          {showTopPrev && ctx.pagePrev ? (
            <a href={ctx.pagePrev.path} className={mainLinkClass} style={{ color: INSEAD_GREEN }}>
              &lt; 前のページへ: {ctx.pagePrev.label}
            </a>
          ) : (
            <span aria-hidden />
          )}
        </div>
        <div className="order-last w-full text-center sm:order-none sm:w-auto sm:flex-none">
          <button
            type="button"
            className={mainLinkClass}
            style={{ color: INSEAD_GREEN }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            本ページトップへ
          </button>
        </div>
        <div className="min-w-0 flex-1 basis-0 text-right">
          {showTopNext && ctx.pageNext ? (
            <a
              href={ctx.pageNext.path}
              className={`${mainLinkClass} ml-auto inline-flex`}
              style={{ color: INSEAD_GREEN }}
            >
              次のページへ: {ctx.pageNext.label} &gt;
            </a>
          ) : (
            <span aria-hidden />
          )}
        </div>
      </div>

      {/* 下段: カテゴリー遷移 */}
      <div className="mt-6 flex flex-col gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 basis-0">
          <a href={bottomLeftHref} className={subLinkClass} style={{ color: CATEGORY_GRAY }}>
            {bottomLeftLabel}
          </a>
        </div>
        <div className="min-w-0 flex-1 basis-0 text-right">
          {bottomRightHref && bottomRightLabel ? (
            <a
              href={bottomRightHref}
              className={`${subLinkClass} ml-auto inline-flex`}
              style={{ color: CATEGORY_GRAY }}
            >
              {bottomRightLabel}
            </a>
          ) : (
            <span aria-hidden />
          )}
        </div>
      </div>
    </nav>
  );
}
