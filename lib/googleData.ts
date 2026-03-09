import "server-only";

export type SheetRow = Record<string, string>;

export type DriveImageFile = {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  ownerName?: string;
};

export type StudentRecord = {
  id: string;
  uniqueDisplayName: string;
  initials: string;
  classLabel: string;
  graduationMonth: string;
  campus: string;
  yearsAtEntry: string;
  industry: string;
};

export type BlogRecord = {
  id: string;
  author: string;
  title: string;
  body: string;
  postedAt: string;
};

export type GalleryRecord = {
  id: string;
  author: string;
  postedAt: string;
  comment: string;
  driveFileId?: string;
};

const DEFAULT_GALLERY_UPLOAD_SHEET_ID = "122oe9y4gsbLAmZtgG7BQuH_wweCCnIAUIVpS7q7z_n8";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

function getOptionalEnv(name: string): string | null {
  const value = process.env[name];
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeSheetId(value: string): string {
  const trimmed = value.trim();
  const matched = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return matched?.[1] ?? trimmed;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeForMatch(value: string): string {
  return normalizeText(value).replace(/\s+/g, "").toLowerCase();
}

export function normalizeJoinKey(value: string): string {
  return normalizeForMatch(value).replace(/[._\-・/]/g, "");
}

function getByHeaderMatch(row: SheetRow, keywords: string[]): string {
  const entries = Object.entries(row);
  for (const [header, rawValue] of entries) {
    const normalizedHeader = normalizeForMatch(header);
    const hit = keywords.some((keyword) => normalizedHeader.includes(normalizeForMatch(keyword)));
    if (hit) return normalizeText(rawValue ?? "");
  }
  return "";
}

function getByColumnIndex(row: SheetRow, oneBasedIndex: number): string {
  const values = Object.values(row);
  return normalizeText(values[oneBasedIndex - 1] ?? "");
}

function parseClassLabel(yearRaw: string, monthRaw: string): string {
  const year = normalizeText(yearRaw);
  const month = normalizeForMatch(monthRaw);
  const yearNum = year.match(/\d{2,4}/)?.[0];
  if (!yearNum) return "";
  const fourDigitYear = yearNum.length === 2 ? `20${yearNum}` : yearNum;
  const yy = fourDigitYear.slice(-2);
  if (month.includes("july") || month === "j" || month.includes("7")) return `${yy}J`;
  if (month.includes("dec") || month === "d" || month.includes("12")) return `${yy}D`;
  return yy;
}

function splitMultiValue(value: string): string[] {
  return value
    .split(/[,，\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function extractDriveFileId(value: string): string | null {
  if (!value) return null;
  const text = value.trim();
  const idParam = text.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParam?.[1]) return idParam[1];
  const pathParam = text.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (pathParam?.[1]) return pathParam[1];
  return null;
}

function toStudentProfileId(uniqueDisplayName: string, fallback: string): string {
  const source = normalizeText(uniqueDisplayName) || normalizeText(fallback) || "student";
  return source
    .toLowerCase()
    .replace(/[^\w\u3040-\u30ff\u3400-\u9fff-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toSheetRows(values: string[][]): SheetRow[] {
  if (!values.length) return [];
  const [headers, ...rows] = values;
  return rows.map((row) => {
    const obj: SheetRow = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] ?? "";
    });
    return obj;
  });
}

async function fetchSheetRows(sheetId: string): Promise<SheetRow[]> {
  const apiKey = getEnv("GOOGLE_SHEETS_API_KEY");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:ZZ?key=${apiKey}`;
  const response = await fetch(url, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet rows: ${response.status}`);
  }
  const json = (await response.json()) as { values?: string[][] };
  return toSheetRows(json.values ?? []);
}

export async function getProfileSheetRows(): Promise<SheetRow[]> {
  return fetchSheetRows(getEnv("PROFILE_SHEET_ID"));
}

export async function getBlogSheetRows(): Promise<SheetRow[]> {
  return fetchSheetRows(getEnv("BLOG_SHEET_ID"));
}

/**
 * ギャラリー用フォーム投稿のスプレッドシート行を取得する。
 * 行オブジェクトには「アップロード者名」「日付」「写真コメント」等の列が含まれる想定。
 * シートID未設定時は DEFAULT_GALLERY_UPLOAD_SHEET_ID（122oe9y4gsbLAmZtgG7BQuH_wweCCnIAUIVpS7q7z_n8）を使用。
 */
export async function getGalleryUploadSheetRows(): Promise<SheetRow[]> {
  const configured = getOptionalEnv("GALLERY_UPLOAD_SHEET_ID");
  const sheetId = normalizeSheetId(configured ?? DEFAULT_GALLERY_UPLOAD_SHEET_ID);
  return fetchSheetRows(sheetId);
}

async function getDriveFilesByFolderId(folderId: string): Promise<DriveImageFile[]> {
  const apiKey = getEnv("GOOGLE_SHEETS_API_KEY");
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent("files(id,name,mimeType,createdTime,owners(displayName)),nextPageToken");
  const pageSize = 1000;
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=${pageSize}&key=${apiKey}`;
  const response = await fetch(url, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch drive files: ${response.status}`);
  }
  const json = (await response.json()) as {
    files?: Array<{
      id: string;
      name: string;
      mimeType: string;
      createdTime?: string;
      owners?: Array<{ displayName?: string }>;
    }>;
  };
  return (json.files ?? []).map((file) => ({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    createdTime: file.createdTime,
    ownerName: file.owners?.[0]?.displayName,
  }));
}

