import "server-only";

export type SheetRow = Record<string, string>;

export type DriveImageFile = {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  ownerName?: string;
};

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
  const cacheOptions =
    process.env.NODE_ENV === "development"
      ? { cache: "no-store" as const }
      : { next: { revalidate: 3600 } };
  const response = await fetch(url, {
    ...cacheOptions,
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

export async function getGalleryUploadSheetRows(): Promise<SheetRow[]> {
  const sheetId = getOptionalEnv("GALLERY_UPLOAD_SHEET_ID");
  if (!sheetId) return [];
  return fetchSheetRows(sheetId);
}

async function getDriveFilesByFolderId(folderId: string): Promise<DriveImageFile[]> {
  const apiKey = getEnv("GOOGLE_SHEETS_API_KEY");
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent("files(id,name,mimeType,createdTime,owners(displayName)),nextPageToken");
  const pageSize = 1000;
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=${pageSize}&key=${apiKey}`;
  const cacheOptions =
    process.env.NODE_ENV === "development"
      ? { cache: "no-store" as const }
      : { next: { revalidate: 3600 } };
  const response = await fetch(url, {
    ...cacheOptions,
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

export async function getGalleryImageFiles(): Promise<DriveImageFile[]> {
  const files = await getDriveFilesByFolderId(getEnv("GALLERY_IMAGE_FOLDER_ID"));
  return files.filter((file) => file.mimeType.startsWith("image/"));
}
