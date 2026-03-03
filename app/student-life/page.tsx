import Link from "next/link";
import {
  getExcerpt,
  STUDENT_LIFE_SECTIONS,
} from "../../constants/student-life-content";
import { PageHero } from "../_components/PageHero";
import { PageNavigation } from "../_components/PageNavigation";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop";

const SECTION_HEADING_CLASS =
  "text-lg font-semibold tracking-tight text-slate-900 sm:text-xl transition-colors hover:text-[#005543]";
const BODY_TEXT_CLASS = "leading-relaxed text-slate-600 sm:text-[15px]";

export default function StudentLifePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="学生が教室やキャンパスで議論・談笑している様子"
        title="学校生活"
      />

      <div className="mx-auto max-w-4xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="space-y-12">
          {STUDENT_LIFE_SECTIONS.map((section) => {
            const excerpt = getExcerpt(section.body, 3);
            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-20 border-b border-neutral-200 pb-12 last:border-b-0 last:pb-0"
              >
                <h2 className="mb-4">
                  <Link href={section.href} className={SECTION_HEADING_CLASS}>
                    {section.title}
                  </Link>
                </h2>
                <p className={`${BODY_TEXT_CLASS} line-clamp-3`}>{excerpt}</p>
                <Link
                  href={section.href}
                  className="mt-3 inline-block text-sm font-medium text-[#005543] transition-colors hover:underline"
                >
                  ...つづきを見る
                </Link>
              </section>
            );
          })}
        </div>
        <PageNavigation />
      </div>
    </div>
  );
}
