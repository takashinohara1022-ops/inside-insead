import { PageHero } from "../_components/PageHero";
import Pagination from "../../components/Pagination";
import {
  buildAuthorProfileHrefMap,
  fetchStudents,
  getBlogSheetRows,
  getDriveImageFiles,
  getDriveImageFilesByFolderId,
  getGalleryImageFiles,
  getGalleryUploadSheetRows,
  type SheetRow,
} from "../../lib/googleData";
import {
  extractDriveFileId,
  getMediaSources,
  parseBlogPosts,
  toDriveProxyUrl,
} from "../../lib/studentsBlog";
import { BlogGallery, type GalleryItem } from "./_components/BlogGallery";

const HERO_IMAGE_URL = "/images/gallery-hero.png";
const EMBEDDED_BLOG_IMAGE_FOLDER_ID = "1zsXGxjInn2WNFxO6_xuFgCOAEAPJ9fyV";

export const revalidate = 0;

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

/** 表示用日付文字列からソート用タイムスタンプを取得。取れない場合は 0 */
function parseLooseDateToTimestamp(value: string): number {
  const text = value.trim();
  if (!text) return 0;
  const normalized = text
    .replace(/[年.]/g, "/")
    .replace(/[月]/g, "/")
    .replace(/[日]/g, "")
    .replace(/-/g, "/");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function splitMultiValue(value: string): string[] {
  return value
    .split(/[,，\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function extractDriveIdsFromMarkdownBody(body: string): string[] {
  if (!body?.trim()) return [];
  const ids = new Set<string>();
  const markdownImageRegex = /!\[[^\]]*]\(([^)]+)\)/g;
  let imageMatch: RegExpExecArray | null;
  while ((imageMatch = markdownImageRegex.exec(body)) !== null) {
    const url = imageMatch[1];
    const id = extractDriveFileId(url);
    if (id) ids.add(id);
  }

  const urlRegex = /https?:\/\/[^\s)"']+/g;
  const urlMatches = body.match(urlRegex) ?? [];
  urlMatches.forEach((url) => {
    const id = extractDriveFileId(url);
    if (id) ids.add(id);
  });

  return Array.from(ids);
}

async function safeGetBlogRows() {
  try {
    return await getBlogSheetRows();
  } catch {
    return [];
  }
}

async function safeGetDriveImageFiles() {
  try {
    return await getDriveImageFiles();
  } catch {
    return [];
  }
}

async function safeGetGalleryImageFiles() {
  try {
    return await getGalleryImageFiles();
  } catch {
    return [];
  }
}

async function safeGetEmbeddedBlogImageFiles() {
  try {
    return await getDriveImageFilesByFolderId(EMBEDDED_BLOG_IMAGE_FOLDER_ID);
  } catch {
    return [];
  }
}

async function safeGetGalleryUploadSheetRows() {
  try {
    return await getGalleryUploadSheetRows();
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const [blogRows, driveFiles, galleryFolderFiles, embeddedBlogFolderFiles, galleryUploadRows, students] =
    await Promise.all([
    safeGetBlogRows(),
    safeGetDriveImageFiles(),
    safeGetGalleryImageFiles(),
    safeGetEmbeddedBlogImageFiles(),
    safeGetGalleryUploadSheetRows(),
    fetchStudents().catch(() => []),
  ]);
  const authorProfileHrefMap = buildAuthorProfileHrefMap(students);

  const posts = parseBlogPosts(blogRows, driveFiles);
  const formMetaByDriveId = new Map<
    string,
    {
      author: string;
      postedAt: string;
      sortTimestamp: number;
      comment?: string;
      postId?: string;
      postTitle?: string;
      hashtags?: string[];
    }
  >();

  posts.forEach((post) => {
    const sortTimestamp = post.postedAtTimestamp ?? 0;
    const mediaIds = new Set<string>();
    getMediaSources(post).forEach((media) => {
      if (media.driveFileId) mediaIds.add(media.driveFileId);
      if (!media.driveFileId && media.src) {
        const extracted = extractDriveFileId(media.src);
        if (extracted) mediaIds.add(extracted);
      }
    });
    extractDriveIdsFromMarkdownBody(post.body).forEach((id) => {
      mediaIds.add(id);
    });
    mediaIds.forEach((id) => {
      formMetaByDriveId.set(id, {
        author: post.author,
        postedAt: post.postedAt,
        sortTimestamp,
        postId: post.id,
        postTitle: post.title,
        hashtags: post.hashtags,
      });
    });
  });

  galleryUploadRows.forEach((row) => {
    const author =
      getByHeaderMatch(row, [
        "アップロード者名",
        "氏名",
        "お名前",
        "名前",
        "投稿者",
        "ニックネーム",
      ]) || "不明";
    const postedAtRaw = getByHeaderMatch(row, ["アップロード日", "投稿日", "日付", "タイムスタンプ"]);
    const postedAt = parseLooseDate(postedAtRaw);
    const sortTimestamp = parseLooseDateToTimestamp(postedAtRaw);
    const comment = getByHeaderMatch(row, ["写真コメント", "コメント", "写真のコメント"]);
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
      formMetaByDriveId.set(id, { author, postedAt, sortTimestamp, comment: comment || undefined });
    });
  });

  // Blog側は「カバー画像（先頭画像）」のみ表示対象にする
  const coverDriveIds = new Set<string>();
  const blogImageItems: GalleryItem[] = posts.flatMap((post) => {
    const firstImage = getMediaSources(post).find((media) => media.kind === "image");
    if (!firstImage) return [];
    if (firstImage.driveFileId) coverDriveIds.add(firstImage.driveFileId);
    const candidates = firstImage.driveFileId
      ? [toDriveProxyUrl(firstImage.driveFileId)]
      : firstImage.src
        ? [firstImage.src]
        : [];
    if (candidates.length === 0) return [];
    return [
      {
        id: `${post.id}-cover`,
        postId: post.id,
        postTitle: post.title,
        postedAt: post.postedAt,
        author: post.author,
        hashtags: post.hashtags,
        candidates,
        sortTimestamp: post.postedAtTimestamp ?? 0,
      },
    ];
  });
  // はめ込み画像フォルダ側は、カバー画像と同一IDの画像を除外して重複を防ぐ
  const allFolderFiles = [...galleryFolderFiles, ...embeddedBlogFolderFiles].filter(
    (file) => !coverDriveIds.has(file.id),
  );
  const folderImageItems: GalleryItem[] = allFolderFiles.map((file) => {
    const meta = formMetaByDriveId.get(file.id);
    const postedAt = meta?.postedAt ?? formatUploadDate(file.createdTime);
    const sortTimestamp =
      meta?.sortTimestamp ??
      (file.createdTime ? new Date(file.createdTime).getTime() : 0);
    return {
      id: `gallery-folder-${file.id}`,
      postId: meta?.postId,
      postTitle: meta?.postTitle ?? file.name,
      postedAt,
      author:
        meta?.author ??
        inferUploaderFromFileName(file.name) ??
        file.ownerName ??
        "不明",
      isGalleryUpload: !meta?.postId,
      hashtags: meta?.hashtags ?? [],
      candidates: [toDriveProxyUrl(file.id)],
      sortTimestamp,
      photoComment: meta?.comment,
    };
  });
  const deduped = new Map<string, GalleryItem>();
  [...folderImageItems, ...blogImageItems].forEach((item) => {
    const key = item.candidates[0] ?? item.id;
    if (!deduped.has(key)) deduped.set(key, item);
  });
  const galleryItems: GalleryItem[] = Array.from(deduped.values()).sort(
    (a, b) => (b.sortTimestamp ?? 0) - (a.sortTimestamp ?? 0),
  );

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="多国旗がはためくINSEADフォンテーヌブローキャンパスのガラス張り校舎"
        title="ギャラリー"
      />
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12 lg:py-20">
        <p className="mb-6 leading-relaxed text-slate-600 sm:text-[15px]">
          投稿された写真を一覧表示しています。各写真に貼付けられたリンクから投稿者プロフィールやBlog投稿元へ遷移することができます。
        </p>
        <BlogGallery items={galleryItems} authorProfileHrefMap={authorProfileHrefMap} />
        <Pagination />
      </div>
    </div>
  );
}
