/**
 * サイトマップに基づく遷移順序の単一ソース。
 * 2段ナビ（セクション内ナビ・カテゴリーナビ）の前後導出に使用する。
 */

export interface NavLink {
  path: string;
  label: string;
}

export interface CategoryDef {
  id: string;
  path: string;
  label: string;
  /** 子ページ（path, label）。ない場合は単一ページカテゴリー */
  children?: NavLink[];
}

/** 親カテゴリー順: Home -> 概要 -> 学校生活 -> 在校生 -> ギャラリー -> コーヒーチャット申込 */
export const CATEGORY_ORDER: CategoryDef[] = [
  { id: "home", path: "/", label: "HOME" },
  {
    id: "about",
    path: "/about",
    label: "概要",
    children: [
      { path: "/about/history", label: "歴史" },
      { path: "/about/culture", label: "カルチャー" },
      { path: "/about/programs", label: "プログラム概要" },
      { path: "/about/campuses", label: "キャンパス紹介" },
      { path: "/about/exchange", label: "交換留学" },
    ],
  },
  {
    id: "student-life",
    path: "/student-life",
    label: "学校生活",
    children: [
      { path: "/student-life/yearly-schedule", label: "年間活動" },
      { path: "/student-life/academic-terms", label: "学期・単位" },
      { path: "/student-life/academic-classes", label: "授業" },
      { path: "/student-life/academic-faculty", label: "教授陣" },
      { path: "/student-life/career", label: "キャリア" },
      { path: "/student-life/social-clubs", label: "クラブ活動" },
      { path: "/student-life/social-events", label: "旅行・イベント" },
    ],
  },
  {
    id: "alumni",
    path: "/alumni",
    label: "在校生",
    children: [
      { path: "/alumni/profile", label: "在校生プロフィール" },
      { path: "/alumni/blog", label: "在校生ブログ" },
    ],
  },
  { id: "gallery", path: "/gallery", label: "ギャラリー" },
  { id: "coffee-chat", path: "/coffee-chat", label: "コーヒーチャット申込" },
];

export interface NavigationContext {
  /** セクション内：前のページ（最初のページでは null） */
  sectionPrev: NavLink | null;
  /** セクション内：次のページ（最後のページでは null） */
  sectionNext: NavLink | null;
  /** 親（一覧）の path */
  parentPath: string;
  /** 親の表示名（「〇〇の一覧へ」に使用） */
  parentLabel: string;
  /** 前のカテゴリー（概要のときは HOME 用の特別表示）。最初のカテゴリーでは null */
  categoryPrev: NavLink | null;
  /** 次のカテゴリー。最後のカテゴリーでは null */
  categoryNext: NavLink | null;
  /** 現在がこのカテゴリーのインデックスページか（子を持ち、自身が path のみで一致） */
  isIndexPage: boolean;
}

function normalizePath(p: string): string {
  return p.replace(/\/$/, "") || "/";
}

/**
 * 現在の pathname から、2段ナビ用の前後情報を導出する。
 */
export function getNavigationContext(pathname: string): NavigationContext | null {
  const path = normalizePath(pathname);

  const defaultContext: NavigationContext = {
    sectionPrev: null,
    sectionNext: null,
    parentPath: "/",
    parentLabel: "HOME",
    categoryPrev: null,
    categoryNext: null,
    isIndexPage: false,
  };

  let categoryIndex = -1;
  let childIndex = -1;
  let category: CategoryDef | undefined;

  for (let i = 0; i < CATEGORY_ORDER.length; i++) {
    const c = CATEGORY_ORDER[i];
    if (c.path === path) {
      categoryIndex = i;
      category = c;
      childIndex = -1; // index page
      break;
    }
    if (c.children) {
      const idx = c.children.findIndex((ch) => normalizePath(ch.path) === path);
      if (idx >= 0) {
        categoryIndex = i;
        childIndex = idx;
        category = c;
        break;
      }
    }
  }

  if (categoryIndex < 0 || !category) return null;

  const children = category.children ?? [];
  const isIndexPage = childIndex < 0 && children.length > 0;

  // セクション内の前後
  let sectionPrev: NavLink | null = null;
  let sectionNext: NavLink | null = null;
  if (childIndex >= 0) {
    if (childIndex > 0) sectionPrev = children[childIndex - 1];
    if (childIndex < children.length - 1) sectionNext = children[childIndex + 1];
  }

  // 親（一覧）は常にカテゴリーの path
  const parentPath = category.path;
  const parentLabel = category.label;

  // カテゴリー間の前後（概要の前は HOME を特別表示）
  let categoryPrev: NavLink | null = null;
  let categoryNext: NavLink | null = null;
  if (categoryIndex > 0) {
    const prevCat = CATEGORY_ORDER[categoryIndex - 1];
    categoryPrev = { path: prevCat.path, label: prevCat.label };
  }
  if (categoryIndex < CATEGORY_ORDER.length - 1) {
    const nextCat = CATEGORY_ORDER[categoryIndex + 1];
    categoryNext = { path: nextCat.path, label: nextCat.label };
  }

  return {
    sectionPrev,
    sectionNext,
    parentPath,
    parentLabel,
    categoryPrev,
    categoryNext,
    isIndexPage,
  };
}
