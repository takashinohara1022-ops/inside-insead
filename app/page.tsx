import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Coffee, Users } from "lucide-react";
import { ClassProfileDashboard } from "./_components/ClassProfileDashboard";
import { GlobalRankingsChart } from "./_components/GlobalRankingsChart";
import { LatestUpdates } from "./_components/LatestUpdates";

const SECTION_HEADING_CLASS =
  "mb-6 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl";

const TOP_SPONSORS = [
  { id: "1", name: "グローバル戦略コンサル" },
  { id: "2", name: "日系グローバル企業" },
  { id: "3", name: "MBA 受験予備校 / メディア" },
];

const REGULAR_SPONSORS = [
  { id: "4", name: "金融機関 A" },
  { id: "5", name: "テクノロジー企業 B" },
  { id: "6", name: "コンサルティング C" },
  { id: "7", name: "メディア・出版 D" },
  { id: "8", name: "人材サービス E" },
  { id: "9", name: "製造業 F" },
  { id: "10", name: "商社 G" },
  { id: "11", name: "スタートアップ H" },
  { id: "12", name: "公共・NPO I" },
  { id: "13", name: "その他 J" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="relative isolate">
        {/* Hero: full-width image with overlay and copy */}
        <section className="relative w-full min-w-0 overflow-hidden" aria-label="ヒーロー">
          <div className="relative h-[min(70vh,32rem)] w-full max-w-[100vw] overflow-hidden sm:h-[min(72vh,36rem)]">
            <Image
              src="/images/hero-fontainebleau.png"
              alt="INSEAD フォンテンブローキャンパス"
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority
            />
            <div
              className="absolute inset-0 bg-black/30"
              aria-hidden
            />
            <div className="absolute inset-0 flex flex-col justify-end px-4 pb-16 pt-24 sm:px-10 sm:pb-20 sm:pt-28 lg:px-14 lg:pb-24 lg:pt-32">
              <div className="mx-auto w-full max-w-6xl min-w-0">
                <p
                  className="mb-6 text-[11px] font-medium uppercase tracking-[0.28em] text-white/95 sm:mb-8 sm:text-xs sm:tracking-[0.32em]"
                  style={{
                    textShadow:
                      "0 1px 2px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  INSEAD
                </p>
                <h1
                  className="max-w-4xl break-words text-4xl font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl lg:tracking-[-0.03em]"
                  style={{
                    textShadow:
                      "0 2px 4px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4), 0 0 1px rgba(0,0,0,0.5)",
                  }}
                >
                  The Business School for the World.
                </h1>
                <div className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center">
                  <Link
                    href="/coffee-chat"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#005543] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#004435]"
                  >
                    <Coffee className="h-4 w-4" />
                    <span>コーヒーチャットを予約する</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/alumni"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/80 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    <Users className="h-4 w-4" />
                    <span>在校生・卒業生を検索</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* このサイトについて (About This Site) */}
        <section className="border-b border-neutral-200 bg-stone-50 px-6 pt-12 pb-6 sm:px-8 lg:px-12" aria-label="このサイトについて">
          <div className="mx-auto max-w-4xl">
            <p className="leading-relaxed text-slate-600 sm:text-[15px]">
              このサイトは、INSEAD入学希望者の皆様に対する情報提供を目的とした、日本人在校生による非公式サイトです。INSEADが入学希望者向けに開催しているInformation Session等、学校・出願に関わる公式情報につきましては、INSEADオフィシャルサイトをご確認ください。
            </p>
          </div>
        </section>

        <div className="relative mx-auto flex min-h-0 flex-col max-w-6xl px-6 pt-12 pb-10 lg:px-8 lg:pt-14 lg:pb-14">
          {/* 在校生プロフィール内訳 (Class Profile) */}
          <section id="class-profile" className="scroll-mt-20 mt-12 first:mt-0" aria-labelledby="class-profile-heading">
            <h2 id="class-profile-heading" className={SECTION_HEADING_CLASS}>
              在校生プロフィール内訳 (Class Profile)
            </h2>
            <ClassProfileDashboard />
          </section>
          <main className="flex flex-1 flex-col gap-12 lg:gap-16 mt-12 lg:mt-16">
            <LatestUpdates />

            <section
              id="rankings"
              aria-labelledby="rankings-heading"
              className="scroll-mt-20 space-y-6"
            >
              <h2 id="rankings-heading" className={SECTION_HEADING_CLASS}>
                世界ランキングの実績 (Global Rankings)
              </h2>
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-lg sm:p-6">
                <GlobalRankingsChart />
              </div>
            </section>

            <section
              id="sponsors"
              aria-labelledby="sponsors-heading"
              className="scroll-mt-20 mb-8 space-y-6"
            >
              <h2 id="sponsors-heading" className={SECTION_HEADING_CLASS}>
                スポンサー企業
              </h2>
              <p className="-mt-2 mb-4 text-[11px] text-slate-500">
                日本からの留学を支える企業・団体との連携を構想中です。
              </p>

              {/* 1段目: 上位スポンサー（3社・均等） */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {TOP_SPONSORS.map((s) => (
                  <div
                    key={s.id}
                    className="flex min-h-[7rem] items-center justify-center rounded-xl border border-neutral-200 bg-white px-6 py-8 shadow-sm sm:min-h-[8rem]"
                  >
                    <span className="text-center text-xs text-slate-600 sm:text-[13px]">
                      {s.name}
                      <span className="ml-1 text-slate-400">様</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* 2段目以降: 一般スポンサー（5社/行・均等） */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {REGULAR_SPONSORS.map((s) => (
                  <div
                    key={s.id}
                    className="flex min-h-[4.5rem] items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-5 shadow-sm"
                  >
                    <span className="text-center text-[11px] text-slate-600 sm:text-xs">
                      {s.name}
                      <span className="ml-1 text-slate-400">様</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
