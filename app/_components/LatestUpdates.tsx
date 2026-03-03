import Link from "next/link";
import Image from "next/image";

const LATEST_UPDATES_DATA = [
  {
    id: "1",
    title: "INSEAD 26D キャンパスライフ体験記",
    category: "Blog",
    excerpt:
      "フォンテンブローでの初学期を終えて。チームワーク、マルチカルチャルな学び、そして家族帯同の実体験をお伝えします。",
    date: "20 Apr 2026",
    batch: "26D",
    href: "/students/blog",
    imageSrc: "/images/hero-chateau.png", // プレースホルダー：差し替え可能
  },
  {
    id: "2",
    title: "出願から合格まで — 私のINSEAD受験ストーリー",
    category: "Update",
    excerpt:
      "GMAT対策、エッセイ戦略、インタビュー準備。非コンサル・非金融出身での合格までの道のりを振り返ります。",
    date: "12 Apr 2026",
    batch: "26J",
    href: "/students/blog",
    imageSrc: "/images/hero-chateau.png", // プレースホルダー：差し替え可能
  },
  {
    id: "3",
    title: "シンガポールキャンパス滞在レポート",
    category: "Blog",
    excerpt:
      "P4・P5でシンガポールに滞在。アジアでのネットワーク構築と、日本とは異なるビジネス視点を学んだ体験をまとめました。",
    date: "5 Apr 2026",
    batch: "25J",
    href: "/students/blog",
    imageSrc: "/images/hero-chateau.png", // プレースホルダー：差し替え可能
  },
];

function CardHeaderGraphic({ id }: { id: string }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 320 120"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id={`greenYellow-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#005543" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#2d7a6a" stopOpacity="0.85" />
          <stop offset="85%" stopColor="#facc15" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* 同心円状の半円グラフィック */}
      <path
        d="M -20 80 A 180 180 0 0 1 340 80"
        fill="none"
        stroke={`url(#greenYellow-${id})`}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M 0 90 A 140 140 0 0 1 320 90"
        fill="none"
        stroke={`url(#greenYellow-${id})`}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M 20 98 A 100 100 0 0 1 300 98"
        fill="none"
        stroke={`url(#greenYellow-${id})`}
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LatestUpdates() {
  return (
    <section
      id="latest-updates"
      className="scroll-mt-20 space-y-6"
      aria-labelledby="latest-updates-heading"
    >
      <h2
        id="latest-updates-heading"
        className="mb-6 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
      >
        最新のアップデート (Latest Updates)
      </h2>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
        {LATEST_UPDATES_DATA.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md transition-shadow hover:shadow-lg"
          >
            {/* カード上部ビジュアル: 画像 + 緑〜黄の同心円/半円グラフィック */}
            <div className="relative h-36 w-full overflow-hidden bg-[#005543]">
              <Image
                src={item.imageSrc}
                alt=""
                fill
                className="object-cover object-center opacity-60"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <CardHeaderGraphic id={item.id} />
            </div>

            {/* コンテンツ */}
            <div className="relative flex flex-1 flex-col px-5 pb-5 pt-4">
              <span className="mb-2 inline-flex w-fit rounded bg-amber-300 px-2 py-0.5 text-[11px] font-semibold text-slate-900">
                {item.category}
              </span>
              <h3 className="mb-2 font-bold leading-snug text-slate-900 line-clamp-2">
                {item.title}
              </h3>
              <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600 line-clamp-3">
                {item.excerpt}
              </p>
              <p className="mb-4 text-[11px] text-slate-500">
                {item.date}
                <span className="ml-2 rounded bg-neutral-100 px-2 py-0.5 font-medium text-slate-700">
                  {item.batch}
                </span>
              </p>

              {/* 右下のナビゲーションボタン */}
              <div className="flex justify-end">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#005543] text-white transition-colors group-hover:bg-[#004435]"
                  aria-hidden
                >
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* セクション下部CTA */}
      <Link
        href="/students/blog"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#005543] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#004435]"
      >
        <span>最新情報をすべて見る</span>
        <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
