import "server-only";
import { google } from "googleapis";

const COFFEE_CHAT_SHEET_ID = "1r0HSe9UEuyNFpvnXVCRHO9Xm03Z4Kd7FKPkTLjcXt8M";
const SHEET_RANGE = "A:G";

function getEnvValue(name: string): string | null {
  const value = process.env[name];
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requireEnvValue(candidates: string[]): string {
  for (const key of candidates) {
    const value = getEnvValue(key);
    if (value) return value;
  }
  throw new Error(`Missing required env var. Expected one of: ${candidates.join(", ")}`);
}

function normalizePrivateKey(raw: string): string {
  let key = raw.trim();
  key = key.replace(/\\n/g, "\n");
  if (
    !key.includes("\n") &&
    key.includes("-----BEGIN PRIVATE KEY-----") &&
    key.includes("-----END PRIVATE KEY-----")
  ) {
    key = key
      .replace(/-----BEGIN PRIVATE KEY-----/, "-----BEGIN PRIVATE KEY-----\n")
      .replace(/-----END PRIVATE KEY-----/, "\n-----END PRIVATE KEY-----\n");
  }
  return key;
}

function buildGoogleAuth() {
  const clientEmail = requireEnvValue([
    "GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL",
    "GOOGLE_CLIENT_EMAIL",
  ]);
  const rawKey = requireEnvValue([
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
    "GOOGLE_PRIVATE_KEY",
  ]);
  const privateKey = normalizePrivateKey(rawKey);

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export function getJstTimestamp(): string {
  return new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}

export async function appendCoffeeChatToSheet(params: {
  submittedAt: string;
  name: string;
  email: string;
  topic: string;
  person1: string;
  person2: string;
  emailStatus: string;
}): Promise<void> {
  const auth = buildGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: COFFEE_CHAT_SHEET_ID,
    range: SHEET_RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          params.submittedAt,
          params.name,
          params.email,
          params.topic,
          params.person1,
          params.person2,
          params.emailStatus,
        ],
      ],
    },
  });
}

export function isSheetConfigured(): boolean {
  const hasEmail =
    getEnvValue("GOOGLE_CLIENT_EMAIL") ?? getEnvValue("GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL");
  const hasKey =
    getEnvValue("GOOGLE_PRIVATE_KEY") ?? getEnvValue("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  return Boolean(hasEmail && hasKey);
}
