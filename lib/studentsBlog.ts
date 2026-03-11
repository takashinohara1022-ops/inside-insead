import type { DriveImageFile, SheetRow } from "./googleData";

export type BlogPost = {
  id: string;
  postedAt: string;
  postedAtTimestamp: number | null;
  author: string;
  title: string;
  body: string;
  mediaUrls: string[];
  youtubeLink: string;
  campus: "Fonty" | "Singy" | "Other";
  hashtags: string[];
  mediaFiles: DriveImageFile[];
};

export type MediaKind = "youtube" | "image" | "video" | "none";
export type MediaSource = {
  kind: MediaKind;
  src?: string;
  driveFileId?: string;
};

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeForMatch(value: string): string {
  return normalizeText(value).toLowerCase();
}

function getByHeaderMatch(row: SheetRow, keywords: string[]): string {
  const entries = Object.entries(row);
  for (const [header, rawValue] of entries) {
    const normalizedHeader = normalizeForMatch(header);
    const hit = keywords.some((keyword) => normalizedHeader.includes(normalizeForMatch(keyword)));
    if (hit) return (rawValue ?? "").trim();
  }
  return "";
}

export function parseBlogDate(value: string): Date | null {
  const text = value.trim();
  if (!text) return null;
  const normalized = text
    .replace(/[年.]/g, "/")
    .replace(/[月]/g, "/")
    .replace(/[日]/g, "")
    .replace(/-/g, "/");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function splitByComma(raw: string): string[] {
  return raw
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function detectCampus(tags: string[]): "Fonty" | "Singy" | "Other" {
  const normalized = tags.map((tag) => normalizeForMatch(tag));
  if (normalized.some((tag) => tag.includes("font"))) return "Fonty";
  if (normalized.some((tag) => tag.includes("sing"))) return "Singy";
  return "Other";
}

function normalizeHashtag(tag: string): string {
  return tag.replace(/^#/, "").trim();
}

function resolveDriveFilesFromMediaRaw(mediaRaw: string, driveFiles: DriveImageFile[]): DriveImageFile[] {
  const tokens = splitByComma(mediaRaw);
  if (tokens.length === 0) return [];
  const resolved = tokens
    .map((token) => {
      const tokenId = extractDriveFileId(token);
      if (tokenId) {
        const byId = driveFiles.find((file) => file.id === tokenId);
        return byId ?? { id: tokenId, name: token, mimeType: "" };
      }
      return driveFiles.find((file) => file.name === token || file.name.includes(token));
    })
    .filter((file): file is DriveImageFile => Boolean(file));
  const byId = new Map<string, DriveImageFile>();
  resolved.forEach((file) => byId.set(file.id, file));
  return Array.from(byId.values());
}

export function parseBlogPosts(rows: SheetRow[], driveFiles: DriveImageFile[] = []): BlogPost[] {
  return rows
    .map((row, index) => {
      const postedAt = getByHeaderMatch(row, ["投稿日"]);
      const author = getByHeaderMatch(row, ["投稿者"]);
      const title = getByHeaderMatch(row, ["タイトル"]);
      const body = getByHeaderMatch(row, ["本文"]);
      const themeRaw = getByHeaderMatch(row, ["テーマ", "ハッシュタグ"]);
      const mediaRaw = getByHeaderMatch(row, ["写真や動画", "写真", "画像", "メディア"]);
      const youtubeLink = getByHeaderMatch(row, ["Youtube", "YouTube", "リンク", "リンクなど"]);
      const hashtags = splitByComma(themeRaw).map(normalizeHashtag).filter(Boolean);
      const mediaUrls = splitByComma(mediaRaw);
      const postedAtDate = parseBlogDate(postedAt);
      const mediaFiles = resolveDriveFilesFromMediaRaw(mediaRaw, driveFiles);

      return {
        id: `${title || "blog"}-${index}`,
        postedAt,
        postedAtTimestamp: postedAtDate?.getTime() ?? null,
        author: author || "匿名",
        title: title || "無題",
        body: body || "",
        mediaUrls,
        youtubeLink,
        campus: detectCampus(hashtags),
        hashtags,
        mediaFiles,
      } satisfies BlogPost;
    })
    .sort((a, b) => {
      const aTime = a.postedAtTimestamp ?? 0;
      const bTime = b.postedAtTimestamp ?? 0;
      return bTime - aTime;
    });
}

export function toYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedIndex = parts.findIndex((part) => part === "embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIndex + 1]}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function toYouTubeThumbnailUrl(url: string): string | null {
  const embed = toYouTubeEmbedUrl(url);
  if (!embed) return null;
  const id = embed.split("/embed/")[1];
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const text = url.trim();
  const idParam = text.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParam?.[1]) return idParam[1];
  const pathParam = text.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (pathParam?.[1]) return pathParam[1];
  return null;
}

export function toDriveProxyUrl(fileId: string): string {
  return `/api/drive/file/${encodeURIComponent(fileId)}`;
}

export function guessDriveMediaType(url: string): "image" | "video" {
  const lower = url.toLowerCase();
  if (/\.(mp4|mov|webm|ogg)(\?|$)/.test(lower)) return "video";
  if (lower.includes("video")) return "video";
  return "image";
}

export function getMediaSources(post: BlogPost): MediaSource[] {
  const youtubeEmbed = toYouTubeEmbedUrl(post.youtubeLink);
  if (youtubeEmbed) return [{ kind: "youtube", src: youtubeEmbed }];

  const fromDriveFiles = post.mediaFiles.map((file) => ({
    kind: file.mimeType.startsWith("video/") ? ("video" as const) : ("image" as const),
    src: toDriveProxyUrl(file.id),
    driveFileId: file.id,
  }));

  const fromUrls = post.mediaUrls
    .map((url) => {
      const driveFileId = extractDriveFileId(url);
      const src = driveFileId ? toDriveProxyUrl(driveFileId) : url;
      return {
        kind: guessDriveMediaType(url),
        src,
        driveFileId: driveFileId ?? undefined,
      } satisfies MediaSource;
    })
    .filter((item) => Boolean(item.src));

  const mediaSources = [...fromDriveFiles, ...fromUrls];
  const deduped = new Map<string, MediaSource>();
  mediaSources.forEach((item, index) => {
    const key = item.driveFileId ?? item.src ?? `unknown-${index}`;
    if (!deduped.has(key)) deduped.set(key, item);
  });
  const uniqueMedia = Array.from(deduped.values());

  if (uniqueMedia.length > 0) return uniqueMedia;
  return [{ kind: "none" }];
}

export function getCardBackgroundImage(post: BlogPost): string | null {
  const media = getMediaSources(post)[0];
  if (!media) return null;
  if (media.kind === "youtube") return toYouTubeThumbnailUrl(post.youtubeLink);
  if (media.kind === "image" && media.driveFileId) {
    return toDriveProxyUrl(media.driveFileId);
  }
  if (media.kind === "image" && media.src) return media.src;
  return null;
}
