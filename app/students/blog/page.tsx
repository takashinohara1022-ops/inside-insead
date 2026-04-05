import { getCategoryByPath } from "../../../constants/navigationConfig";
import { PageHero } from "../../_components/PageHero";
import Pagination from "../../../components/Pagination";
import { StudentsBlogBoard } from "./_components/StudentsBlogBoard";
import {
  buildAuthorProfileHrefMap,
  fetchStudents,
  getBlogSheetRows,
  getDriveImageFiles,
  normalizeJoinKey,
} from "../../../lib/googleData";
import { parseBlogPosts } from "../../../lib/studentsBlog";
import { Suspense } from "react";

export const revalidate = 0;

const HERO_IMAGE_URL = "/images/students-blog-hero.png";

export default async function StudentsBlogPage() {
  const category = getCategoryByPath("/students");
  const blogPage = category?.pages.find((page) => page.path === "/students/blog");
  const title = blogPage?.title ?? "在校生ブログ";
  const [blogRows, driveFiles, students] = await Promise.all([
    getBlogSheetRows(),
    getDriveImageFiles(),
    fetchStudents().catch(() => []),
  ]);
  const posts = parseBlogPosts(blogRows, driveFiles);
  const authorProfileHrefMap = buildAuthorProfileHrefMap(students);
  const authorDisplayNameMap = Object.fromEntries(
    students.map((student) => [normalizeJoinKey(student.uniqueDisplayName), student.uniqueDisplayName]),
  );

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero src={HERO_IMAGE_URL} alt="INSEADライブラリー。木製の曲線天井、カラフルなブース、書架、学習スペース" title={title} />
      <div className="mx-auto max-w-6xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <Suspense
          fallback={
            <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-slate-600">
              ブログを読み込み中です...
            </div>
          }
        >
          <StudentsBlogBoard
            posts={posts}
            authorProfileHrefMap={authorProfileHrefMap}
            authorDisplayNameMap={authorDisplayNameMap}
          />
        </Suspense>
        <Pagination />
      </div>
    </div>
  );
}
