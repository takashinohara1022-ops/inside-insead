/**
 * タイル抜粋用: マークダウンを装飾なしプレーンに近づける。
 * 単一テキストノード + line-clamp と相性が良い。
 */
export function blogBodyToPlainPreview(source: string, maxLen = 12000): string {
  let s = source.trim().slice(0, maxLen);
  s = s.replace(/\r\n/g, "\n");
  s = s.replace(/```[\s\S]*?```/g, " ");
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/!\[[^\]]*]\([^)]*\)/g, "");
  s = s.replace(/\[([^\]]+)]\([^)]*\)/g, "$1");
  s = s.replace(/^#{1,6}\s+/gm, "");
  s = s.replace(/^>\s?/gm, "");
  s = s.replace(/^\s*[-*+]\s+/gm, "");
  s = s.replace(/^\s*\d+\.\s+/gm, "");
  s = s.replace(/\*\*|__|~~|\*|_/g, "");
  s = s.replace(/^\|.*\|$/gm, (line) => line.replace(/\|/g, " "));
  s = s.replace(/\n+/g, " ");
  s = s.replace(/\s+/g, " ");
  return s.trim();
}
