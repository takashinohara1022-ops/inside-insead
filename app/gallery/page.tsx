import { PageHero } from "../_components/PageHero";
import Pagination from "../../components/Pagination";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop";

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="キャンパス・学生生活のイメージ"
        title="ギャラリー"
      />
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:px-12 lg:py-20">
        <p className="leading-relaxed text-slate-600 sm:text-[15px]">
          キャンパスや学生生活の写真を掲載予定です。
        </p>
        <Pagination />
      </div>
    </div>
  );
}
