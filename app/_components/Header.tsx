"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Menu, X } from "lucide-react";
import { NAV_TREE, type NavNode } from "./navigation";

function hasChildren(node: NavNode) {
  return (node.children?.length ?? 0) > 0;
}

function DropdownList({ items }: { items: NavNode[] }) {
  return (
    <ul className="mt-1 space-y-1">
      {items.map((item) => {
        const nested = hasChildren(item);
        return (
          <li key={item.label}>
            <a
              href={item.href}
              className="flex items-center justify-between gap-3 rounded px-2 py-2 text-sm text-slate-800 transition hover:bg-neutral-50 hover:text-[#005543]"
            >
              <span className={nested ? "font-medium" : undefined}>
                {item.label}
              </span>
              {nested ? (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              ) : null}
            </a>

            {nested ? (
              <ul className="mt-1 space-y-1 pl-4">
                {item.children!.map((child) => (
                  <li key={child.label}>
                    <a
                      href={child.href}
                      className="block rounded px-2 py-1.5 text-sm text-slate-700 transition hover:bg-neutral-50 hover:text-[#005543]"
                    >
                      {child.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function DrawerNavList({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 py-2" aria-label="メインメニュー">
      {NAV_TREE.map((node) => {
        const isHome = node.href === "/";
        const hasChildren = (node.children?.length ?? 0) > 0;

        if (isHome) {
          return (
            <div key={node.href} className="border-b border-neutral-100 pb-2">
              <p className="mb-1 px-4 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Home
              </p>
              <Link
                href="/"
                onClick={onNavigate}
                className="block px-4 py-2.5 text-sm text-slate-800 hover:bg-neutral-50 hover:text-[#005543]"
              >
                トップページ
              </Link>
              <Link
                href="/#class-profile"
                onClick={onNavigate}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-neutral-50 hover:text-[#005543]"
              >
                在校生プロフィール内訳 (Class Profile)
              </Link>
              <Link
                href="/#latest-updates"
                onClick={onNavigate}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-neutral-50 hover:text-[#005543]"
              >
                最新のアップデート (Latest Updates)
              </Link>
              <Link
                href="/#rankings"
                onClick={onNavigate}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-neutral-50 hover:text-[#005543]"
              >
                世界ランキングの実績 (Global Rankings)
              </Link>
              <Link
                href="/#sponsors"
                onClick={onNavigate}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-neutral-50 hover:text-[#005543]"
              >
                スポンサー企業
              </Link>
            </div>
          );
        }

        if (!hasChildren) {
          return (
            <Link
              key={node.href}
              href={node.href}
              onClick={onNavigate}
              className="block px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-neutral-50 hover:text-[#005543]"
            >
              {node.label}
            </Link>
          );
        }

        return (
          <div key={node.href} className="border-b border-neutral-100 pb-2">
            <Link
              href={node.href}
              onClick={onNavigate}
              className="block px-4 pt-3 pb-1 text-sm font-semibold text-slate-800 hover:text-[#005543]"
            >
              {node.label}
            </Link>
            <ul className="mt-0.5">
              {node.children!.map((child) => (
                <li key={child.label}>
                  <Link
                    href={child.href}
                    onClick={onNavigate}
                    className="block py-2 pl-6 pr-4 text-sm text-slate-700 hover:bg-neutral-50 hover:text-[#005543]"
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
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
  const overview = NAV_TREE.find((n) => n.href === "/about");
  const studentLife = NAV_TREE.find((n) => n.href === "/student-life");
  const alumni = NAV_TREE.find((n) => n.href === "/alumni");

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
    <header className="sticky top-0 z-50 relative border-b border-neutral-200 bg-white/95 backdrop-blur-sm overflow-x-hidden md:overflow-visible">
      <div className="mx-auto flex max-w-6xl min-w-0 items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8 lg:py-3.5">
        {/* 左側：ハンバーガー（モバイルのみ）＋ メガメニュー（PC lgのみ）＋ ロゴ */}
        <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-initial">
          {/* モバイル用ハンバーガー（md未満で表示、md以上で非表示） */}
          <button
            type="button"
            aria-label="メニューを開く"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-slate-700 transition hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/40 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block">
            <div className="group">
              <button
                type="button"
                aria-label="サイトメニュー"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-white text-slate-700 shadow-sm transition hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005543]/40"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Mega menu */}
              <div className="pointer-events-none absolute left-0 right-0 top-full mt-2 translate-y-1 rounded-md border border-neutral-200 bg-white p-0 text-slate-800 opacity-0 shadow-lg transition duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
                  <div className="grid gap-8 md:grid-cols-4">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Home
                      </p>
                      <Link
                        href="/"
                        className="inline-flex rounded px-2 py-1.5 text-sm font-medium text-slate-800 transition hover:bg-neutral-50 hover:text-[#005543]"
                      >
                        トップページ
                      </Link>
                      <Link
                        href="/#class-profile"
                        className="block rounded px-2 py-1.5 text-sm text-slate-700 transition hover:bg-neutral-50 hover:text-[#005543]"
                      >
                        在校生プロフィール内訳 (Class Profile)
                      </Link>
                      <Link
                        href="/#latest-updates"
                        className="block rounded px-2 py-1.5 text-sm text-slate-700 transition hover:bg-neutral-50 hover:text-[#005543]"
                      >
                        最新のアップデート (Latest Updates)
                      </Link>
                      <Link
                        href="/#rankings"
                        className="block rounded px-2 py-1.5 text-sm text-slate-700 transition hover:bg-neutral-50 hover:text-[#005543]"
                      >
                        世界ランキングの実績 (Global Rankings)
                      </Link>
                      <Link
                        href="/#sponsors"
                        className="block rounded px-2 py-1.5 text-sm text-slate-700 transition hover:bg-neutral-50 hover:text-[#005543]"
                      >
                        スポンサー企業
                      </Link>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        概要
                      </p>
                      {overview?.children ? (
                        <DropdownList items={overview.children} />
                      ) : null}
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        学校生活
                      </p>
                      {studentLife?.children ? (
                        <DropdownList items={studentLife.children} />
                      ) : null}
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        在校生
                      </p>
                      {alumni?.children ? (
                        <DropdownList items={alumni.children} />
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-slate-500">
                    <span>サイト全体の構造</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link href="/" className="flex min-w-0 shrink items-center gap-2 md:gap-3">
            <Image
              src="/images/insead-official-logo.png"
              alt="INSEAD"
              width={48}
              height={48}
              className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
            />
            <span className="truncate font-[var(--font-noto-serif-jp)] text-xs font-medium tracking-wide text-slate-600 sm:text-[13px] md:whitespace-nowrap">
              INSEAD日本人サイト(非公式)
            </span>
          </Link>
        </div>

        {/* PC用ナビ（md未満で非表示、md以上で表示） */}
        <nav className="hidden items-center gap-7 text-[13px] font-medium text-slate-600 md:flex">
          {NAV_TREE.map((node) => {
            const dropdown = hasChildren(node);
            const isHome = node.href === "/";

            if (isHome) {
              return (
                <div key={node.href} className="group relative">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-[#005543]"
                  >
                    <span>{node.label}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400 transition group-hover:text-[#005543]" />
                  </Link>
                  <div className="pointer-events-none absolute left-0 top-[calc(100%+10px)] z-10 w-56 translate-y-1 rounded-lg border border-neutral-200 bg-white py-1 opacity-0 shadow-lg transition duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <Link
                      href="/#class-profile"
                      className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-neutral-50 hover:text-[#005543]"
                    >
                      在校生プロフィール内訳 (Class Profile)
                    </Link>
                    <Link
                      href="/#latest-updates"
                      className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-neutral-50 hover:text-[#005543]"
                    >
                      最新のアップデート (Latest Updates)
                    </Link>
                    <Link
                      href="/#rankings"
                      className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-neutral-50 hover:text-[#005543]"
                    >
                      世界ランキングの実績 (Global Rankings)
                    </Link>
                    <Link
                      href="/#sponsors"
                      className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-neutral-50 hover:text-[#005543]"
                    >
                      スポンサー企業
                    </Link>
                  </div>
                </div>
              );
            }

            if (!dropdown) {
              return (
                <Link
                  key={node.href}
                  href={node.href}
                  className="whitespace-nowrap transition-colors hover:text-[#005543]"
                >
                  {node.label}
                </Link>
              );
            }

            return (
              <div key={node.href} className="group relative">
                <Link
                  href={node.href}
                  className="inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-[#005543]"
                >
                  <span>{node.label}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400 transition group-hover:text-[#005543]" />
                </Link>

                <div className="pointer-events-none absolute left-0 top-[calc(100%+10px)] w-80 translate-y-1 rounded-md border border-neutral-200 bg-white p-3 text-slate-800 opacity-0 shadow-lg transition duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <p className="px-2 py-1 text-xs font-semibold text-slate-500">
                    {node.label}
                  </p>
                  <DropdownList items={node.children!} />
                </div>
              </div>
            );
          })}
          <a
            href="#"
            className="flex items-center gap-1.5 whitespace-nowrap text-[#005543] underline-offset-4 transition-colors hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>旧サイト(アーカイブ)</span>
          </a>
        </nav>

        {/* コーヒーチャット申し込み（md未満では非表示、ドロワー内にリンクあり） */}
        <Link
          href="/coffee-chat"
          className="hidden shrink-0 items-center gap-1.5 rounded-full bg-[#005543] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#004435] hover:shadow-lg md:ml-4 md:inline-flex lg:ml-8"
        >
          <span>コーヒーチャット申し込み</span>
        </Link>
      </div>

      {/* モバイル用ドロワー：オーバーレイ */}
      <div
        role="presentation"
        aria-hidden={!drawerOpen}
        onClick={closeDrawer}
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ease-out md:hidden ${
          drawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* モバイル用ドロワー：パネル */}
      <div
        aria-label="メニュー"
        aria-modal="true"
        role="dialog"
        className={`fixed inset-y-0 left-0 z-[70] w-[min(280px,85vw)] max-w-[280px] bg-white shadow-xl transition-transform duration-300 ease-out md:hidden ${
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
