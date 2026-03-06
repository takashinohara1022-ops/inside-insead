import "server-only";
import { unstable_cache } from "next/cache";
import { google, docs_v1 } from "googleapis";

/**
 * Google Docs API のドキュメント構造（型定義）
 * @see https://developers.google.com/docs/api/reference/rest/v1/documents
 */
type DocsApiResponse = docs_v1.Schema$Document;
type TextStyle = docs_v1.Schema$TextStyle | undefined;
type StructuralElement = docs_v1.Schema$StructuralElement;
type ListDefinition = docs_v1.Schema$DocumentList | undefined;
type Block =
  | { type: "heading"; html: string }
  | { type: "paragraph"; html: string }
  | { type: "list-item"; html: string; listTag: "ul" | "ol" };

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseDocToken(input: string): { docId: string; tabTitle: string | null } {
  if (!input.includes("::")) {
    return { docId: input.trim(), tabTitle: null };
  }
  const [docId, tabTitle] = input.split("::");
  return {
    docId: docId.trim(),
    tabTitle: tabTitle?.trim() || null,
  };
}

function renderTextRun(content: string, textStyle?: TextStyle): string {
  if (!content) return "";
  // Google Docs の画像プレースホルダー文言は出力しない
  if (content.replace(/\s+/g, "").trim() === "Embeddedimage") return "";
  const escaped = escapeHtml(content);
  let inner = escaped;
  if (textStyle?.bold) inner = `<strong>${inner}</strong>`;
  if (textStyle?.italic) inner = `<em>${inner}</em>`;
  if (textStyle?.link?.url) {
    const url = escapeHtml(textStyle.link.url);
    inner = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#005543] underline hover:text-[#004433]">${inner}</a>`;
  }
  return inner;
}

function textFromElements(elements: docs_v1.Schema$ParagraphElement[] = []): string {
  return elements
    .map((el) => el.textRun?.content ?? "")
    .join("")
    .replace(/\n/g, "")
    .trim();
}

function htmlFromElements(
  elements: docs_v1.Schema$ParagraphElement[] = []
): string {
  return elements
    .map((el) => {
      const run = el.textRun;
      if (run?.content) {
        const content = run.content.replace(/\n/g, "");
        return renderTextRun(content, run.textStyle);
      }
      // inlineObjectElement / positionedObjectElement は画像要素のため完全スキップ
      return "";
    })
    .join("")
    .trim();
}

function getListTag(lists: ListDefinition, listId?: string | null, nestingLevel?: number | null): "ul" | "ol" {
  const glyphType = listId && lists?.[listId]?.listProperties?.nestingLevels?.[nestingLevel ?? 0]?.glyphType;
  return glyphType === "DECIMAL" || glyphType === "DECIMAL_ZERO" ? "ol" : "ul";
}

function extractBlocks(
  content: StructuralElement[] = [],
  lists: ListDefinition
): Block[] {
  const blocks: Block[] = [];

  for (const elem of content) {
    if (elem.tableOfContents) {
      const tocContent = elem.tableOfContents.content ?? [];
      blocks.push(
        ...extractBlocks(tocContent, lists)
      );
      continue;
    }

    if (elem.table?.tableRows?.length) {
      for (const row of elem.table.tableRows) {
        for (const cell of row.tableCells ?? []) {
          blocks.push(...extractBlocks(cell.content ?? [], lists));
        }
      }
      continue;
    }

    const paragraph = elem.paragraph;
    if (!paragraph) continue;

    const html = htmlFromElements(paragraph.elements ?? []);
    if (!html) continue;

    const namedStyle = paragraph.paragraphStyle?.namedStyleType ?? "NORMAL_TEXT";
    const bullet = paragraph.bullet;

    if (bullet) {
      blocks.push({
        type: "list-item",
        html,
        listTag: getListTag(lists, bullet.listId, bullet.nestingLevel),
      });
      continue;
    }

    if (namedStyle.startsWith("HEADING_")) {
      const levelRaw = Number(namedStyle.replace("HEADING_", ""));
      const level = Number.isFinite(levelRaw) && levelRaw > 0 ? Math.min(levelRaw, 3) : 3;
      blocks.push({
        type: "heading",
        html: `<h${level}>${html}</h${level}>`,
      });
      continue;
    }

    blocks.push({ type: "paragraph", html: `<p>${html}</p>` });
  }

  return blocks;
}

function renderBlocks(blocks: Block[]): string {
  const htmlParts: string[] = [];
  let openListTag: "ul" | "ol" | null = null;

  for (const block of blocks) {
    if (block.type === "list-item") {
      if (openListTag !== block.listTag) {
        if (openListTag) htmlParts.push(`</${openListTag}>`);
        openListTag = block.listTag;
        htmlParts.push(`<${openListTag}>`);
      }
      htmlParts.push(`<li>${block.html}</li>`);
      continue;
    }

    if (openListTag) {
      htmlParts.push(`</${openListTag}>`);
      openListTag = null;
    }
    htmlParts.push(block.html);
  }

  if (openListTag) htmlParts.push(`</${openListTag}>`);
  return htmlParts.join("\n");
}

async function fetchGoogleDoc(docId: string): Promise<DocsApiResponse> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL?.trim();
  const serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ?.replace(/\\n/g, "\n")
    .trim();

  const auth =
    serviceAccountEmail && serviceAccountPrivateKey
      ? new google.auth.JWT({
          email: serviceAccountEmail,
          key: serviceAccountPrivateKey,
          scopes: ["https://www.googleapis.com/auth/documents.readonly"],
        })
      : getEnv("GOOGLE_SHEETS_API_KEY");

  const docs = google.docs({ version: "v1", auth });
  const response = await docs.documents.get({
    documentId: docId,
    includeTabsContent: true,
  });
  if (!response.data) {
    throw new Error("Failed to fetch Google Doc content.");
  }
  return response.data;
}

const fetchGoogleDocCached = unstable_cache(
  async (docId: string) => fetchGoogleDoc(docId),
  ["google-docs-get"],
  { revalidate: 3600 }
);

/**
 * Google Docs の指定タブを HTML に変換する
 */
export async function getDocTabAsHtml(docId: string, tabTitle: string): Promise<string> {
  try {
    if (!docId?.trim() || !tabTitle?.trim()) return "";
    const normalizedDocId = docId.trim();
    const doc =
      process.env.NODE_ENV === "development"
        ? await fetchGoogleDoc(normalizedDocId)
        : await fetchGoogleDocCached(normalizedDocId);

    const tabs = doc.tabs ?? [];
    const targetTab = tabs.find(
      (tab) => tab.tabProperties?.title?.trim() === tabTitle.trim()
    );
    if (!targetTab) return "";

    const tabContent = targetTab.documentTab?.body?.content ?? [];
    const lists = targetTab.documentTab?.lists ?? doc.lists;
    const blocks = extractBlocks(tabContent, lists);
    return renderBlocks(blocks);
  } catch {
    return "";
  }
}

/**
 * 互換関数: 既存呼び出しを壊さないために維持
 */
export async function getDocAsHtml(docId: string): Promise<string> {
  const { docId: actualDocId, tabTitle } = parseDocToken(docId);
  if (!actualDocId) return "";
  if (!tabTitle) {
    // タイトル未指定時は先頭タブを利用
    return getDocTabAsHtml(actualDocId, "/");
  }
  return getDocTabAsHtml(actualDocId, tabTitle);
}
