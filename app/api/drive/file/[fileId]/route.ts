import { NextResponse } from "next/server";
import { getGoogleAuthHeader } from "../../../../../lib/googleServiceAccount";

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await context.params;
  if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return NextResponse.json({ ok: false, message: "Invalid file id" }, { status: 400 });
  }

  let authHeader: Record<string, string>;
  try {
    authHeader = await getGoogleAuthHeader(["https://www.googleapis.com/auth/drive.readonly"]);
  } catch {
    return NextResponse.json(
      { ok: false, message: "Service account credentials are not configured" },
      { status: 500 },
    );
  }

  const upstream = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    {
      headers: {
        Authorization: authHeader.Authorization,
      },
      cache: "no-store",
    },
  );

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { ok: false, message: `Failed to fetch drive file: ${upstream.status}` },
      { status: upstream.status || 502 },
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