export async function getDriveImageFiles(): Promise<DriveImageFile[]> {
  return getDriveFilesByFolderId(getEnv("DRIVE_IMAGE_FOLDER_ID"));
}

/**
 * ギャラリー用フォーム投稿画像のDriveフォルダID。
 * GALLERY_UPLOAD_FOLDER_ID を優先し、未設定時は GALLERY_IMAGE_FOLDER_ID にフォールバック。
 */
function getGalleryUploadFolderId(): string | null {
  const upload = getOptionalEnv("GALLERY_UPLOAD_FOLDER_ID");
  if (upload) return upload;
  return getOptionalEnv("GALLERY_IMAGE_FOLDER_ID");
}

export async function getGalleryImageFiles(): Promise<DriveImageFile[]> {
  const folderId = getGalleryUploadFolderId();
  if (!folderId) return [];
  const files = await getDriveFilesByFolderId(folderId);
  return files.filter((file) => file.mimeType.startsWith("image/"));
}

export async function getDriveImageFilesByFolderId(folderId: string): Promise<DriveImageFile[]> {
  if (!folderId.trim()) return [];
  const files = await getDriveFilesByFolderId(folderId.trim());
  return files.filter((file) => file.mimeType.startsWith("image/"));
}

export async function fetchStudents(): Promise<StudentRecord[]> {
  const rows = await getProfileSheetRows();
  return rows.map((row, index) => {
    const initials = getByHeaderMatch(row, ["氏名イニシャル", "initial"]) || "N/A";
    const classLabel = parseClassLabel(
      getByHeaderMatch(row, ["INSEAD卒業年度", "INSEAD卒業年", "gradyear"]),
      getByHeaderMatch(row, ["INSEAD卒業月", "gradmonth"]),
    );
    const graduationMonth = getByHeaderMatch(row, ["INSEAD卒業月", "gradmonth"]);
    const campus = getByHeaderMatch(row, ["Home Campus", "ホームキャンパス", "campus"]);
    const yearsAtEntry = getByHeaderMatch(row, ["入学時社会人歴", "社会人歴", "社会人何年目"]);
    const industry = getByHeaderMatch(
      row,
      ["キャリアバックグラウンド大分類", "出身業界(大分類)", "industry"],
    );
    const uniqueDisplayName =
      getByColumnIndex(row, 22) ||
      `${initials} / ${classLabel || "-"} / ${graduationMonth || "-"} / ${campus || "-"} / ${yearsAtEntry || "-"} / ${industry || "-"}`;
    return {
      id: toStudentProfileId(uniqueDisplayName, `${initials}-${index}`),
      uniqueDisplayName,
      initials,
      classLabel,
      graduationMonth,
      campus,
      yearsAtEntry,
      industry,
    };
  });
}

export async function fetchBlogPosts(): Promise<BlogRecord[]> {
  const rows = await getBlogSheetRows();
  return rows.map((row, index) => ({
    id: `${getByHeaderMatch(row, ["タイトル"]) || "blog"}-${index}`,
    author: getByHeaderMatch(row, ["投稿者"]) || "匿名",
    title: getByHeaderMatch(row, ["タイトル"]) || "無題",
    body: getByHeaderMatch(row, ["本文"]) || "",
    postedAt: getByHeaderMatch(row, ["投稿日"]) || "",
  }));
}

export async function fetchGalleryItems(): Promise<GalleryRecord[]> {
  const rows = await getGalleryUploadSheetRows();
  return rows.flatMap((row, index) => {
    const author =
      getByHeaderMatch(row, [
        "アップロード者名",
        "氏名",
        "お名前",
        "名前",
        "投稿者",
        "ニックネーム",
      ]) || "不明";
    const postedAt = getByHeaderMatch(row, ["アップロード日", "投稿日", "日付", "タイムスタンプ"]) || "";
    const comment = getByHeaderMatch(row, ["写真コメント", "コメント", "写真のコメント"]) || "";
    const imageRaw = getByHeaderMatch(row, [
      "自由に画像をアップロード",
      "画像をアップロード",
      "写真",
      "画像",
      "file",
      "drive",
    ]);
    const driveIds = splitMultiValue(imageRaw)
      .map((value) => extractDriveFileId(value))
      .filter((value): value is string => Boolean(value));
    if (driveIds.length === 0) {
      return [{ id: `gallery-${index}`, author, postedAt, comment }];
    }
    return driveIds.map((driveFileId) => ({
      id: `gallery-folder-${driveFileId}`,
      author,
      postedAt,
      comment,
      driveFileId,
    }));
  });
}

export function buildAuthorProfileHrefMap(students: StudentRecord[]): Record<string, string> {
  const authorToHref = new Map<string, string>();
  students.forEach((student) => {
    const href = `/students/profiles?student=${encodeURIComponent(student.id)}`;
    const key = normalizeJoinKey(student.uniqueDisplayName);
    if (key && !authorToHref.has(key)) {
      authorToHref.set(key, href);
    }
  });
  return Object.fromEntries(authorToHref);
}
