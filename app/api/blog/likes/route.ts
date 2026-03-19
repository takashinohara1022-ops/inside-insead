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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postIdsParam = searchParams.get("postIds");
  const clientId = searchParams.get("clientId") ?? null;

  if (!postIdsParam) {
    return NextResponse.json({ error: "postIds is required" }, { status: 400 });
  }

  const postIds = postIdsParam.split(",").map((id) => id.trim()).filter(Boolean);
  if (postIds.length === 0) {
    return NextResponse.json({ error: "At least one postId is required" }, { status: 400 });
  }
  if (postIds.length > 50) {
    return NextResponse.json({ error: "Too many postIds" }, { status: 400 });
  }

  for (const id of postIds) {
    if (!isValidPostId(id)) {
      return NextResponse.json({ error: `Invalid postId: ${id}` }, { status: 400 });
    }
  }

  const validClientId = clientId && UUID_REGEX.test(clientId) ? clientId : null;

  try {
    const results: Record<string, { count: number; liked: boolean }> = {};

    await Promise.all(
      postIds.map(async (postId) => {
        const key = likesKey(postId);
        const [count, liked] = await Promise.all([
          kv.scard(key),
          validClientId ? kv.sismember(key, validClientId) : Promise.resolve(false),
        ]);
        results[postId] = { count: count ?? 0, liked: !!liked };
      }),
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error("Blog likes GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 },
    );
  }
}
