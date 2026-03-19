"use client";

import { useState } from "react";

type RunResult = {
  ok: boolean;
  status: number;
  body: string;
};

async function callRevalidateApi(path: string, token: string): Promise<RunResult> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return {
    ok: response.ok,
    status: response.status,
    body: await response.text(),
  };
}

export function RevalidateAdminPanel() {
  const [token, setToken] = useState("");
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  const run = async () => {
    if (!token.trim()) {
      setMessage("トークンを入力してください。");
      return;
    }
    setRunning(true);
    setMessage("更新処理を実行中です...");

    try {
      const result = await callRevalidateApi("/api/content/revalidate", token.trim());
      setMessage(
        result.ok
          ? `全サイトコンテンツ更新成功: ${result.body}`
          : `更新失敗 (${result.status}): ${result.body}`,
      );
    } catch (error) {
      setMessage(
        `更新に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm text-slate-600">
        管理者トークン（Bearer）を入力して、全サイトコンテンツ（About、Student Life、History、Culture など）のキャッシュ更新を実行します。
      </p>

      <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="revalidate-token">
        管理者トークン
      </label>
      <input
        id="revalidate-token"
        type="password"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-[#005543] focus:outline-none focus:ring-2 focus:ring-[#005543]/20"
        placeholder="Bearer トークンを入力"
      />

      <div className="mt-4">
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="rounded-md bg-[#005543] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004435] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {running ? "更新中..." : "全サイトコンテンツを更新"}
        </button>
      </div>

      {message ? (
        <p className="mt-4 whitespace-pre-wrap rounded-md bg-neutral-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
