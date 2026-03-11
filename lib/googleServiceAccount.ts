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

export async function getGoogleAuthHeader(scopes: string[]): Promise<Record<string, string>> {
  const credentials = getServiceAccountCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.clientEmail,
      private_key: credentials.privateKey,
    },
    scopes,
  });
  const token = await auth.getAccessToken();
  const accessToken = typeof token === "string" ? token : token?.token;
  if (!accessToken) throw new Error("Failed to authorize service account");
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
