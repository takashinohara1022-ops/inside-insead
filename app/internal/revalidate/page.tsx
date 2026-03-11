import { RevalidateAdminPanel } from "./_components/RevalidateAdminPanel";

export const metadata = {
  title: "内部運用: キャッシュ更新",
};

export default function InternalRevalidatePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8 lg:px-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          内部運用ページ: キャッシュ更新
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          このページは運用者向けです。通常は ISR（1時間）で自動更新されますが、即時反映したい場合に利用してください。
        </p>

        <div className="mt-6">
          <RevalidateAdminPanel />
        </div>
      </div>
    </div>
  );
}
