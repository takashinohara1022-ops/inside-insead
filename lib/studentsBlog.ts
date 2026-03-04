import Papa from "papaparse";

export const STUDENTS_BLOG_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1AmUHbN3E-AN_Vmc3Wc2LU951_YihjP2o1xKyLY1cypI/export?format=csv";

export type BlogPost = {
  id: string;
  postedAt: string;
  postedAtDate: Date | null;
  author: string;
  title: string;
  body: string;
  mediaUrls: string[];
  youtubeLink: string;
  campus: "Fonty" | "Singy" | "Other";
  hashtags: string[];
};

export type CsvRow = Record<string, string | undefined>;

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

function getByHeaderMatch(row: CsvRow, keywords: string[]): string {
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
  const normalized = text.replace(/\./g, "/").replace(/-/g, "/");
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

export function parseBlogPosts(csvText: string): BlogPost[] {
  const parsed = Papa.parse<CsvRow>(csvText, { header: true, skipEmptyLines: true });

  return parsed.data
    .map((row, index) => {
      const postedAt = getByHeaderMatch(row, ["投稿日"]);
      const author = getByHeaderMatch(row, ["投稿者"]);
      const title = getByHeaderMatch(row, ["タイトル"]);
      const body = getByHeaderMatch(row, ["本文"]);
      const themeRaw = getByHeaderMatch(row, ["テーマ", "ハッシュタグ"]);
      const mediaRaw = getByHeaderMatch(row, ["写真や動画", "メディア"]);
      const youtubeLink = getByHeaderMatch(row, ["Youtube", "YouTube", "リンク"]);
      const hashtags = splitByComma(themeRaw).map(normalizeHashtag).filter(Boolean);
      const mediaUrls = splitByComma(mediaRaw);
      const postedAtDate = parseBlogDate(postedAt);

      return {
        id: `${title || "blog"}-${index}`,
        postedAt,
        postedAtDate,
        author: author || "匿名",
        title: title || "無題",
        body: body || "",
        mediaUrls,
        youtubeLink,
        campus: detectCampus(hashtags),
        hashtags,
      } satisfies BlogPost;
    })
    .sort((a, b) => {
      const aTime = a.postedAtDate?.getTime() ?? 0;
      const bTime = b.postedAtDate?.getTime() ?? 0;
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

export function guessDriveMediaType(url: string): "image" | "video" {
  const lower = url.toLowerCase();
  if (/\.(mp4|mov|webm|ogg)(\?|$)/.test(lower)) return "video";
  if (lower.includes("video")) return "video";
  return "image";
}

export function getMediaSources(post: BlogPost): MediaSource[] {
  const youtubeEmbed = toYouTubeEmbedUrl(post.youtubeLink);
  if (youtubeEmbed) return [{ kind: "youtube", src: youtubeEmbed }];

  const mediaSources = post.mediaUrls
    .map((url) => {
      const driveFileId = extractDriveFileId(url);
      const src = driveFileId ? `https://drive.google.com/uc?export=view&id=${driveFileId}` : url;
      return {
        kind: guessDriveMediaType(url),
        src,
        driveFileId: driveFileId ?? undefined,
      } satisfies MediaSource;
    })
    .filter((item) => Boolean(item.src));

  if (mediaSources.length > 0) return mediaSources;
  return [{ kind: "none" }];
}

export function getCardBackgroundImage(post: BlogPost): string | null {
  const media = getMediaSources(post)[0];
  if (!media) return null;
  if (media.kind === "youtube") return toYouTubeThumbnailUrl(post.youtubeLink);
  if (media.kind === "image" && media.driveFileId) {
    return `https://drive.google.com/thumbnail?id=${media.driveFileId}&sz=w2000`;
  }
  if (media.kind === "image" && media.src) return media.src;
  return null;
}
