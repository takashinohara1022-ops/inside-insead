import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

function isAuthorized(request: Request): boolean {
  const expectedToken = process.env.CULTURE_REVALIDATE_TOKEN;
  if (!expectedToken) return false;

  const authHeader = request.headers.get("authorization") ?? "";
  const [scheme, token] = authHeader.split(" ");
  return scheme === "Bearer" && token === expectedToken;
}

function triggerCultureRevalidation() {
  revalidateTag("culture-doc", "max");
  revalidatePath("/culture");
  revalidatePath("/about/culture");
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  triggerCultureRevalidation();
  return NextResponse.json({
    ok: true,
    message: "Culture cache revalidated",
    at: new Date().toISOString(),
  });
}
