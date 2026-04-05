"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { NAV_TREE, type NavNode } from "./navigation";

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

function FooterNodeList({
  items,
  pathname,
  level = 0,
}: {
  items: NavNode[];
  pathname: string;
  level?: number;
}) {
  return (
    <ul className={level === 0 ? "space-y-2" : "mt-1 space-y-1"}>
      {items.map((item) => {
        const nested = (item.children?.length ?? 0) > 0;
        return (
          <li key={item.label} className={level > 0 ? "pl-3" : undefined}>
            <Link
              href={item.href}
              className={`inline-flex items-center gap-2 text-sm underline-offset-4 transition hover:text-white hover:underline ${
                isPathActive(pathname, item.href) ? "text-white" : "text-white/80"
              }`}
            >
              <span className={nested ? "font-medium text-white/85" : undefined}>
                {item.label}
              </span>
            </Link>
            {nested ? (
              <FooterNodeList items={item.children!} pathname={pathname} level={level + 1} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function Footer() {
  const pathname = usePathname() ?? "/";
  const home = NAV_TREE.find((n) => n.href === "/");
  const primaryCategories = NAV_TREE.filter(
    (n) => n.href !== "/" && n.href !== "/coffee-chat"
  );
  const coffeeChat = NAV_TREE.find((n) => n.href === "/coffee-chat");

  return (
    <footer className="mt-16 bg-[#005543] text-white">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-8 md:col-span-3">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {primaryCategories.map((category) => (
                <div key={category.href} className="space-y-4">
                  <Link
                    href={category.href}
                    className={`inline-flex items-center gap-2 text-base font-semibold tracking-tight underline-offset-4 hover:underline ${
                      isPathActive(pathname, category.href) ? "text-white underline" : "text-white/90"
                    }`}
                  >
                    <span>{category.label}</span>
                  </Link>
                  {category.children ? (
                    <FooterNodeList items={category.children} pathname={pathname} />
                  ) : null}
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <Link
                href={coffeeChat?.href ?? "/coffee-chat"}
                className={`inline-flex items-center gap-2 text-base font-semibold tracking-tight underline-offset-4 hover:underline ${
                  isPathActive(pathname, coffeeChat?.href ?? "/coffee-chat")
                    ? "text-white underline"
                    : "text-white/90"
                }`}
              >
                <span>コーヒーチャット申込</span>
              </Link>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={coffeeChat?.href ?? "/coffee-chat"}
                    className={`text-sm underline-offset-4 transition hover:text-white hover:underline ${
                      isPathActive(pathname, coffeeChat?.href ?? "/coffee-chat")
                        ? "text-white"
                        : "text-white/80"
                    }`}
                  >
                    申し込みページへ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                Site
              </p>
              <Link
                href={home?.href ?? "/"}
                className={`text-sm font-medium underline-offset-4 transition hover:text-white hover:underline ${
                  isPathActive(pathname, home?.href ?? "/") ? "text-white" : "text-white/85"
                }`}
              >
                Home
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center rounded-full bg-white/10 p-2">
                <Image
                  src="/images/insead-official-logo.png"
                  alt="INSEAD"
                  width={48}
                  height={48}
                  className="h-10 w-10 object-contain"
                />
              </span>
              <div className="leading-snug">
                <p className="text-sm font-semibold tracking-tight">
                  INSIDE INSEAD
                </p>
                <p className="text-xs text-white/75">非公式日本人サイト</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-white/80">
              日本から世界へ。INSEADへの一歩を、先輩とともに。当サイトは日本人在校生による非公式コミュニティです。
            </p>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                External Links
              </p>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <a
                    href="https://www.insead.edu/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 underline-offset-4 transition hover:text-white hover:underline"
                  >
                    <span>INSEAD 公式サイト</span>
                    <ExternalLink className="h-4 w-4 text-white/70" />
                  </a>
                </li>
                <li>
                  <a
                    href={ARCHIVE_SITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 underline-offset-4 transition hover:text-white hover:underline"
                  >
                    <span>旧サイト(アーカイブ)</span>
                    <ExternalLink className="h-4 w-4 text-white/70" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/75 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 INSIDE INSEAD. All rights reserved.</p>
          <p>This is an unofficial community site and is not affiliated with INSEAD.</p>
        </div>
      </div>
    </footer>
  );
}

