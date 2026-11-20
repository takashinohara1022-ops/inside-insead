import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchBlogPosts,
  fetchGalleryItems,
  fetchStudents,
  normalizeJoinKey,
} from "../../../lib/googleData";
import { PageHero } from "../../_components/PageHero";

export const revalidate = 0;

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function StudentDetailPage({ params }: Params) {
  const { id } = await params;
  const [students, blogPosts, galleryItems] = await Promise.all([
    fetchStudents(),
    fetchBlogPosts().catch(() => []),
    fetchGalleryItems().catch(() => []),
  ]);

  const student = students.find((item) => item.id === id);
  if (!student) notFound();

  const authorKey = normalizeJoinKey(student.uniqueDisplayName);
  const relatedBlogPosts = blogPosts.filter((post) => normalizeJoinKey(post.author) === authorKey);
  const relatedGalleryItems = galleryItems.filter(
    (item) => normalizeJoinKey(item.author) === authorKey,
  );

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero src={HERO_IMAGE_URL} alt={student.initials} title={student.initials} />
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-12 lg:py-20">
        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">プロフィール詳細</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">表示名キー</dt>
              <dd className="mt-1 text-sm text-slate-700">{student.uniqueDisplayName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">在学年度</dt>
              <dd className="mt-1 text-sm text-slate-700">{student.classLabel || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">卒業月</dt>
              <dd className="mt-1 text-sm text-slate-700">{student.graduationMonth || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">キャンパス</dt>
              <dd className="mt-1 text-sm text-slate-700">{student.campus || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">社会人歴</dt>
              <dd className="mt-1 text-sm text-slate-700">{student.yearsAtEntry || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">業界</dt>
              <dd className="mt-1 text-sm text-slate-700">{student.industry || "-"}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">ブログ投稿・ギャラリー</h2>

          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">ブログ投稿</h3>
              {relatedBlogPosts.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {relatedBlogPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/students/blog?post=${encodeURIComponent(post.id)}`}
                        className="text-sm text-[#005543] underline-offset-2 hover:underline"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">該当するブログ投稿はありません。</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-800">ギャラリー投稿</h3>
              {relatedGalleryItems.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {relatedGalleryItems.map((item) => (
                    <li key={item.id}>
                      <Link href="/gallery" className="text-sm text-[#005543] underline-offset-2 hover:underline">
                        {item.postedAt || "-"} {item.comment ? `- ${item.comment}` : ""}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">該当するギャラリー投稿はありません。</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
