import { PageHero } from "../_components/PageHero";
import Pagination from "../../components/Pagination";
import {
  getBlogSheetRows,
  getDriveImageFiles,
  getGalleryImageFiles,
  getGalleryUploadSheetRows,
  type SheetRow,
} from "../../lib/googleData";
import { extractDriveFileId, getMediaSources, parseBlogPosts } from "../../lib/studentsBlog";
import { BlogGallery, type GalleryItem } from "./_components/BlogGallery";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop";

export const revalidate = 3600;

function formatUploadDate(createdTime?: string): string {
  if (!createdTime) return "-";
  const date = new Date(createdTime);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function inferUploaderFromFileName(fileName: string): string | null {
  const base = fileName.replace(/\.[^/.]+$/, "");
  const parts = base.split(" - ").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1];
  return null;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, "").trim().toLowerCase();
}

function getByHeaderMatch(row: SheetRow, keywords: string[]): string {
  for (const [header, value] of Object.entries(row)) {
    const normalizedHeader = normalizeText(header);
    if (keywords.some((keyword) => normalizedHeader.includes(normalizeText(keyword)))) {
      return String(value ?? "").trim();
    }
  }
  return "";
}

function parseLooseDate(value: string): string {
  const text = value.trim();
  if (!text) return "-";
  const normalized = text
    .replace(/[年.]/g, "/")
    .replace(/[月]/g, "/")
    .replace(/[日]/g, "")
    .replace(/-/g, "/");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return text;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}

function splitMultiValue(value: string): string[] {
  return value
    .split(/[,，\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default async function GalleryPage() {
  const [blogRows, driveFiles, galleryFolderFiles, galleryUploadRows] = await Promise.all([
    getBlogSheetRows(),
    getDriveImageFiles(),
    getGalleryImageFiles(),
    getGalleryUploadSheetRows(),
  ]);
  const posts = parseBlogPosts(blogRows, driveFiles);
  const formMetaByDriveId = new Map<string, { author: string; postedAt: string }>();
  posts.forEach((post) => {
    const mediaIds = new Set<string>();
    getMediaSources(post).forEach((media) => {
      if (media.driveFileId) mediaIds.add(media.driveFileId);
      if (!media.driveFileId && media.src) {
        const extracted = extractDriveFileId(media.src);
        if (extracted) mediaIds.add(extracted);
      }
    });
    mediaIds.forEach((id) => {
      formMetaByDriveId.set(id, { author: post.author, postedAt: post.postedAt });
    });
  });
  galleryUploadRows.forEach((row) => {
    const author =
      getByHeaderMatch(row, ["氏名", "お名前", "名前", "投稿者", "ニックネーム"]) || "不明";
    const postedAtRaw = getByHeaderMatch(row, ["アップロード日", "投稿日", "日付", "タイムスタンプ"]);
    const postedAt = parseLooseDate(postedAtRaw);
    const imageRaw = getByHeaderMatch(row, [
      "自由に画像をアップロード",
      "画像をアップロード",
      "写真",
      "画像",
      "file",
      "drive",
    ]);
    const ids = splitMultiValue(imageRaw)
      .map((value) => extractDriveFileId(value))
      .filter((value): value is string => Boolean(value));
    ids.forEach((id) => {
      formMetaByDriveId.set(id, { author, postedAt });
    });
  });

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
    postedAt: formMetaByDriveId.get(file.id)?.postedAt || formatUploadDate(file.createdTime),
    author:
      formMetaByDriveId.get(file.id)?.author ||
      inferUploaderFromFileName(file.name) ||
      file.ownerName ||
      "不明",
    isGalleryUpload: true,
    hashtags: [],
    candidates: [
      `https://drive.google.com/thumbnail?id=${file.id}&sz=w2000`,
      `https://drive.google.com/uc?export=view&id=${file.id}`,
      `https://drive.google.com/uc?export=download&id=${file.id}`,
    ],
  }));
  const deduped = new Map<string, GalleryItem>();
  [...folderImageItems, ...blogImageItems].forEach((item) => {
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
