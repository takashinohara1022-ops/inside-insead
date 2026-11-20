import "server-only";
import { google } from "googleapis";

type NextFetchOptions = {
  revalidate?: number;
  tags?: string[];
};

type GoogleFetchInit = RequestInit & {
  next?: NextFetchOptions;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for service account auth`);
  }
  return value;
}

function getServiceAccountCredentials() {
  const clientEmail = getRequiredEnv("GOOGLE_CLIENT_EMAIL");
  const privateKeyRaw = getRequiredEnv("GOOGLE_PRIVATE_KEY");
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  if (!privateKey.includes("BEGIN PRIVATE KEY") || !privateKey.includes("END PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY format is invalid. Use one-line value with \\n escapes.",
    );
  }
  return { clientEmail, privateKey };
}

// アクセストークンをスコープごとに使い回す（毎回の署名処理でCPUを使わないため）
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

export async function getGoogleAuthHeader(scopes: string[]): Promise<Record<string, string>> {
  const cacheKey = [...scopes].sort().join(" ");
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { Authorization: `Bearer ${cached.token}` };
  }
  const credentials = getServiceAccountCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.clientEmail,
      private_key: credentials.privateKey,
    },
    scopes,
  });
  const tokenResponse = await auth.getAccessToken();
  const accessToken =
    tokenResponse == null
      ? null
      : typeof tokenResponse === "string"
        ? tokenResponse
        : (tokenResponse as { token?: string }).token;
  if (!accessToken) throw new Error("Failed to authorize service account");
  // Googleのトークンは1時間有効。余裕を見て50分で更新する
  tokenCache.set(cacheKey, { token: accessToken, expiresAt: Date.now() + 50 * 60 * 1000 });
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function fetchGoogleDocText(docId: string, init?: GoogleFetchInit): Promise<string> {
  const authHeader = await getGoogleAuthHeader([
    "https://www.googleapis.com/auth/drive.readonly",
  ]);
  const headers = new Headers(init?.headers);
  headers.set("Authorization", authHeader.Authorization);

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(docId)}/export?mimeType=text/plain`,
    {
      ...init,
      headers,
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch document ${docId}: ${response.status}`);
  }
  return response.text();
}
