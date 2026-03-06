import { getStudentLifeSection } from "../../../constants/student-life-content";
import { getContentsDocIdForPath } from "../../../constants/docPagesConfig";
import { getDocTabAsHtml } from "../../../lib/googleDocs";
import { DocContent } from "../../_components/DocContent";
import { PageHero } from "../../_components/PageHero";
import Pagination from "../../../components/Pagination";

export const revalidate = 3600;

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop";
export default async function YearlySchedulePage() {
  const section = getStudentLifeSection("yearly-schedule");
  if (!section) return null;

  const pagePath = "/student-life/yearly-schedule";
  const docId = getContentsDocIdForPath(pagePath);
  const htmlContent = docId ? await getDocTabAsHtml(docId, pagePath) : "";

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero src={HERO_IMAGE_URL} alt="年間活動" title={section.title} />
      <div className="mx-auto max-w-4xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        {htmlContent ? <DocContent html={htmlContent} /> : <p className="text-sm text-slate-500">コンテンツを準備中です。</p>}
        <Pagination />
      </div>
    </div>
  );
}
