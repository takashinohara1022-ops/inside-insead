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
  /** 直前ページ（サイト内順序） */
  pagePrev: NavLink | null;
  /** 直後ページ（サイト内順序） */
  pageNext: NavLink | null;
  /** 親（カテゴリートップ）の path */
  parentPath: string;
  /** 親カテゴリの表示名 */
  parentLabel: string;
  /** 前のカテゴリー。最初のカテゴリーでは null */
  categoryPrev: NavLink | null;
  /** 次のカテゴリー。最後のカテゴリーでは null */
  categoryNext: NavLink | null;
  /** 現在ページの表示名 */
  currentLabel: string;
  /** 現在がカテゴリートップページか */
  isCategoryTop: boolean;
  /** 子ページ内で1枚目か */
  isFirstChild: boolean;
  /** 子ページ内で最終か */
  isLastChild: boolean;
  /** 最終カテゴリーか */
  isLastCategory: boolean;
}

function normalizePath(p: string): string {
  return p.replace(/\/$/, "") || "/";
}

/**
 * 現在の pathname から、2段ナビ用の前後情報を導出する。
 */
export function getNavigationContext(pathname: string): NavigationContext | null {
  const path = normalizePath(pathname);

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
  const isCategoryTop = childIndex < 0;
  const isFirstChild = childIndex === 0;
  const isLastChild = childIndex >= 0 && childIndex === children.length - 1;

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

  const isLastCategory = categoryIndex === CATEGORY_ORDER.length - 1;

  // サイト内ページ順（カテゴリートップ -> 子ページ群）をフラット化
  const pageFlow: Array<{
    path: string;
    label: string;
    categoryIndex: number;
    childIndex: number;
  }> = [];
  CATEGORY_ORDER.forEach((cat, catIndex) => {
    pageFlow.push({
      path: normalizePath(cat.path),
      label: cat.label,
      categoryIndex: catIndex,
      childIndex: -1,
    });
    (cat.children ?? []).forEach((child, idx) => {
      pageFlow.push({
        path: normalizePath(child.path),
        label: child.label,
        categoryIndex: catIndex,
        childIndex: idx,
      });
    });
  });

  const flowIndex = pageFlow.findIndex((p) => p.path === path);
  const prevFlow = flowIndex > 0 ? pageFlow[flowIndex - 1] : null;
  const nextFlow =
    flowIndex >= 0 && flowIndex < pageFlow.length - 1
      ? pageFlow[flowIndex + 1]
      : null;

  const pagePrev = prevFlow
    ? { path: prevFlow.path, label: prevFlow.label }
    : null;
  const pageNext = nextFlow
    ? { path: nextFlow.path, label: nextFlow.label }
    : null;

  return {
    pagePrev,
    pageNext,
    parentPath,
    parentLabel,
    categoryPrev,
    categoryNext,
    currentLabel: isCategoryTop ? category.label : children[childIndex]?.label ?? category.label,
    isCategoryTop,
    isFirstChild,
    isLastChild,
    isLastCategory,
  };
}
