"use client";

import { useState } from "react";
import { PageHero } from "../_components/PageHero";
import Pagination from "../../components/Pagination";
import { sendCoffeeChatEmail } from "./actions";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop";

const PEOPLE_OPTIONS = [
  "指定なし",
  "T.N / Venture Consulting / Singapore",
  "A.S / Finance / Fontainebleau",
  "M.K / Technology / Singapore",
  "R.Y / Healthcare / Fontainebleau",
  "K.H / Consumer / Singapore",
];

export default function CoffeeChatPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setIsSuccess(false);

    try {
      const formData = new FormData(event.currentTarget);
      const payload = {
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        topic: String(formData.get("topic") ?? "").trim(),
        person1: String(formData.get("person1") ?? "").trim(),
        person2: String(formData.get("person2") ?? "").trim(),
      };

      await sendCoffeeChatEmail(payload);
      setIsSuccess(true);
      event.currentTarget.reset();
    } catch {
      setErrorMessage("送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <PageHero
        src={HERO_IMAGE_URL}
        alt="カフェでの会話を想起させる写真"
        title="Coffee Chat"
      />

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
        <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            在校生とカジュアルにお話しませんか？
          </h2>
          <p className="mt-3 leading-relaxed text-slate-600">
            出願準備、キャンパス生活、授業、キャリアなど、気になることを気軽にご相談ください。以下のフォームよりお申し込みいただけます。
          </p>
        </section>

        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              お名前 <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-[#005543]/25 transition focus:border-[#005543] focus:ring-2"
              placeholder="例: 山田 太郎"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              メールアドレス <span className="text-rose-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-[#005543]/25 transition focus:border-[#005543] focus:ring-2"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="topic" className="mb-2 block text-sm font-medium text-slate-700">
              話したいこと <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="topic"
              name="topic"
              required
              rows={5}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-[#005543]/25 transition focus:border-[#005543] focus:ring-2"
              placeholder="相談したい内容をご記入ください"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="person1" className="mb-2 block text-sm font-medium text-slate-700">
                話したい人（第1希望）
              </label>
              <select
                id="person1"
                name="person1"
                defaultValue="指定なし"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-[#005543]/25 transition focus:border-[#005543] focus:ring-2"
              >
                {PEOPLE_OPTIONS.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="person2" className="mb-2 block text-sm font-medium text-slate-700">
                話したい人（第2希望）
              </label>
              <select
                id="person2"
                name="person2"
                defaultValue="指定なし"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-[#005543]/25 transition focus:border-[#005543] focus:ring-2"
              >
                {PEOPLE_OPTIONS.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-w-[12rem] items-center justify-center rounded-full bg-[#005543] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#006b55] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "送信中..." : "申し込む"}
            </button>
          </div>

          {isSuccess && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              お申し込みを受け付けました。
            </p>
          )}
          {errorMessage && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          )}
        </form>

        <div className="mt-10">
          <Pagination />
        </div>
      </div>
    </div>
  );
}

