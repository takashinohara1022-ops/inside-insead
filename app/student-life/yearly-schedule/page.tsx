import { getStudentLifeSection } from "../../../constants/student-life-content";
import { PageHero } from "../../_components/PageHero";
import Pagination from "../../../components/Pagination";
import { fetchPageMainContent } from "../../../lib/pageContentDocs";
import { PageMarkdownContent } from "../../_components/PageMarkdownContent";

const HERO_IMAGE_URL = "/images/student-life-yearly-schedule-hero.png";
export default async function YearlySchedulePage() {
  const section = getStudentLifeSection("yearly-schedule");
  if (!section) return null;
  const body = await fetchPageMainContent(section.href, section.title, section.body);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="パリの歴史的建築と広場（年間活動のイメージ）"
        title={section.title}
      />
      <div className="mx-auto max-w-4xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <PageMarkdownContent content={body} />
        <Pagination />
      </div>
    </div>
  );
}
