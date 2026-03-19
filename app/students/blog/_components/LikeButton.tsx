"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";

const CLIENT_ID_KEY = "blog-like-client-id";

function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID?.() ?? `fallback-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function LikeButton({
  postId,
  initialCount = 0,
  initialLiked = false,
  onUpdate,
  className,
}: {
  postId: string;
  initialCount?: number;
  initialLiked?: boolean;
  onUpdate?: (postId: string, data: { count: number; liked: boolean }) => void;
  className?: string;
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    setCount(initialCount);
    setLiked(initialLiked);
  }, [initialCount, initialLiked]);

  useEffect(() => {
    const cid = getOrCreateClientId();
    setClientId(cid);

    if (!cid) return;
    fetch(`/api/blog/likes?postIds=${encodeURIComponent(postId)}&clientId=${encodeURIComponent(cid)}`)
      .then((res) => res.json())
      .then((data) => {
        const d = data[postId];
        if (d) {
          setCount(d.count);
          setLiked(d.liked);
          onUpdateRef.current?.(postId, d);
        }
      })
      .catch(() => {});
  }, [postId]);

  const toggleLike = useCallback(async () => {
    const cid = clientId ?? getOrCreateClientId();
    if (!cid || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/blog/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, clientId: cid }),
      });
      const data = await res.json();
      if (res.ok) {
        setCount(data.count);
        setLiked(data.liked);
        onUpdateRef.current?.(postId, { count: data.count, liked: data.liked });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [postId, clientId, loading]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleLike();
      }}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors disabled:opacity-60 ${
        liked
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-neutral-100 text-slate-600 hover:bg-neutral-200"
      } ${className ?? ""}`}
      aria-label={liked ? "いいねを解除" : "いいねする"}
    >
      <Heart
        className={`h-4 w-4 ${liked ? "fill-red-600" : ""}`}
        aria-hidden
      />
      <span>{count}</span>
    </button>
  );
}
