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
                  </L
