import { getStudentLifeSection } from "../../../constants/student-life-content";
import { PageHero } from "../../_components/PageHero";
import Pagination from "../../../components/Pagination";
import { fetchPageMainContent } from "../../../lib/pageContentDocs";
import { PageMarkdownContent } from "../../_components/PageMarkdownContent";

const HERO_IMAGE_URL = "/images/student-life-academic-terms-hero.png";
export default async function AcademicTermsPage() {
  const section = getStudentLifeSection("academic-terms");
  if (!section) return null;
  const body = await fetchPageMainContent(section.href, section.title, section.body);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="卒業式でガウン姿の学生がキャップを投げ、パビリオン越しに湖と緑が見える様子"
        title={section.title}
      />
      <div className="mx-auto max-w-4xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <PageMarkdownContent content={body} />
        <Pagination />
      </div>
    </div>
  );
}
