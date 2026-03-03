import { PageHero } from "../../_components/PageHero";
import { PageNavigation } from "../../_components/PageNavigation";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop";

const H2_CLASS = "text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl";
const H3_CLASS = "text-xl font-bold tracking-tight text-slate-900 sm:text-2xl";
const P_CLASS = "leading-relaxed text-slate-700 sm:text-[15px]";
const LI_CLASS = "leading-relaxed text-slate-700 sm:text-[15px]";

export default function AboutHistoryPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="フォンテーヌブロー風の歴史的建物"
        title="INSEADの歴史"
      />

      <div className="mx-auto max-w-4xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="space-y-8">
          <p className={P_CLASS}>
            あなたがこれから足を踏み入れようとしているのは、単なる「世界トップクラスのビジネススクール」ではありません。そこは、二度の世界大戦によって焼け野原となった欧州において、「二度と悲惨な戦争を繰り返さない」という悲願のもと、ビジネスを通じた平和と統合を目指して創設された学び舎です。
          </p>
          <p className={P_CLASS}>
            INSEADの歴史を知ることは、なぜ数あるMBAプログラムの中からこの特異な学校を選び、そこで何を学ぶべきかを深く理解するための第一歩となります。約70年にわたるその重厚な軌跡を、ここに紐解いていきましょう。
          </p>

          <section className="space-y-4">
            <h2 className={H2_CLASS}>焦土の中から生まれた「平和への哲学」（1950年代）</h2>
            <p className={P_CLASS}>
              INSEADの物語は、1950年代の欧州、すなわち第二次世界大戦の爪痕が深く残る時代に幕を開けます。当時、欧州は分断され、かつての列強国はその経済的・政治的影響力を大きく失っていました。
            </p>
            <p className={P_CLASS}>
              この状況に強い危機感を抱いていたのが、INSEADの「父」と呼ばれるジョルジュ・ドリオ（Georges Doriot）です。フランス出身でありながら米国ハーバード・ビジネス・スクール（HBS）で教鞭を執り、「ベンチャーキャピタルの父」とも称されるドリオは、欧州の復興には「国境や文化の壁を越えて協力し合える、新しい時代のビジネスリーダー」が不可欠であると確信していました。
            </p>
            <p className={P_CLASS}>
              当時のビジネスエリート教育は米国式の独壇場でしたが、ドリオは欧州の多様性を活かした独自の教育機関が必要だと考えました。そして1957年、欧州経済共同体（EEC）の設立を定めた「ローマ条約」が調印された直後、パリ商工会議所の支援を受け、INSEAD（Institut Europeen d&apos;Administration des Affaires: 欧州経営大学院）は産声を上げました。その根底には、「国境を越えたビジネスの繋がりこそが、国家間の理解を深め、平和の礎となる」という切実な願いが込められています。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className={H2_CLASS}>常識を覆す「3つの革命」（1959年以降）</h2>
            <p className={P_CLASS}>
              創設間もないINSEADは、当時のビジネス教育の常識を塗り替える改革を次々に打ち出しました。特に以下の3点は、現在のINSEADらしさを形づくる決定的な転換点でした。
            </p>
            <ul className="list-disc space-y-3 pl-6">
              <li className={LI_CLASS}>
                <span className="font-semibold text-slate-900">国際性を前提にした学生構成</span>
                ：単一国籍に偏らない入学方針を採用し、多様な価値観の交差そのものを学習資源にしました。
              </li>
              <li className={LI_CLASS}>
                <span className="font-semibold text-slate-900">英語中心の実践教育</span>
                ：多国籍な議論を可能にするため英語を軸に据え、ケースメソッドを通じて意思決定の質を鍛える設計を徹底しました。
              </li>
              <li className={LI_CLASS}>
                <span className="font-semibold text-slate-900">欧州発のグローバル経営思想</span>
                ：単なる米国モデルの模倣ではなく、複数市場・複数文化を行き来するリーダーを育てる独自の教育哲学を確立しました。
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-5 sm:p-6">
            <h3 className={`${H3_CLASS} mb-3`}>情報ソース</h3>
            <p className={P_CLASS}>
              本ページの記述は、INSEAD公式サイトで公開されている沿革情報、創設に関する公開資料、ならびにビジネススクール史に関する一般公開情報を基に再構成しています。最新情報は必ずINSEAD公式情報をご確認ください。
            </p>
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h3 className={`${H3_CLASS} mb-3`}>受験を控えるあなたへ</h3>
            <p className={P_CLASS}>
              INSEADはランキングの高さだけで語り切れない学校です。なぜこの学校が生まれ、どんな価値観を守ってきたのかを理解することは、志望理由書や面接での説得力を高めるだけでなく、入学後に何を学び取りたいのかを自分の言葉で語るための土台になります。歴史を知ることは、あなた自身の未来の選択をより深く、確かなものにしてくれます。
            </p>
          </section>
        </div>

        <PageNavigation />
      </div>
    </div>
  );
}
