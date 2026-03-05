import "server-only";

export type SheetRow = Record<string, string>;

export type DriveImageFile = {
  id: string;
  name: string;
  mimeType: string;
};

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
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
    next: { revalidate: 3600 },
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

async function getDriveFilesByFolderId(folderId: string): Promise<DriveImageFile[]> {
  const apiKey = getEnv("GOOGLE_SHEETS_API_KEY");
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent("files(id,name,mimeType),nextPageToken");
  const pageSize = 1000;
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=${pageSize}&key=${apiKey}`;
  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch drive files: ${response.status}`);
  }
  const json = (await response.json()) as { files?: DriveImageFile[] };
  return json.files ?? [];
}

export async function getDriveImageFiles(): Promise<DriveImageFile[]> {
  return getDriveFilesByFolderId(getEnv("DRIVE_IMAGE_FOLDER_ID"));
}

export async function getGalleryImageFiles(): Promise<DriveImageFile[]> {
  const files = await getDriveFilesByFolderId(getEnv("GALLERY_IMAGE_FOLDER_ID"));
  return files.filter((file) => file.mimeType.startsWith("image/"));
}
