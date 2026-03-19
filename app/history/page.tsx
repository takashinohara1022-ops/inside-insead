import { PageHero } from "../_components/PageHero";
import Pagination from "../../components/Pagination";
import { normalizeDocBody } from "../../lib/pageContentDocs";
import { fetchGoogleDocText } from "../../lib/googleServiceAccount";
import { PageMarkdownContent } from "../_components/PageMarkdownContent";

export const revalidate = 3600;

const HERO_IMAGE_URL = "/images/history-hero-1959.png";

const GOOGLE_DOC_ID = "1uGAVTS2hF2aygjeNqRxz_Ppq_rXpnr7UFtunP08bMSk";

async function fetchHistoryMarkdown(): Promise<string> {
  try {
    const rawText = await fetchGoogleDocText(GOOGLE_DOC_ID, {
      next: { revalidate, tags: ["history-doc"] },
    });
    return normalizeDocBody(rawText);
  } catch {
    return "コンテンツを取得できませんでした。しばらくしてから再度お試しください。";
  }
}

export default async function HistoryPage() {
  const markdown = await fetchHistoryMarkdown();

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero src={HERO_IMAGE_URL} alt="フォンテーヌブロー風の歴史的建物" title="歴史" />
      <div className="mx-auto max-w-4xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
          <PageMarkdownContent content={markdown} />
        </div>
        <Pagination />
      </div>
    </div>
  );
}
