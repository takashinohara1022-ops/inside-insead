import "server-only";

export type SheetRow = Record<string, string>;

export type DriveImageFile = {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  ownerName?: string;
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
