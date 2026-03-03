"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import { NAVIGATION_CONFIG, type NavCategory } from "../../constants/navigationConfig";

const CATEGORIES = NAVIGATION_CONFIG;

function DesktopCategoryDropdown({ category }: { category: NavCategory }) {
  const hasChildren = category.pages.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={category.path}
        className="whitespace-nowrap rounded px-1.5 py-1 text-[13px] font-medium text-slate-600 transition-colors hover:text-[#005543]"
      >
        {category.path === "/" ? "Home" : category.label}
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={category.path}
        className="inline-flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-1 text-[13px] font-medium text-slate-600 transition-colors hover:text-[#005543]"
      >
        <span>{category.label}</span>
        <ChevronDown className="h-4 w-4 text-slate-400 transition group-hover:text-[#005543]" />
      </Link>

      {/* hover時の橋渡し領域を含むコンテナ */}
      <div className="pointer-events-none absolute left-0 top-full z-20 w-80 pt-2 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <div className="rounded-md border border-neutral-200 bg-white p-2 shadow-lg">
          <Link
            href={category.path}
            className="block rounded px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-neutral-50 hover:text-[#005543]"
          >
            {category.label} トップ
          </Link>
          <ul className="mt-1 space-y-0.5">
            {category.pages.map((page) => (
              <li key={page.path}>
                <Link
                  href={page.path}
                  className="block rounded py-2 pl-6 pr-3 text-sm text-slate-700 transition hover:bg-neutral-50 hover:text-[#005543]"
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DrawerNavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 py-2" aria-label="メインメニュー">
      {CATEGORIES.map((category) => (
        <div key={category.path} className="border-b border-neutral-100 pb-2">
          <Link
            href={category.path}
            onClick={onNavigate}
            className="block px-4 pt-3 pb-1 text-sm font-semibold text-slate-800 hover:text-[#005543]"
          >
            {category.path === "/" ? "ホームページ" : `${category.label} トップ`}
          </Link>
          {category.pages.length > 0 ? (
            <ul className="mt-0.5">
              {category.pages.map((page) => (
                <li key={page.path}>
                  <Link
                    href={page.path}
                    onClick={onNavigate}
                    className="block py-2 pl-6 pr-4 text-sm text-slate-700 hover:bg-neutral-50 hover:text-[#005543]"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
      <a
        href="#"
        className="mt-2 flex items-center gap-2 px-4 py-2.5 text-sm text-[#005543] hover:bg-neutral-50"
      >
        <ExternalLink className="h-4 w-4" />
        旧サイト(アーカイブ)
      </a>
    </nav>
  );
}

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <header className="sticky top-0 z-[1000] relative border-b border-neutral-200 bg-white/95 backdrop-blur-sm overflow-x-hidden md:overflow-visible">
      <div className="mx-auto max-w-6xl px-4 py-3 md:px-6 lg:px-8 lg:py-3.5">
        {/* Mobile */}
        <div className="flex min-w-0 items-center justify-between gap-3 md:hidden">
          <button
            type="button"
            aria-label="メニューを開く"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-slate-700 transition hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/40"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
            <Image
              src="/images/insead-official-logo.png"
              alt="INSEAD"
              width={48}
              height={48}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <span className="truncate font-[var(--font-noto-serif-jp)] text-xs font-medium tracking-wide text-slate-600">
              INSEAD日本人サイト(非公式)
            </span>
          </Link>
        </div>

        {/* Desktop / Tablet */}
        <div className="hidden min-w-0 items-start gap-4 md:flex">
          <Link href="/" className="shrink-0">
            <Image
              src="/images/insead-official-logo.png"
              alt="INSEAD"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="whitespace-nowrap font-[var(--font-noto-serif-jp)] text-sm font-medium tracking-wide text-slate-600"
              >
                INSEAD日本人サイト(非公式)
              </Link>
              <Link
                href="/coffee-chat"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#005543] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#004435] hover:shadow-lg"
              >
                <span>コーヒーチャット申込</span>
              </Link>
            </div>

            <nav className="mt-2 flex flex-wrap items-center gap-5">
              {CATEGORIES.map((category) => (
                <DesktopCategoryDropdown key={category.path} category={category} />
              ))}
              <a
                href="#"
                className="flex items-center gap-1.5 whitespace-nowrap text-[13px] text-[#005543] underline-offset-4 transition-colors hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>旧サイト(アーカイブ)</span>
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        role="presentation"
        aria-hidden={!drawerOpen}
        onClick={closeDrawer}
        className={`fixed inset-0 z-[1100] bg-black/45 transition-opacity duration-300 ease-out md:hidden ${
          drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile drawer */}
      <div
        aria-label="メニュー"
        aria-modal="true"
        role="dialog"
        className={`fixed inset-y-0 left-0 z-[1200] w-[min(280px,85vw)] max-w-[280px] bg-white shadow-xl transition-transform duration-300 ease-out md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">メニュー</span>
            <button
              type="button"
              aria-label="メニューを閉じる"
              onClick={closeDrawer}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition hover:bg-neutral-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <DrawerNavList onNavigate={closeDrawer} />
          </div>
        </div>
      </div>
    </header>
  );
}
