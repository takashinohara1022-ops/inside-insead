import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { extractDriveFileId, toDriveProxyUrl } from "../../lib/studentsBlog";
import { DriveMarkdownImage } from "./DriveMarkdownImage";

function toDriveProxyFromUrl(url: string): string {
  const fileId = extractDriveFileId(url);
  if (!fileId) return url;
  return toDriveProxyUrl(fileId);
}

const markdownComponents: Components = {
  img: ({ src, alt, title }) => (
    <DriveMarkdownImage
      src={typeof src === "string" ? toDriveProxyFromUrl(src) : ""}
      alt={typeof alt === "string" ? alt : ""}
      title={typeof title === "string" ? title : undefined}
    />
  ),
};

export function PageMarkdownContent({ content }: { content: string }) {
  if (!content?.trim()) return null;

  return (
    <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-[#005543] prose-a:no-underline hover:prose-a:underline">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
