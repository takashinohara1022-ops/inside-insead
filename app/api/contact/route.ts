import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  appendCoffeeChatToSheet,
  getJstTimestamp,
  isSheetConfigured,
} from "../../../lib/coffeeChatSheet";

const DEFAULT_OPTION = "指定なし";

type ContactPayload = {
  name: string;
  email: string;
  topic: string;
  person1?: string;
  person2?: string;
};

function getEnvValue(name: string): string | null {
  const value = process.env[name];
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sendEmailFailureAlert(params: {
  submittedAt: string;
  name: string;
  email: string;
  emailStatus: string;
}) {
  const webhook = getEnvValue("EMAIL_ALERT_WEBHOOK_URL");
  if (!webhook) return;
  fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `【Coffee Chat】通知メール送信失敗: ${params.submittedAt} - ${params.name} (${params.email})`,
      ...params,
    }),
  }).catch((e) => console.error("[Contact API] アラートWebhook送信失敗:", e));
}

async function sendNotificationEmail(params: {
  submittedAt: string;
  name: string;
  email: string;
  topic: string;
  person1: string;
  person2: string;
}): Promise<"sent" | "skipped" | "failed"> {
  const emailUser = getEnvValue("EMAIL_USER");
  const emailPass = getEnvValue("EMAIL_PASS");
  const notificationEmail = getEnvValue("NOTIFICATION_EMAIL");

  if (!emailUser || !emailPass || !notificationEmail) {
    const missing = [
      !emailUser && "EMAIL_USER",
      !emailPass && "EMAIL_PASS",
      !notificationEmail && "NOTIFICATION_EMAIL",
    ]
      .filter(Boolean)
      .join(", ");
    console.warn("[Contact API] メール送信をスキップ: 未設定の環境変数:", missing);
    return "skipped";
  }

  const smtpHost = getEnvValue("SMTP_HOST") ?? "smtp.gmail.com";
  const smtpPort = Number(getEnvValue("SMTP_PORT") ?? "587");
  const pass = emailPass.replace(/\s/g, "");
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: emailUser,
      pass,
    },
  });

  const body = [
    "Coffee Chat の新規申し込みがありました。",
    "",
    "---",
    `申込日時: ${params.submittedAt}`,
    `お名前: ${params.name}`,
    `メールアドレス: ${params.email}`,
    `話したい内容:`,
    params.topic,
    "",
    `第1希望: ${params.person1}`,
    `第2希望: ${params.person2}`,
    "---",
  ].join("\n");

  const fromDisplayName = getEnvValue("EMAIL_FROM_NAME") ?? "INSEAD Coffee Chat";
  const fromAddress = `${fromDisplayName} <${emailUser}>`;

  try {
    await transporter.verify();
  } catch (verifyErr) {
    console.error("[Contact API] SMTP接続エラー（認証失敗の可能性）:", verifyErr);
    return "failed";
  }

  const mailOptions = {
    from: fromAddress,
    to: notificationEmail,
    subject: "【Coffee Chat新規申し込み】確認してください",
    text: body,
  };

  const attemptSend = async (): Promise<"sent" | "failed"> => {
    try {
      await transporter.sendMail(mailOptions);
      console.log(
        `[Contact API] メール送信成功: ${params.submittedAt} → ${notificationEmail}`,
      );
      return "sent";
    } catch (err) {
      console.error("[Contact API] メール送信エラー:", err);
      return "failed";
    }
  };

  let result = await attemptSend();
  if (result === "failed") {
    await new Promise((r) => setTimeout(r, 3000));
    result = await attemptSend();
    if (result === "failed") {
      console.error("[Contact API] リトライ後も送信失敗");
    }
  }
  return result;
}

export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { success: false, message: "リクエスト形式が不正です。" },
      { status: 400 },
    );
  }

  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const topic = payload.topic?.trim() ?? "";
  const person1 = payload.person1?.trim() || DEFAULT_OPTION;
  const person2 = payload.person2?.trim() || DEFAULT_OPTION;

  if (!name || !email || !topic) {
    return NextResponse.json(
      { success: false, message: "必須項目を入力してください。" },
      { status: 400 },
    );
  }

  const submittedAt = getJstTimestamp();
  let emailStatus = "送信済み";

  try {
    const mailResult = await sendNotificationEmail({
      submittedAt,
      name,
      email,
      topic,
      person1,
      person2,
    });
    if (mailResult === "skipped") emailStatus = "メール未設定";
    else if (mailResult === "failed") emailStatus = "送信失敗";
    if (mailResult !== "sent") {
      console.warn(`[Contact API] 申込 ${submittedAt}: メール${emailStatus}`);
      sendEmailFailureAlert({ submittedAt, name, email, emailStatus });
    }
  } catch (err) {
    emailStatus = "送信失敗";
    console.error("[Contact API] メール送信処理で例外:", err);
    sendEmailFailureAlert({ submittedAt, name, email, emailStatus });
  }

  if (isSheetConfigured()) {
    try {
      await appendCoffeeChatToSheet({
        submittedAt,
        name,
        email,
        topic,
        person1,
        person2,
        emailStatus,
      });
    } catch (err) {
      console.error("[Contact API] Sheet append error:", err);
      return NextResponse.json(
        {
          success: false,
          message: "申し込み処理中にエラーが発生しました。しばらくしてから再度お試しください。",
        },
        { status: 500 },
      );
    }
  }

  const emailSent = emailStatus === "送信済み";
  return NextResponse.json({ success: true, emailSent });
}
