import { redirect } from "next/navigation";

/**
 * 概要ページは /about に統一しました。旧リンク用のリダイレクトです。
 */
export default function OverviewPage() {
  redirect("/about");
}
