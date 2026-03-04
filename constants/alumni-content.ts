/**
 * 在校生セクションの本文データ（シングルソース・オブ・トゥルース）
 */

export type AlumniSectionId = "profile" | "blog";

export interface AlumniSection {
  id: AlumniSectionId;
  title: string;
  href: string;
  body: string;
}

export const ALUMNI_SECTIONS: AlumniSection[] = [
  {
    id: "profile",
    title: "在校生プロフィール",
    href: "/students/profiles",
    body: `在校生・卒業生とのコーヒーチャットを通じて、INSEADでのリアルな生活とキャリアを知ることができます。業界・バックグラウンド・キャンパス別に、日本人の在校生・卒業生を検索できます。

コーヒーチャットは完全無料で、受験戦略や家族帯同、キャリアチェンジなど、公には聞きづらいテーマもカジュアルに相談できる場を想定しています。

こちらでは、日本人の在校生・卒業生のプロフィール一覧を掲載しています。準備が整い次第、プロフィールとコーヒーチャット申込へのリンクを順次追加していきます。`,
  },
  {
    id: "blog",
    title: "在校生日記",
    href: "/students/blog",
    body: `在校生・卒業生による体験記やブログ記事をここに掲載予定です。出願ストーリー、キャンパスライフ、キャリアチェンジの実例など、より深い情報を発信していくことを想定しています。

実際にINSEADで学んだ方々の声を通じて、授業の様子、クラスメートとの交流、就職活動の体験、家族帯同のリアルなど、公式サイトやパンフレットでは伝わりにくい部分を知ることができます。

記事の投稿は随時追加していきます。`,
  },
];

export function getExcerpt(body: string, lines = 3): string {
  const trimmedLines = body
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, lines);
  return trimmedLines.join(" ").replace(/\s+/g, " ").trim();
}

export function getAlumniSection(
  id: AlumniSectionId
): AlumniSection | undefined {
  return ALUMNI_SECTIONS.find((s) => s.id === id);
}
