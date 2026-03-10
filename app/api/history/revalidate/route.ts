import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

function isAuthorized(request: Request): boolean {
  const expectedToken = process.env.HISTORY_REVALIDATE_TOKEN;
  if (!expectedToken) return true;

  const { searchParams } = new URL(request.url);
  const providedToken = searchParams.get("token");
  return providedToken === expectedToken;
}

function triggerHistoryRevalidation() {
  revalidateTag("history-doc");
  revalidatePath("/history");
  revalidatePath("/about/history");
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  triggerHistoryRevalidation();
  return NextResponse.json({
    ok: true,
    message: "History cache revalidated",
    at: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  triggerHistoryRevalidation();
  return NextResponse.json({
    ok: true,
    message: "History cache revalidated",
    at: new Date().toISOString(),
  });
}
