import { PageHero } from "../_components/PageHero";
import Pagination from "../../components/Pagination";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop";

export default function CoffeeChatPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="カフェでの会話を想起させる写真"
        title="コーヒーチャット申し込み"
      />

      <div className="mx-auto max-w-4xl px-6 py-14 lg:px-8 lg:py-20">
        <div className="space-y-16">
          <section className="scroll-mt-20">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 sm:text-2xl">
              相談できること（例）
            </h2>
            <p className="leading-relaxed text-slate-600">
              出願戦略、学習・授業の実態、キャンパスの生活、家族帯同、キャリアチェンジ、就職活動の進め方など、
              在校生の一次情報をもとにカジュアルにお話しする場を想定しています。
            </p>
          </section>

          <section className="scroll-mt-20">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 sm:text-2xl">
              申し込みの流れ（モック）
            </h2>
            <ol className="space-y-3 text-slate-600">
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[#005543]" />
                <span>希望テーマ・希望日時・背景（簡単でOK）を入力</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[#005543]" />
                <span>在校生側でマッチング（業界・キャンパス等）</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[#005543]" />
                <span>Zoom / 対面で30分〜45分程度のコーヒーチャット</span>
              </li>
            </ol>
          </section>

          <section className="scroll-mt-20">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 sm:text-2xl">
              免責事項
            </h2>
            <p className="leading-relaxed text-slate-600">
              本ページはモックです。公式情報はINSEADオフィシャルサイトをご確認ください。
            </p>
          </section>

          <Pagination />
        </div>
      </div>
    </div>
  );
}

