import { getStudentLifeSection } from "../../../constants/student-life-content";
import { PageHero } from "../../_components/PageHero";
import Pagination from "../../../components/Pagination";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop";
const P_CLASS = "leading-relaxed text-slate-600 sm:text-[15px]";

export default function CareerPage() {
  const section = getStudentLifeSection("career");
  if (!section) return null;
  const paragraphs = section.body.split(/\n\n+/).filter(Boolean);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero src={HERO_IMAGE_URL} alt="キャリア" title={section.title} />
      <div className="mx-auto max-w-4xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className={P_CLASS}>{p}</p>
          ))}
        </div>
        <Pagination />
      </div>
    </div>
  );
}
