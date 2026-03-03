import { getAboutSection } from "../../../constants/about-content";
import { PageHero } from "../../_components/PageHero";
import Pagination from "../../../components/Pagination";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop";

const P_CLASS = "leading-relaxed text-slate-600 sm:text-[15px]";

export default function AboutProgramsPage() {
  const section = getAboutSection("programs");
  if (!section) return null;

  const paragraphs = section.body.split(/\n\n+/).filter(Boolean);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="キャンパスで学ぶ学生"
        title={section.title}
      />

      <div className="mx-auto max-w-4xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className={P_CLASS}>
              {p}
            </p>
          ))}
        </div>

        <Pagination />
      </div>
    </div>
  );
}
