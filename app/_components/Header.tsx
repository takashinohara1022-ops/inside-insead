"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import { NAVIGATION_CONFIG, type NavCategory } from "../../constants/navigationConfig";

const CATEGORIES = NAVIGATION_CONFIG;
const ARCHIVE_SITE_URL = "https://insideinseadjp-pre2025.blogspot.com/";

function normalizePath(path: string): string {
  return path.replace(/\/$/, "") || "/";
}

function isPathActive(currentPath: string, targetPath: string): boolean {
  const current = normalizePath(currentPath);
  const target = normalizePath(targetPath);
  if (target === "/") return current === "/";
  return current === target || current.startsWith(`${target}/`);
}

function DesktopCategoryDropdown({
  category,
  pathname,
}: {
  category: NavCategory;
  pathname: string;
}) {
  const hasChildren = category.pages.length > 0;
  const categoryActive = isPathActive(pathname, category.path);

  if (!hasChildren) {
    return (
      <Link
        href={category.path}
        className={`whitespace-nowrap rounded px-1.5 py-1 text-[13px] font-medium transition-colors hover:text-[#005543] ${
          categoryActive ? "text-[#005543] underline decoration-[#005543]/40 underline-offset-4" : "text-slate-600"
        }`}
      >
        {category.path === "/" ? "Home" : category.label}
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={category.path}
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-1 text-[13px] font-medium transition-colors hover:text-[#005543] ${
          categoryActive ? "text-[#005543] underline decoration-[#005543]/40 underline-offset-4" : "text-slate-600"
        }`}
      >
        <span>{category.label}</span>
        <ChevronDown
          className={`h-4 w-4 transition group-hover:text-[#005543] ${
            categoryActive ? "text-[#005543]" : "text-slate-400"
          }`}
        />
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
                  className={`block rounded py-2 pl-6 pr-3 text-sm transition hover:bg-neutral-50 hover:text-[#005543] ${
                    isPathActive(pathname, page.path)
                      ? "bg-neutral-50 font-semibold text-[#005543]"
                      : "text-slate-700"
                  }`}
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

function DrawerNavList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    CATEGORIES.forEach((category) => {
      state[category.path] = isPathActive(pathname, category.path);
    });
    return state;
  });

  return (
    <nav className="flex flex-col gap-1 py-2" aria-label="メインメニュー">
      {CATEGORIES.map((category) => (
        <div key={category.path} className="border-b border-neutral-100 pb-2">
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <Link
              href={category.path}
              onClick={onNavigate}
              className={`block text-sm font-semibold hover:text-[#005543] ${
                isPathActive(pathname, category.path) ? "text-[#005543]" : "text-slate-800"
              }`}
            >
              {category.path === "/" ? "ホームページ" : category.label}
            </Link>
            {category.pages.length > 0 ? (
              <button
                type="button"
                onClick={() =>
                  setOpenCategories((prev) => ({
                    ...prev,
                    [category.path]: !prev[category.path],
                  }))
                }
                aria-label={`${category.label}メニューを開閉`}
                aria-expanded={Boolean(openCategories[category.path])}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-neutral-100"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openCategories[category.path] ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
            ) : null}
          </div>
          {category.pages.length > 0 ? (
            <ul
              className={`mt-0.5 overflow-hidden transition-all duration-200 ${
                openCategories[category.path] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {category.pages.map((page) => (
                <li key={page.path}>
                  <Link
                    href={page.path}
                    onClick={onNavigate}
                    className={`block py-2 pl-6 pr-4 text-sm hover:bg-neutral-50 hover:text-[#005543] ${
                      isPathActive(pathname, page.path)
                        ? "font-semibold text-[#005543]"
                        : "text-slate-700"
                    }`}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
      <div className="
