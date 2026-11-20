import { Suspense } from "react";
import Pagination from "../../../components/Pagination";
import { AdmissionReportsBoard } from "./_components/AdmissionReportsBoard";
import {
  getAdmissionReportSheetRows,
  getProfileSheetRows,
} from "../../../lib/googleData";

export const revalidate = 300; // 5分キャッシュ（毎回のサーバー処理を防ぐ）

export default async function StudentsAdmissionPage() {
  const [reportRows, profileRows] = await Promise.all([
    getAdmissionReportSheetRows(),
    getProfileSheetRows(),
  ]);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-12 pb-14 sm:px-8 lg:px-12 lg:py-20">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            合格体験記
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            実際にINSEADに合格した在校生の受験体験を、エッセイ・面接・スコア対策など項目別にまとめています。
          </p>
        </header>
        <Suspense fallback={null}>
          <AdmissionReportsBoard
            reportRows={reportRows}
            profileRows={profileRows}
          />
        </Suspense>
        <Pagination />
      </div>
    </div>
  );
}
