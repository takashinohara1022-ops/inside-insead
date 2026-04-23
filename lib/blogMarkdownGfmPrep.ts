function isGfmTableDelimiter(line: string): boolean {
  const t = line.trim();
  if (!t.includes("|")) return false;
  const parts = t.split("|").map((s) => s.trim());
  const cells = parts.slice(1, -1);
  if (cells.length === 0) return false;
  return cells.every((c) => /^:?-{3,}:?$/.test(c));
}

function isPipeTableRow(line: string): boolean {
  if (isGfmTableDelimiter(line)) return false;
  const t = line.trim();
  if (t.length < 3 || !t.startsWith("|") || !t.endsWith("|")) return false;
  const parts = t.split("|");
  return parts.length >= 3;
}

function delimiterRowForColumnCount(n: number): string {
  if (n < 1) return "| --- |";
  return `|${Array.from({ length: n }, () => " --- ").join("|")}|`;
}

function columnCountFromPipeRow(line: string): number {
  const parts = line.trim().split("|");
  return Math.max(0, parts.length - 2);
}

/**
 * GFM 表にはヘッダ直後の |---| 行が必須。欠けている連続パイプ行ブロックの先頭に挿入する。
 * フェンスコード内は変更しない。
 */
export function ensureGfmTableDelimiters(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimStart = line.trimStart();
    if (trimStart.startsWith("```")) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }

    if (!isPipeTableRow(line)) {
      out.push(line);
      continue;
    }

    const prev = i > 0 ? lines[i - 1] : undefined;
    const prevIsTableLine =
      prev !== undefined && (isPipeTableRow(prev) || isGfmTableDelimiter(prev));
    if (prevIsTableLine) {
      out.push(line);
      continue;
    }

    out.push(line);
    const next = lines[i + 1];
    if (next === undefined || !isGfmTableDelimiter(next)) {
      const n = columnCountFromPipeRow(line);
      out.push(delimiterRowForColumnCount(n));
    }
  }

  return out.join("\n");
}
