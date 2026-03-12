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
    return "skipped";
  }

  const smtpHost = getEnvValue("SMTP_HOST") ?? "smtp.gmail.com";
  const smtpPort = Number(getEnvValue("SMTP_PORT") ?? "587");
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
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

  try {
    await transporter.sendMail({
      from: emailUser,
      to: notificationEmail,
      subject: "【Coffee Chat新規申し込み】確認してください",
      text: body,
    });
    return "sent";
  } catch (err) {
    console.error("[Contact API] Nodemailer error:", err);
    return "failed";
  }
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
  } catch {
    emailStatus = "送信失敗";
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

  return NextResponse.json({ success: true });
}
