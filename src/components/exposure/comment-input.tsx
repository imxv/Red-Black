"use client";

import { useState, type FormEvent } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type CommentInputProps = {
  postId: string;
  onCommentAdded?: () => void;
};

export function CommentInput({ postId, onCommentAdded }: CommentInputProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      alert("请先登录后再发表评论");
      router.push("/auth/signin");
      return;
    }

    if (!content.trim()) {
      alert("评论内容不能为空");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "评论失败");
      }

      // 清空输入框
      setContent("");

      // 通知父组件刷新评论列表
      onCommentAdded?.();
    } catch (error) {
      console.error("Failed to submit comment:", error);
      alert(error instanceof Error ? error.message : "评论失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="rounded-lg border border-border/40 bg-slate-50 p-4">
        <p className="text-sm text-muted-foreground">
          请
          <button
            type="button"
            onClick={() => router.push("/auth/signin")}
            className="mx-1 text-slate-900 underline hover:text-slate-700"
          >
            登录
          </button>
          后发表评论
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="发表你的看法..."
        rows={3}
        maxLength={1000}
        className={cn(
          "w-full rounded-lg border border-border/40 bg-white px-4 py-3 text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "focus:border-slate-400/50 focus:outline-none focus:ring-2 focus:ring-slate-400/20",
          "transition-colors resize-none"
        )}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length} / 1000
        </span>
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className={cn(
            "rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white",
            "transition-colors hover:bg-slate-800",
            "focus:outline-none focus:ring-2 focus:ring-slate-900/20",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {isSubmitting ? "发送中..." : "发表评论"}
        </button>
      </div>
    </form>
  );
}
