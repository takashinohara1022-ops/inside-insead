import { getCategoryByPath } from "../../../constants/navigationConfig";
import { PageHero } from "../../_components/PageHero";
import Pagination from "../../../components/Pagination";
import { StudentsBlogBoard } from "./_components/StudentsBlogBoard";
import { getBlogSheetRows, getDriveImageFiles } from "../../../lib/googleData";
import { parseBlogPosts } from "../../../lib/studentsBlog";
import { Suspense } from "react";

export const revalidate = 3600;

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop";

export default async function StudentsBlogPage() {
  const category = getCategoryByPath("/students");
  const blogPage = category?.pages.find((page) => page.path === "/students/blog");
  const title = blogPage?.title ?? "在校生ブログ";
  const [blogRows, driveFiles] = await Promise.all([getBlogSheetRows(), getDriveImageFiles()]);
  const posts = parseBlogPosts(blogRows, driveFiles);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero src={HERO_IMAGE_URL} alt={title} title={title} />
      <div className="mx-auto max-w-6xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <Suspense
          fallback={
            <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-slate-600">
              ブログを読み込み中です...
            </div>
          }
        >
          <StudentsBlogBoard posts={posts} />
        </Suspense>
        <Pagination />
      </div>
    </div>
  );
}
