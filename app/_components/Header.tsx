import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronRight, ExternalLink, Menu } from "lucide-react";
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

export function Header() {
  const overview = NAV_TREE.find((n) => n.href === "/about");
  const studentLife = NAV_TREE.find((n) => n.href === "/student-life");
  const alumni = NAV_TREE.find((n) => n.href === "/alumni");

  return (
    <header className="sticky top-0 z-50 relative border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 lg:px-8 lg:py-3.5">
        <div className="flex items-center gap-3">
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

          <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/insead-official-logo.png"
            alt="INSEAD"
            width={48}
            height={48}
            className="h-10 w-10 object-contain sm:h-12 sm:w-12"
          />
          <span className="whitespace-nowrap font-[var(--font-noto-serif-jp)] text-xs font-medium tracking-wide text-slate-600 sm:text-[13px]">
            INSEAD日本人サイト(非公式)
          </span>
        </Link>
        </div>

        <nav className="hidden items-center gap-7 text-[13px] font-medium text-slate-600 lg:flex">
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

        <Link
          href="/coffee-chat"
          className="ml-8 shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#005543] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#004435] hover:shadow-lg"
        >
          <span>コーヒーチャット申し込み</span>
        </Link>
      </div>
    </header>
  );
}
