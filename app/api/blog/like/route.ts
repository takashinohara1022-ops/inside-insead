import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const LIKES_KEY_PREFIX = "blog:likes:";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function likesKey(postId: string): string {
  return `${LIKES_KEY_PREFIX}${postId}`;
}

function isValidPostId(id: string): boolean {
  return id.length > 0 && id.length <= 200 && !id.includes(":");
}

export async function POST(request: Request) {
  let body: { postId?: string; clientId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const postId = body.postId?.trim();
  const clientId = body.clientId?.trim();

  if (!postId || !isValidPostId(postId)) {
    return NextResponse.json({ error: "Valid postId is required" }, { status: 400 });
  }
  if (!clientId || !UUID_REGEX.test(clientId)) {
    return NextResponse.json({ error: "Valid clientId (UUID) is required" }, { status: 400 });
  }

  const key = likesKey(postId);

  try {
    const isMember = await kv.sismember(key, clientId);
    if (isMember) {
      await kv.srem(key, clientId);
      const count = await kv.scard(key);
      return NextResponse.json({ count: count ?? 0, liked: false });
    }
    await kv.sadd(key, clientId);
    const count = await kv.scard(key);
    return NextResponse.json({ count: count ?? 0, liked: true });
  } catch (err) {
    console.error("Blog like POST error:", err);
    return NextResponse.json(
      { error: "Failed to update like" },
      { status: 500 },
    );
  }
}
