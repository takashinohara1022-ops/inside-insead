import { PageHero } from "../_components/PageHero";
import Pagination from "../../components/Pagination";
import { normalizeDocBody } from "../../lib/pageContentDocs";
import { fetchGoogleDocText } from "../../lib/googleServiceAccount";
import { PageMarkdownContent } from "../_components/PageMarkdownContent";

export const revalidate = 3600;

const HERO_IMAGE_URL = "/images/culture-school-hero.png";

const GOOGLE_DOC_ID = "1GsvhBN4VsQdCs58R-F0HmxSCZg1a2i3dPdLZF8rocu4";

async function fetchCultureMarkdown(): Promise<string> {
  try {
    const rawText = await fetchGoogleDocText(GOOGLE_DOC_ID, {
      next: { revalidate, tags: ["culture-doc"] },
    });
    return normalizeDocBody(rawText);
  } catch {
    return "コンテンツを取得できませんでした。しばらくしてから再度お試しください。";
  }
}

export default async function CulturePage() {
  const markdown = await fetchCultureMarkdown();

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="INSEAD キャンパスのロビー。磨かれた床、レセプション、ミッションステートメントが掲げられた壁"
        title="スクールカルチャー"
      />
      <div className="mx-auto max-w-4xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
          <PageMarkdownContent content={markdown} />
        </div>
        <Pagination />
      </div>
    </div>
  );
}
