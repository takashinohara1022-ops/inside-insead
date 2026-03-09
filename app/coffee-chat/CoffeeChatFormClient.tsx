"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { sendCoffeeChatEmail } from "./actions";

const DEFAULT_OPTION = "指定なし";

export function CoffeeChatFormClient({ students }: { students: string[] }) {
  const searchParams = useSearchParams();
  const targetParam = searchParams.get("target")?.trim() ?? "";
  const initialPerson1 = targetParam || DEFAULT_OPTION;
  const person1Options = useMemo(() => {
    if (!targetParam || students.includes(targetParam)) return students;
    return [targetParam, ...students];
  }, [targetParam, students]);

  const [selectedPerson1, setSelectedPerson1] = useState(initialPerson1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setSelectedPerson1(initialPerson1);
  }, [initialPerson1]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    const response = await sendCoffeeChatEmail({
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      topic: String(formData.get("topic") ?? "").trim(),
      person1: String(formData.get("person1") ?? DEFAULT_OPTION).trim(),
      person2: String(formData.get("person2") ?? DEFAULT_OPTION).trim(),
    });

    setIsSubmitting(false);
    if (response.success) {
      setSuccessMessage("お申し込みを受け付けました。在校生からの連絡をお待ちください");
    } else {
      setErrorMessage(response.message ?? "送信に失敗しました。時間をおいて再度お試しください。");
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <section className="border-b border-emerald-100 bg-gradient-to-b from-emerald-50 to-stone-50">
        <div className="mx-auto max-w-4xl px-6 py-14 sm:py-16 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
            Casual Interview
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Coffee Chat</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            フォーム送信後、在校生よりメールでご連絡いたします。メールにて、詳細をご案内いたします。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-1">
                <span className="text-sm font-medium text-slate-700">お名前 *</span>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="例: 山田 太郎"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-200"
                />
              </label>

              <label className="space-y-2 sm:col-span-1">
                <span className="text-sm font-medium text-slate-700">メールアドレス *</span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="example@email.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-200"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">話したい内容 *</span>
              <textarea
                name="topic"
                required
                rows={5}
                placeholder="ご相談したい内容を入力してください"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-200"
              />
            </label>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">話したい在校生 第1希望</span>
                <select
                  name="person1"
                  value={selectedPerson1}
                  onChange={(event) => setSelectedPerson1(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-200"
                >
                  <option value={DEFAULT_OPTION}>{DEFAULT_OPTION}</option>
                  {person1Options.map((student) => (
                    <option key={student} value={student}>
                      {student}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">話したい在校生 第2希望</span>
                <select
                  name="person2"
                  defaultValue={DEFAULT_OPTION}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-200"
                >
                  <option value={DEFAULT_OPTION}>{DEFAULT_OPTION}</option>
                  {students.map((student) => (
                    <option key={student} value={student}>
                      {student}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-[#005543] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004535] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "送信中..." : "申し込む"}
              </button>
              <p className="text-xs text-slate-500">* は必須項目です</p>
            </div>

            {successMessage ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {successMessage}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </div>
  );
}
