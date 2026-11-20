import { Suspense } from "react";
import { PageHero } from "../../_components/PageHero";
import Pagination from "../../../components/Pagination";
import { StudentsProfilesDirectory } from "./_components/StudentsProfilesDirectory";
import {
  fetchGalleryItems,
  getAdmissionReportSheetRows,
  getBlogSheetRows,
  getDriveImageFiles,
  getProfileSheetRows,
} from "../../../lib/googleData";
import { parseBlogPosts } from "../../../lib/studentsBlog";

export const revalidate = 300; // 5分キャッシュ（毎回のサーバー処理を防ぐ）

const HERO_IMAGE_URL = "/images/students-profiles-hero.png";

export default async function StudentsProfilesPage() {
  const [profileRows, blogRows, driveFiles, galleryRows, admissionRows] = await Promise.all([
    getProfileSheetRows(),
    getBlogSheetRows(),
    getDriveImageFiles(),
    fetchGalleryItems().catch(() => []),
    getAdmissionReportSheetRows().catch(() => []),
  ]);
  const blogPosts = parseBlogPosts(blogRows, driveFiles).map((post) => ({
    id: post.id,
    title: post.title,
    author: post.author,
  }));
  const galleryPosts = galleryRows.map((item) => ({
    id: item.id,
    postedAt: item.postedAt,
    comment: item.comment,
    author: item.author,
  }));
  const admissionPosts = admissionRows.map((row, index) => {
    const author = (row["投稿者"] ?? Object.values(row)[1] ?? "").replace(/\s+/g, " ").trim();
    return { id: `admission-${index}`, author };
  }).filter((item) => Boolean(item.author));

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero src={HERO_IMAGE_URL} alt="フォンテーヌブロー宮殿の湖畔に建つ歴史的なパビリオン" title="在校生プロフィール一覧" />
      <div className="mx-auto max-w-6xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <Suspense fallback={null}>
          <StudentsProfilesDirectory rows={profileRows} blogPosts={blogPosts} galleryPosts={galleryPosts} admissionPosts={admissionPosts} />
        </Suspense>
        <Pagination />
      </div>
    </div>
  );
}
