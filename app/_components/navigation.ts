export type NavNode = {
  label: string;
  href: string;
  children?: NavNode[];
};

/**
 * Single source of truth for sitemap / navigation.
 * - Header dropdowns
 * - Footer sitemap
 */
export const NAV_TREE: NavNode[] = [
  { label: "Home", href: "/" },
  {
    label: "概要",
    href: "/about",
    children: [
      { label: "INSEADの歴史", href: "/about/history" },
      { label: "INSEADのスクールカルチャー", href: "/about/culture" },
      { label: "INSEADプログラムの概要", href: "/about/programs" },
      { label: "キャンパスと街の紹介", href: "/about/campuses" },
      { label: "交換制度(Wharton, Kellogg)", href: "/about/exchange" },
    ],
  },
  {
    label: "学校生活",
    href: "/student-life",
    children: [
      { label: "年間活動イメージ", href: "/student-life/yearly-schedule" },
      { label: "学期・単位制度の仕組み", href: "/student-life/academic-terms" },
      { label: "代表的な授業", href: "/student-life/academic-classes" },
      { label: "教授陣", href: "/student-life/academic-faculty" },
      { label: "キャリア活動（就職実績）", href: "/student-life/career" },
      { label: "クラブ活動", href: "/student-life/social-clubs" },
      { label: "旅行・イベント等", href: "/student-life/social-events" },
    ],
  },
  {
    label: "在校生",
    href: "/alumni",
    children: [
      { label: "在校生プロフィール", href: "/alumni/profile" },
      { label: "在校生ブログ", href: "/alumni/blog" },
    ],
  },
  { label: "ギャラリー", href: "/gallery" },
  { label: "コーヒーチャット申込", href: "/coffee-chat" },
];
