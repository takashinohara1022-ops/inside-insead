"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPaginationContext } from "../constants/navigationConfig";

const TOP_LINK_CLASS =
  "inline-flex items-center rounded px-2 py-2 text-sm md:text-base text-[#005543] transition-colors hover:bg-[#005543]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/30";
const BOTTOM_LINK_CLASS =
  "inline-flex items-center rounded px-2 py-1.5 text-sm md:text-base text-[#666666] transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/20";

export default function Pagination() {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;

  const ctx = getPaginationContext(pathname);
  if (!ctx) return null;

  const isAboutTop = ctx.isCategoryTop && ctx.category.path === "/about";
  const isFinalTop = ctx.isCategoryTop && ctx.isLastCategory;
  const isFinalLeaf = !ctx.isCategoryTop && ctx.isLastCategory && ctx.isLastChild;

  const showTopPrev = ctx.prevPage && !(ctx.isCategoryTop ? isAboutTop : ctx.isFirstChild);
  const showTopNext = ctx.nextPage && !(ctx.isCategoryTop ? isFinalTop : isFinalLeaf);

  const leftBottomHref = ctx.isCategoryTop
    ? isAboutTop
      ? "/"
      : (ctx.prevCategoryTop?.path ?? "/")
    : ctx.category.path;
  const leftBottomLabel = ctx.isCategoryTop
    ? isAboutTop
      ? "<< ホーム画面へ"
      : "<< 前カテゴリートップへ"
    : "<< 本カテゴリートップへ";

  const rightBottomHref = ctx.nextCategoryTop?.path ?? (ctx.isLastCategory ? "/" : null);
  const rightBottomLabel =
    ctx.nextCategoryTop ? "次カテゴリートップへ >>" : "ホーム画面へ >>";

  return (
    <nav
      className="mt-12 border-t border-neutral-200 pt-8"
      aria-label="ページ送りナビゲーション"
    >
      {/* 上段 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 basis-0">
          {showTopPrev && ctx.prevPage ? (
            <Link href={ctx.prevPage.path} className={TOP_LINK_CLASS}>
              &lt; 前のページへ: {ctx.prevPage.title}
            </Link>
          ) : (
            <span aria-hidden />
          )}
        </div>
        <div className="order-last w-full text-center sm:order-none sm:w-auto sm:flex-none">
          <button
            type="button"
            className={TOP_LINK_CLASS}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            本ページトップへ
          </button>
        </div>
        <div className="min-w-0 flex-1 basis-0 text-right">
          {showTopNext && ctx.nextPage ? (
            <Link href={ctx.nextPage.path} className={`${TOP_LINK_CLASS} ml-auto inline-flex`}>
              次のページへ: {ctx.nextPage.title} &gt;
            </Link>
          ) : (
            <span aria-hidden />
          )}
        </div>
      </div>

      {/* 下段 */}
      <div className="mt-6 flex flex-col gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 basis-0">
          <Link href={leftBottomHref} className={BOTTOM_LINK_CLASS}>
            {leftBottomLabel}
          </Link>
        </div>
        <div className="min-w-0 flex-1 basis-0 text-right">
          {rightBottomHref ? (
            <Link href={rightBottomHref} className={`${BOTTOM_LINK_CLASS} ml-auto inline-flex`}>
              {rightBottomLabel}
            </Link>
          ) : (
            <span aria-hidden />
          )}
        </div>
      </div>
    </nav>
  );
}
