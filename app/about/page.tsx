import Link from "next/link";
import { getCategoryByPath } from "../../constants/navigationConfig";
import { ABOUT_SECTIONS } from "../../constants/about-content";
import { PageHero } from "../_components/PageHero";
import Pagination from "../../components/Pagination";
import { fetchPageMainContent, markdownToPlainText, normalizeDocBody } from "../../lib/pageContentDocs";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop";

const SECTION_HEADING_CLASS =
  "text-lg font-semibold tracking-tight text-slate-900 sm:text-xl transition-colors hover:text-[#005543]";

const BODY_TEXT_CLASS = "leading-relaxed text-slate-600 sm:text-[15px]";
function excerptFromBody(body: string, maxChars = 160): string {
  const normalized = body.replace(/\s+/g, " ").trim();
  return normalized.length > maxChars
    ? `${normalized.slice(0, maxChars).trim()}...`
    : normalized;
}

function getAboutExcerptFromStatic(path: string): string {
  const section = ABOUT_SECTIONS.find((s) => s.href === path);
  return section ? excerptFromBody(section.body, 160) : "";
}

function pickLeadParagraphFromDoc(rawText: string): string {
  const paragraphs = normalizeDocBody(rawText)
    .split(/\n\s*\n/)
    .map((chunk) => chunk.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((chunk) => !/^#+\s*/.test(chunk))
    .filter((chunk) => !/^!\[.*\]\(.*\)$/.test(chunk));

  const lead = paragraphs[0] ?? "";
  return markdownToPlainText(lead);
}

async function getAboutExcerpt(path: string): Promise<string> {
  const section = ABOUT_SECTIONS.find((s) => s.href === path);
  if (!section) return getAboutExcerptFromStatic(path);

  try {
    const body = await fetchPageMainContent(section.href, section.title, section.body);
    const leadParagraph = pickLeadParagraphFromDoc(body);
    if (!leadParagraph) return getAboutExcerptFromStatic(path);
    return excerptFromBody(leadParagraph, 180);
  } catch {
    return getAboutExcerptFromStatic(path);
  }
}

export default async function AboutOverviewPage() {
  const category = getCategoryByPath("/about");
  if (!category) return null;
  const excerpts = await Promise.all(
    category.pages.map(async (page) => ({
      path: page.path,
      excerpt: await getAboutExcerpt(page.path),
    })),
  );
  const excerptMap = new Map(excerpts.map((item) => [item.path, item.excerpt]));

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="フォンテーヌブロー風の歴史的建物"
        title={category.label}
      />

      <div className="mx-auto max-w-4xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="space-y-12">
          {category.pages.map((page) => {
            return (
              <section
                key={page.path}
                className="scroll-mt-20 border-b border-neutral-200 pb-12 last:border-b-0 last:pb-0"
              >
                <h2 className="mb-4">
                  <Link href={page.path} className={SECTION_HEADING_CLASS}>
                    {page.title}
                  </Link>
                </h2>
                <p className={`${BODY_TEXT_CLASS} line-clamp-3`}>
                  {excerptMap.get(page.path) ?? ""}
                </p>
                <Link
                  href={page.path}
                  className="mt-3 inline-block text-sm font-medium text-[#005543] transition-colors hover:underline"
                >
                  ...つづきを見る
                </Link>
              </section>
            );
          })}
        </div>
        <Pagination />
      </div>
    </div>
  );
}
