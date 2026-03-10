import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { PageHero } from "../_components/PageHero";
import Pagination from "../../components/Pagination";
import { extractDriveFileId } from "../../lib/studentsBlog";

export const revalidate = 3600;

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop";

const GOOGLE_DOC_ID = "1uGAVTS2hF2aygjeNqRxz_Ppq_rXpnr7UFtunP08bMSk";
const GOOGLE_DOC_MARKDOWN_EXPORT_URL = `https://docs.google.com/document/d/${GOOGLE_DOC_ID}/export?format=txt`;

function toDriveDirectViewUrl(url: string): string {
  const fileId = extractDriveFileId(url);
  if (!fileId) return url;
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

function replaceDrivePreviewUrls(content: string): string {
  return content.replace(
    /https?:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/(?:view|preview)[^\s)\]]*/g,
    (matched) => toDriveDirectViewUrl(matched),
  );
}

async function fetchHistoryMarkdown(): Promise<string> {
  try {
    const response = await fetch(GOOGLE_DOC_MARKDOWN_EXPORT_URL, {
      next: { revalidate },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch history document: ${response.status}`);
    }
    const rawText = await response.text();
    return replaceDrivePreviewUrls(rawText);
  } catch {
    return "コンテンツを取得できませんでした。しばらくしてから再度お試しください。";
  }
}

const markdownComponents: Components = {
  img: ({ src, alt, title }) => {
    const rawSrc = typeof src === "string" ? src : "";
    const resolvedSrc = toDriveDirectViewUrl(rawSrc);
    if (!resolvedSrc) return null;

    return (
      <figure className="my-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvedSrc}
          alt={typeof alt === "string" ? alt : ""}
          title={typeof title === "string" ? title : undefined}
          className="mx-auto w-full rounded-lg border border-neutral-200 object-contain md:w-4/5"
          loading="lazy"
        />
        {typeof alt === "string" && alt.trim() ? (
          <figcaption className="mt-2 text-center text-sm text-gray-500">{alt}</figcaption>
        ) : null}
      </figure>
    );
  },
};

export default async function HistoryPage() {
  const markdown = await fetchHistoryMarkdown();

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero src={HERO_IMAGE_URL} alt="フォンテーヌブロー風の歴史的建物" title="INSEADの歴史" />
      <div className="mx-auto max-w-4xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
          <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-[#005543] prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={markdownComponents}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
        <Pagination />
      </div>
    </div>
  );
}
