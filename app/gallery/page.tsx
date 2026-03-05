import { PageHero } from "../_components/PageHero";
import Pagination from "../../components/Pagination";
import { getBlogSheetRows, getDriveImageFiles, getGalleryImageFiles } from "../../lib/googleData";
import { getMediaSources, parseBlogPosts } from "../../lib/studentsBlog";
import { BlogGallery, type GalleryItem } from "./_components/BlogGallery";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop";

export const revalidate = 3600;

export default async function GalleryPage() {
  const [blogRows, driveFiles, galleryFolderFiles] = await Promise.all([
    getBlogSheetRows(),
    getDriveImageFiles(),
    getGalleryImageFiles(),
  ]);
  const posts = parseBlogPosts(blogRows, driveFiles);

  const blogImageItems: GalleryItem[] = posts.flatMap((post) =>
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
  const folderImageItems: GalleryItem[] = galleryFolderFiles.map((file) => ({
    id: `gallery-folder-${file.id}`,
    postTitle: file.name,
    postedAt: "-",
    author: "Gallery",
    hashtags: [],
    candidates: [
      `https://drive.google.com/thumbnail?id=${file.id}&sz=w2000`,
      `https://drive.google.com/uc?export=view&id=${file.id}`,
      `https://drive.google.com/uc?export=download&id=${file.id}`,
    ],
  }));
  const deduped = new Map<string, GalleryItem>();
  [...blogImageItems, ...folderImageItems].forEach((item) => {
    const key = item.candidates[0] ?? item.id;
    if (!deduped.has(key)) deduped.set(key, item);
  });
  const galleryItems: GalleryItem[] = Array.from(deduped.values());

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="キャンパス・学生生活のイメージ"
        title="ギャラリー"
      />
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12 lg:py-20">
        <p className="mb-6 leading-relaxed text-slate-600 sm:text-[15px]">
          在校生ブログに投稿された写真と、ギャラリー専用フォルダの画像を統合表示しています。気になる写真は拡大表示できます。
        </p>
        <BlogGallery items={galleryItems} />
        <Pagination />
      </div>
    </div>
  );
}
