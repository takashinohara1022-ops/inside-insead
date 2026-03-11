import Link from "next/link";
import { getCategoryByPath } from "../../constants/navigationConfig";
import { PageHero } from "../_components/PageHero";
import Pagination from "../../components/Pagination";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop";

const SECTION_HEADING_CLASS =
  "text-lg font-semibold tracking-tight text-slate-900 sm:text-xl transition-colors hover:text-[#005543]";
const BODY_TEXT_CLASS = "leading-relaxed text-slate-600 sm:text-[15px]";

const STUDENTS_TOP_CONTENT: Record<string, { description: string; buttonLabel: string }> = {
  "/students/profiles": {
    description:
      "在校生の経歴、受験スコア、志望動機を一覧公開しています。業界、キャンパス、社費・私費などの条件で絞り込み検索することができます。",
    buttonLabel: "在校生プロフィール一覧を閲覧する",
  },
  "/students/blog": {
    description:
      "在校生が、日々の学生生活やアプリケーションプロセスの振り返り、将来の展望等についてのブログを書きます。公式情報だけでは伝わらない、INSEADのリアルな日常をお届けします。",
    buttonLabel: "在校生ブログを読む",
  },
};

export default function StudentsPage() {
  const category = getCategoryByPath("/students");
  if (!category) return null;

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="学生同士がカフェで談笑しているイメージ"
        title={category.label}
      />

      <div className="mx-auto max-w-4xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="space-y-12">
          {category.pages.map((page) => {
            return (
              <section
                key={page.path}
                className="scroll-mt-20 border-b border-neutral-200 pb-12 last:border-b-0 last:pb-0"
              >
                <h2 className="mb-4">
                  <Link href={page.path} className={SECTION_HEADING_CLASS}>
                    {page.title}
                  </Link>
                </h2>
                <p className={`${BODY_TEXT_CLASS} line-clamp-3`}>
                  {STUDENTS_TOP_CONTENT[page.path]?.description ?? page.description}
                </p>
                <Link
                  href={page.path}
                  className="mt-3 inline-block text-sm font-medium text-[#005543] transition-colors hover:underline"
                >
                  {STUDENTS_TOP_CONTENT[page.path]?.buttonLabel ?? "詳細を見る"}
                </Link>
              </section>
            );
          })}
        </div>
        <Pagination />
      </div>
    </div>
  );
}
