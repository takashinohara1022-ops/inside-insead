export type NavItem = {
  path: string;
  title: string;
  description: string;
};

export type NavCategory = {
  id: string;
  path: string;
  label: string;
  pages: NavItem[];
};

/**
 * サイト全体のナビゲーション設定（表記揺れを防ぐ単一ソース）
 */
export const NAVIGATION_CONFIG: NavCategory[] = [
  {
    id: "home",
    path: "/",
    label: "ホームページ",
    pages: [],
  },
  {
    id: "insead",
    path: "/about",
    label: "INSEAD",
    pages: [
      {
        path: "/about/history",
        title: "歴史",
        description:
          "INSEAD創設の背景から現在までの歩みをたどり、学校の理念と国際性がどのように形づくられてきたかを紹介します。",
      },
      {
        path: "/about/culture",
        title: "スクールカルチャー",
        description:
          "多様な国籍・業界の学生が交差する環境で、議論と協働を通じて学ぶINSEADらしいカルチャーを解説します。",
      },
      {
        path: "/about/programs",
        title: "プログラム",
        description:
          "MBAを中心に、学期構成や学び方、選択科目の広がりなど、INSEADのプログラム設計の特徴をまとめています。",
      },
      {
        path: "/about/campuses",
        title: "キャンパス",
        description:
          "フォンテンブロー、シンガポールなど複数拠点で学ぶ魅力と、それぞれの街・生活環境の違いを紹介します。",
      },
      {
        path: "/about/exchange",
        title: "交換留学制度",
        description:
          "WhartonやKelloggを含む提携校との交換留学制度について、意義・進め方・得られる経験を整理しています。",
      },
    ],
  },
  {
    id: "student-life",
    path: "/student-life",
    label: "学校生活",
    pages: [
      {
        path: "/student-life/yearly-schedule",
        title: "年間活動イメージ",
        description:
          "入学から卒業までの1年を、授業・イベント・キャリア活動の流れに沿って時系列で分かりやすく紹介します。",
      },
      {
        path: "/student-life/academic-terms",
        title: "学期・単位制度",
        description:
          "5学期で構成される集中カリキュラムと単位取得の考え方を、初めての方にも理解しやすくまとめています。",
      },
      {
        path: "/student-life/academic-classes",
        title: "授業",
        description:
          "ケースメソッド中心の授業スタイルと、戦略・財務・リーダーシップなど代表的な科目群を紹介します。",
      },
      {
        path: "/student-life/academic-faculty",
        title: "教授",
        description:
          "研究と実務を行き来する教授陣の特徴や、学びを深める授業外コミュニケーションの魅力を解説します。",
      },
      {
        path: "/student-life/career",
        title: "キャリア",
        description:
          "就職実績の傾向やキャリアサポート体制、入学後にどのように進路を設計していくかを紹介します。",
      },
      {
        path: "/student-life/social-clubs",
        title: "クラブ活動",
        description:
          "業界別・地域別クラブの活動内容や、イベント運営・ネットワーキングを通じた成長機会をまとめています。",
      },
      {
        path: "/student-life/social-events",
        title: "ソーシャルライフ",
        description:
          "旅行・パーティー・スポーツなど、学外の交流を通じて得られるコミュニティ体験を紹介します。",
      },
    ],
  },
  {
    id: "students",
    path: "/students",
    label: "在校生",
    pages: [
      {
        path: "/students/profiles",
        title: "在校生プロフィール一覧",
        description:
          "在校生・卒業生のバックグラウンドや関心領域を一覧で確認でき、相談相手を探しやすい構成です。",
      },
      {
        path: "/students/blog",
        title: "在校生ブログ",
        description:
          "出願、授業、生活、キャリアなど、在校生の一次情報を体験ベースで発信する記事を掲載しています。",
      },
    ],
  },
  {
    id: "gallery",
    path: "/gallery",
    label: "ギャラリー",
    pages: [],
  },
  {
    id: "coffee-chat",
    path: "/coffee-chat",
    label: "コーヒーチャット申込",
    pages: [],
  },
];

function normalizePath(path: string): string {
  return path.replace(/\/$/, "") || "/";
}

type FlowNode = {
  path: string;
  title: string;
  categoryIndex: number;
  isTop: boolean;
  pageIndex: number; // 子ページのインデックス。トップは -1
};

export type PaginationContext = {
  currentPath: string;
  currentTitle: string;
  categoryIndex: number;
  category: NavCategory;
  isCategoryTop: boolean;
  isFirstChild: boolean;
  isLastChild: boolean;
  isLastCategory: boolean;
  prevPage: NavItem | null;
  nextPage: NavItem | null;
  prevCategoryTop: NavItem | null;
  nextCategoryTop: NavItem | null;
};

export function getPaginationContext(pathname: string): PaginationContext | null {
  const currentPath = normalizePath(pathname);

  const flow: FlowNode[] = [];
  NAVIGATION_CONFIG.forEach((category, categoryIndex) => {
    flow.push({
      path: normalizePath(category.path),
      title: category.label,
      categoryIndex,
      isTop: true,
      pageIndex: -1,
    });
    category.pages.forEach((page, pageIndex) => {
      flow.push({
        path: normalizePath(page.path),
        title: page.title,
        categoryIndex,
        isTop: false,
        pageIndex,
      });
    });
  });

  const currentFlowIndex = flow.findIndex((node) => node.path === currentPath);
  if (currentFlowIndex < 0) return null;

  const currentNode = flow[currentFlowIndex];
  const category = NAVIGATION_CONFIG[currentNode.categoryIndex];
  const isCategoryTop = currentNode.isTop;
  const isFirstChild = !isCategoryTop && currentNode.pageIndex === 0;
  const isLastChild =
    !isCategoryTop && currentNode.pageIndex === category.pages.length - 1;
  const isLastCategory = currentNode.categoryIndex === NAVIGATION_CONFIG.length - 1;

  const prevFlow = currentFlowIndex > 0 ? flow[currentFlowIndex - 1] : null;
  const nextFlow =
    currentFlowIndex < flow.length - 1 ? flow[currentFlowIndex + 1] : null;

  const prevCategory =
    currentNode.categoryIndex > 0
      ? NAVIGATION_CONFIG[currentNode.categoryIndex - 1]
      : null;
  const nextCategory =
    currentNode.categoryIndex < NAVIGATION_CONFIG.length - 1
      ? NAVIGATION_CONFIG[currentNode.categoryIndex + 1]
      : null;

  return {
    currentPath,
    currentTitle: currentNode.title,
    categoryIndex: currentNode.categoryIndex,
    category,
    isCategoryTop,
    isFirstChild,
    isLastChild,
    isLastCategory,
    prevPage: prevFlow
      ? {
          path: prevFlow.path,
          title: prevFlow.title,
          description: "",
        }
      : null,
    nextPage: nextFlow
      ? {
          path: nextFlow.path,
          title: nextFlow.title,
          description: "",
        }
      : null,
    prevCategoryTop: prevCategory
      ? { path: prevCategory.path, title: prevCategory.label, description: "" }
      : null,
    nextCategoryTop: nextCategory
      ? { path: nextCategory.path, title: nextCategory.label, description: "" }
      : null,
  };
}

export function getCategoryByPath(path: string): NavCategory | undefined {
  const normalized = normalizePath(path);
  return NAVIGATION_CONFIG.find((category) => normalizePath(category.path) === normalized);
}
