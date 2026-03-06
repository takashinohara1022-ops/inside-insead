/**
 * Google Docs タブ連携の対象ページ（★ページ）
 */
const DOC_CMS_TARGET_PATHS = new Set<string>([
  "/about/history",
  "/about/culture",
  "/about/programs",
  "/about/campuses",
  "/about/exchange",
  "/student-life/yearly-schedule",
  "/student-life/academic-terms",
  "/student-life/academic-classes",
  "/student-life/academic-faculty",
  "/student-life/career",
  "/student-life/social-clubs",
  "/student-life/social-events",
]);

/**
 * 旧来のページ個別 DOC_ID への互換
 */
const LEGACY_ENV_KEY_BY_PATH: Record<string, string> = {
  "/about/history": "DOC_ID_ABOUT_HISTORY",
  "/about/culture": "DOC_ID_ABOUT_CULTURE",
  "/about/programs": "DOC_ID_ABOUT_PROGRAMS",
  "/about/campuses": "DOC_ID_ABOUT_CAMPUSES",
  "/about/exchange": "DOC_ID_ABOUT_EXCHANGE",
  "/student-life/yearly-schedule": "DOC_ID_STUDENT_LIFE_YEARLY_SCHEDULE",
  "/student-life/academic-terms": "DOC_ID_STUDENT_LIFE_ACADEMIC_TERMS",
  "/student-life/academic-classes": "DOC_ID_STUDENT_LIFE_ACADEMIC_CLASSES",
  "/student-life/academic-faculty": "DOC_ID_STUDENT_LIFE_ACADEMIC_FACULTY",
  "/student-life/career": "DOC_ID_STUDENT_LIFE_CAREER",
  "/student-life/social-clubs": "DOC_ID_STUDENT_LIFE_SOCIAL_CLUBS",
  "/student-life/social-events": "DOC_ID_STUDENT_LIFE_SOCIAL_EVENTS",
};

function normalizePath(path: string): string {
  return path.replace(/\/$/, "") || "/";
}

export function getContentsDocIdForPath(path: string): string | null {
  const normalized = normalizePath(path);
  if (!DOC_CMS_TARGET_PATHS.has(normalized)) return null;

  // 新方式（要件）: CONTENTS_DOC_ID を使用
  const contentsDocId = process.env.CONTENTS_DOC_ID?.trim();
  if (contentsDocId) return contentsDocId;

  // 互換: 旧 ABOUT_DOC_ID
  const aboutDocId = process.env.ABOUT_DOC_ID?.trim();
  if (aboutDocId) return aboutDocId;

  const legacyKey = LEGACY_ENV_KEY_BY_PATH[normalized];
  const legacyDocId = legacyKey ? process.env[legacyKey]?.trim() : "";
  return legacyDocId || null;
}

/**
 * 互換: 既存ページ実装向け
 * getDocAsHtml へ "{docId}::{pathname}" トークンを渡す
 */
export function getDocIdForPath(path: string): string | null {
  const normalized = normalizePath(path);
  const docId = getContentsDocIdForPath(normalized);
  if (!docId) return null;
  return `${docId}::${normalized}`;
}
