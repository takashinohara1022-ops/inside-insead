import { PageHero } from "../_components/PageHero";
import Pagination from "../../components/Pagination";
import { getBlogSheetRows, getDriveImageFiles } from "../../lib/googleData";
import { getMediaSources, parseBlogPosts } from "../../lib/studentsBlog";
import { BlogGallery, type GalleryItem } from "./_components/BlogGallery";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop";

export const revalidate = 3600;

export default async function GalleryPage() {
  const [blogRows, driveFiles] = await Promise.all([getBlogSheetRows(), getDriveImageFiles()]);
  const posts = parseBlogPosts(blogRows, driveFiles);

  const galleryItems: GalleryItem[] = posts.flatMap((post) =>
    getMediaSources(post)
      .filter((media) => media.kind === "image")
      .map((media, index) => {
        const candidates = media.driveFileId
          ? [
              `https://drive.google.com/thumbnail?id=${media.driveFileId}&sz=w2000`,
              `https://drive.google.com/uc?export=view&id=${media.driveFileId}`,
              `https://drive.google.com/uc?export=download&id=${media.driveFileId}`,
            ]
          : media.src
            ? [media.src]
            : [];
        return {
          id: `${post.id}-image-${index}`,
          postId: post.id,
          postTitle: post.title,
          postedAt: post.postedAt,
          author: post.author,
          hashtags: post.hashtags,
          candidates,
        };
      })
      .filter((item) => item.candidates.length > 0),
  );

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="キャンパス・学生生活のイメージ"
        title="ギャラリー"
      />
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12 lg:py-20">
        <p className="mb-6 leading-relaxed text-slate-600 sm:text-[15px]">
          在校生ブログに投稿された写真を、最新投稿順に掲載しています。気になる写真から元の記事へ遷移できます。
        </p>
        <BlogGallery items={galleryItems} />
        <Pagination />
      </div>
    </div>
  );
}
