/**
 * Google Docs から取得した HTML を prose スタイルで表示するコンポーネント
 */
export function DocContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-[#005543] prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-li:text-slate-700"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
