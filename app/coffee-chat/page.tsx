import { Suspense } from "react";
import { CoffeeChatFormClient } from "./CoffeeChatFormClient";
import { getProfileSheetRows, type SheetRow } from "../../lib/googleData";

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeForMatch(value: string): string {
  return normalizeText(value).replace(/\s+/g, "").toLowerCase();
}

function getByHeaderMatch(row: SheetRow, keywords: string[]): string {
  const entries = Object.entries(row);
  for (const [header, rawValue] of entries) {
    const normalizedHeader = normalizeForMatch(header);
    if (keywords.some((keyword) => normalizedHeader.includes(normalizeForMatch(keyword)))) {
      return normalizeText(rawValue ?? "");
    }
  }
  return "";
}

function parseClassLabel(yearRaw: string, monthRaw: string): string {
  const year = normalizeText(yearRaw);
  const month = normalizeForMatch(monthRaw);
  const yearNum = year.match(/\d{2,4}/)?.[0];
  if (!yearNum) return "-";
  const fourDigitYear = yearNum.length === 2 ? `20${yearNum}` : yearNum;
  const yy = fourDigitYear.slice(-2);
  if (month.includes("july") || month === "j" || month.includes("7")) return `${yy}J`;
  if (month.includes("dec") || month === "d" || month.includes("12")) return `${yy}D`;
  return yy;
}

function getCoffeeChatWindow(classLabel: string): { start: Date; end: Date } | null {
  const match = normalizeText(classLabel).toUpperCase().match(/^(\d{2})([JD])$/);
  if (!match) return null;
  const graduationYear = 2000 + Number(match[1]);
  const intake = match[2] as "J" | "D";
  if (Number.isNaN(graduationYear)) return null;
  if (intake === "D") {
    return {
      start: new Date(graduationYear, 0, 1, 0, 0, 0, 0),
      end: new Date(graduationYear, 10, 30, 23, 59, 59, 999),
    };
  }
  const admissionYear = graduationYear - 1;
  return {
    start: new Date(admissionYear, 8, 1, 0, 0, 0, 0),
    end: new Date(admissionYear + 1, 5, 30, 23, 59, 59, 999),
  };
}

function isCoffeeChatAvailableNow(classLabel: string, now: Date): boolean {
  const window = getCoffeeChatWindow(classLabel);
  if (!window) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  return today >= window.start && today <= window.end;
}

function formatYearsAtEntry(value: string): string {
  const normalized = normalizeText(value);
  if (!normalized) return "-";
  if (normalized.includes("年目")) return normalized;
  const numeric = normalized.match(/\d+(\.\d+)?/)?.[0];
  return numeric ? `社会人${numeric}年目` : normalized;
}

function getByColumnIndex(row: SheetRow, oneBasedIndex: number): string {
  const values = Object.values(row);
  return normalizeText(values[oneBasedIndex - 1] ?? "");
}

function toCoffeeChatLabel(row: SheetRow): string {
  // V列（22列目）の表示名を使用。未設定の場合はイニシャルにフォールバック
  const colV = getByColumnIndex(row, 22);
  if (colV) return colV;
  const initials = getByHeaderMatch(row, ["氏名イニシャル", "initial"]) || "N/A";
  const classLabel = parseClassLabel(
    getByHeaderMatch(row, ["INSEAD卒業年度", "INSEAD卒業年", "gradyear"]),
    getByHeaderMatch(row, ["INSEAD卒業月", "gradmonth"]),
  );
  return `${initials} / ${classLabel}`;
}

async function getCoffeeChatStudents(): Promise<string[]> {
  try {
    const rows = await getProfileSheetRows();
    const now = new Date();
    const activeOnly = rows.filter((row) => {
      const classLabel = parseClassLabel(
        getByHeaderMatch(row, ["INSEAD卒業年度", "INSEAD卒業年", "gradyear"]),
        getByHeaderMatch(row, ["INSEAD卒業月", "gradmonth"]),
      );
      return isCoffeeChatAvailableNow(classLabel, now);
    });
    return Array.from(new Set(activeOnly.map(toCoffeeChatLabel).filter(Boolean)));
  } catch {
    return [];
  }
}

export default async function CoffeeChatPage() {
  const students = await getCoffeeChatStudents();
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50" />}>
      <CoffeeChatFormClient students={students} />
    </Suspense>
  );
}

