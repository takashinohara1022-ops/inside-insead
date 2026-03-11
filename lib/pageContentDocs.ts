import "server-only";
import { cache } from "react";
import { fetchGoogleDocText, getGoogleAuthHeader } from "./googleServiceAccount";

type DriveDocFile = {
  id: string;
  name: string;
};

const CONTENT_DOCS_FOLDER_ID =
  process.env.CONTENT_DOCS_FOLDER_ID?.trim() || "1skdCChLBBHcH7208X3ULcPEfkCEwhGxx";

// ページごとに参照ドキュメントIDを固定したい場合はここで明示指定する。
// 自動マッチより優先される。
const FIXED_DOC_ID_BY_PATH: Record<string, string> = {
  "/about/campuses": "1bmsGtRqg9GCVvsNfhL5jmD5ATCJDlQonPaYywhUfl2g",
  "/about/programs": "1MoO0Vbb9-DyOYzJRwSf1QNGvCEpWxVkgQIJ5EVf6MIo",
  "/student-life/academic-faculty": "1NjIZKgbP9TP0lWDWTfBG8hedOp5puKUZ5GNtI9192vA",
  "/student-life/yearly-schedule": "1Gx0yxAO0t8zMX9vM0KSfNM_eevEy5xVOqtnGmzue3SI",
  "/student-life/academic-terms": "1lazEmc_nlATSBqTiyzWL9GfsTQmPQgWkYLVvEjenFUI",
  "/student-life/academic-classes": "1wK5yH5f19CN2LPvOwNBmHpSksAp4Kdz46z5Z_PmXK4A",
  "/student-life/social-clubs": "1fjODLtZGub3SzvXOTUtevetZXOyjhHkx4K0_VftMt-A",
};

function normalize(value: string): string {
  return value.replace(/\s+/g, "").replace(/[・\-_/]/g, "").toLowerCase();
}

const listContentDocs = cache(async (): Promise<DriveDocFile[]> => {
  const authHeader = await getGoogleAuthHeader(["https://www.googleapis.com/auth/drive.readonly"]);
  const q = encodeURIComponent(
    `'${CONTENT_DOCS_FOLDER_ID}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.document'`,
  );
  const fields = encodeURIComponent("files(id,name)");
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=1000`,
    {
      headers: authHeader,
      next: { revalidate: 3600, tags: ["page-content-docs"] },
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to list content docs: ${response.status}`);
  }
  const json = (await response.json()) as { files?: DriveDocFile[] };
  return json.files ?? [];
});

function pickBestDocId(docs: DriveDocFile[], pagePath: string, title: string): string | null {
  const normalizedPath = normalize(pagePath);
  const normalizedTitle = normalize(title);

  let bestId: string | null = null;
  let bestScore = 0;
  for (const doc of docs) {
    const name = normalize(doc.name);
    let score = 0;
    if (name.includes(normalizedTitle)) score += 3;
    if (name.includes(normalizedPath)) score += 2;
    if (name.includes("ページコンテンツ")) score += 1;
    if (score > bestScore) {
      bestScore = score;
      bestId = doc.id;
    }
  }
  return bestScore > 0 ? bestId : null;
}

/** ページコンテンツ_ で始まる行や見出しを除去（Google Doc のタイトル行など） */
function stripPageContentPrefix(line: string): boolean {
  const t = line.trim();
  return !/^#?\s*ページコンテンツ_/.test(t);
}

export function normalizeDocBody(rawText: string): string {
  const normalized = rawText.replace(/\r\n/g, "\n");
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(stripPageContentPrefix);
  return lines.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function fetchPageMainContent(
  pagePath: string,
  title: string,
  fallback: string,
): Promise<string> {
  try {
    const fixedDocId = FIXED_DOC_ID_BY_PATH[pagePath];
    if (fixedDocId) {
      const rawText = await fetchGoogleDocText(fixedDocId, {
        next: { revalidate: 3600, tags: ["page-content-docs"] },
      });
      const body = normalizeDocBody(rawText);
      return body || fallback;
    }

    const docs = await listContentDocs();
    const docId = pickBestDocId(docs, pagePath, title);
    if (!docId) return fallback;

    const rawText = await fetchGoogleDocText(docId, {
      next: { revalidate: 3600, tags: ["page-content-docs"] },
    });
    const body = normalizeDocBody(rawText);
    return body || fallback;
  } catch {
    return fallback;
  }
}
