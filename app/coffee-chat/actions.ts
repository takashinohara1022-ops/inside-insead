"use server";

import { google } from "googleapis";

export type CoffeeChatPayload = {
  name: string;
  email: string;
  topic: string;
  person1?: string;
  person2?: string;
};

export type CoffeeChatResult = {
  success: boolean;
  message?: string;
};

const COFFEE_CHAT_SHEET_ID = "1r0HSe9UEuyNFpvnXVCRHO9Xm03Z4Kd7FKPkTLjcXt8M";
const SHEET_RANGE = "A:G";
const DEFAULT_OPTION = "指定なし";

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

function buildGoogleAuth() {
  const clientEmail = requireEnvValue([
    "GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL",
    "GOOGLE_CLIENT_EMAIL",
  ]);
  const privateKey = requireEnvValue([
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
    "GOOGLE_PRIVATE_KEY",
  ]).replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getJstTimestamp(): string {
  return new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}

async function appendCoffeeChatRow(params: {
  auth: InstanceType<typeof google.auth.JWT>;
  submittedAt: string;
  name: string;
  email: string;
  topic: string;
  person1: string;
  person2: string;
  emailStatus: string;
}) {
  const sheets = google.sheets({ version: "v4", auth: params.auth });
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

async function sendCoffeeChatNotificationEmail(params: {
  submittedAt: string;
  name: string;
  email: string;
  topic: string;
  person1: string;
  person2: string;
}): Promise<void> {
  const webhookUrl = getEnvValue("COFFEE_CHAT_WEBHOOK_URL");
  if (!webhookUrl) {
    throw new Error("COFFEE_CHAT_WEBHOOK_URL is not set");
  }

  const notifyTo = getEnvValue("COFFEE_CHAT_NOTIFY_TO");
  const payload = {
    to: params.email,
    notifyTo,
    subject: "【INSIDE INSEAD】Coffee Chatお申し込みありがとうございます",
    body: [
      `${params.name} 様`,
      "",
      "Coffee Chatへのお申し込みを受け付けました。",
      "以下の内容で申請されています。",
      "",
      `申込日時: ${params.submittedAt}`,
      `お名前: ${params.name}`,
      `メールアドレス: ${params.email}`,
      `話したい内容: ${params.topic}`,
      `第1希望: ${params.person1}`,
      `第2希望: ${params.person2}`,
      "",
      "在校生からのご連絡をお待ちください。",
    ].join("\n"),
    application: {
      submittedAt: params.submittedAt,
      name: params.name,
      email: params.email,
      topic: params.topic,
      person1: params.person1,
      person2: params.person2,
    },
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email via webhook: ${response.status}`);
  }
}

export async function sendCoffeeChatEmail(payload: CoffeeChatPayload): Promise<CoffeeChatResult> {
  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const topic = payload.topic?.trim() ?? "";
  const person1 = payload.person1?.trim() || DEFAULT_OPTION;
  const person2 = payload.person2?.trim() || DEFAULT_OPTION;

  if (!name || !email || !topic) {
    return { success: false, message: "必須項目を入力してください。" };
  }

  try {
    const auth = buildGoogleAuth();
    const submittedAt = getJstTimestamp();
    let emailStatus = "送信済み";

    try {
      await sendCoffeeChatNotificationEmail({
        submittedAt,
        name,
        email,
        topic,
        person1,
        person2,
      });
    } catch (mailError) {
      console.error("[Coffee Chat Email Error]", mailError);
      emailStatus = "送信失敗";
    }

    await appendCoffeeChatRow({
      auth,
      submittedAt,
      name,
      email,
      topic,
      person1,
      person2,
      emailStatus,
    });

    console.log("[Coffee Chat Submission Saved]", {
      submittedAt,
      name,
      email,
      topic,
      person1,
      person2,
      emailStatus,
    });

    return { success: true };
  } catch (error) {
    console.error("[Coffee Chat Submission Error]", error);
    return {
      success: false,
      message:
        "申し込み処理中にエラーが発生しました。しばらくしてから再度お試しください。",
    };
  }
}
