import { PageHero } from "../../_components/PageHero";
import Pagination from "../../../components/Pagination";
import { StudentsProfilesDirectory } from "./_components/StudentsProfilesDirectory";
import {
  fetchGalleryItems,
  getBlogSheetRows,
  getDriveImageFiles,
  getProfileSheetRows,
} from "../../../lib/googleData";
import { parseBlogPosts } from "../../../lib/studentsBlog";

export const revalidate = 0;

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop";

export default async function StudentsProfilesPage() {
  const [profileRows, blogRows, driveFiles, galleryRows] = await Promise.all([
    getProfileSheetRows(),
    getBlogSheetRows(),
    getDriveImageFiles(),
    fetchGalleryItems().catch(() => []),
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

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero src={HERO_IMAGE_URL} alt="在校生プロフィール一覧" title="在校生プロフィール一覧" />
      <div className="mx-auto max-w-6xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <StudentsProfilesDirectory rows={profileRows} blogPosts={blogPosts} galleryPosts={galleryPosts} />
        <Pagination />
      </div>
    </div>
  );
}
