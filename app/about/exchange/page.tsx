import { getAboutSection } from "../../../constants/about-content";
import { PageHero } from "../../_components/PageHero";
import Pagination from "../../../components/Pagination";
import { fetchPageMainContent } from "../../../lib/pageContentDocs";
import { PageMarkdownContent } from "../../_components/PageMarkdownContent";

const HERO_IMAGE_URL = "/images/about-exchange-hero.png";

export default async function AboutExchangePage() {
  const section = getAboutSection("exchange");
  if (!section) return null;
  const body = await fetchPageMainContent(section.href, section.title, section.body);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="ペンシルバニア大学キャンパス（秋の並木道）"
        title={section.title}
      />

      <div className="mx-auto max-w-4xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <PageMarkdownContent content={body} />

        <Pagination />
      </div>
    </div>
  );
}
