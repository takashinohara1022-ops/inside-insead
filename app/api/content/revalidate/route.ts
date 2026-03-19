import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("authorization") ?? "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return false;

  const allowed = [
    process.env.CONTENT_REVALIDATE_TOKEN,
    process.env.HISTORY_REVALIDATE_TOKEN,
    process.env.CULTURE_REVALIDATE_TOKEN,
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  return allowed.includes(token);
}

function triggerContentRevalidation() {
  revalidateTag("history-doc", "max");
  revalidateTag("culture-doc", "max");
  revalidateTag("page-content-docs", "max");

  const paths = [
    "/about",
    "/about/history",
    "/about/culture",
    "/about/programs",
    "/about/campuses",
    "/about/exchange",
    "/history",
    "/culture",
    "/student-life",
    "/student-life/yearly-schedule",
    "/student-life/academic-terms",
    "/student-life/academic-classes",
    "/student-life/academic-faculty",
    "/student-life/career",
    "/student-life/social-clubs",
    "/student-life/social-events",
  ];

  paths.forEach((path) => revalidatePath(path));
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  triggerContentRevalidation();
  return NextResponse.json({
    ok: true,
    message: "All content pages cache revalidated",
    at: new Date().toISOString(),
  });
}
