import Link from "next/link";
import { getCategoryByPath } from "../../constants/navigationConfig";
import { ALUMNI_SECTIONS } from "../../constants/alumni-content";
import { PageHero } from "../_components/PageHero";
import Pagination from "../../components/Pagination";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop";

const SECTION_HEADING_CLASS =
  "text-lg font-semibold tracking-tight text-slate-900 sm:text-xl transition-colors hover:text-[#005543]";
const BODY_TEXT_CLASS = "leading-relaxed text-slate-600 sm:text-[15px]";

function excerptFromBody(body: string, maxChars = 160): string {
  const normalized = body.replace(/\s+/g, " ").trim();
  return normalized.length > maxChars
    ? `${normalized.slice(0, maxChars).trim()}...`
    : normalized;
}

function getStudentsExcerpt(path: string): string {
  const section = ALUMNI_SECTIONS.find((s) => s.href === path);
  return section ? excerptFromBody(section.body, 160) : "";
}

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
                  {getStudentsExcerpt(page.path) || page.description}
                </p>
                <Link
                  href={page.path}
                  className="mt-3 inline-block text-sm font-medium text-[#005543] transition-colors hover:underline"
                >
                  ...つづきを見る
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
