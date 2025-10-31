"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

type CommentListProps = {
  postId: string;
  refreshTrigger?: number;
};

// 获取头像 fallback 字符
const getAvatarFallback = (name?: string | null, email?: string | null) => {
  if (name) return name.charAt(0).toUpperCase();
  if (email) return email.charAt(0).toUpperCase();
  return "U";
};

export function CommentList({ postId, refreshTrigger }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/posts/${postId}/comments`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "获取评论失败");
        }

        setComments(data.data || []);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        setError(error instanceof Error ? error.message : "获取评论失败");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-border/40 bg-slate-50 p-4"
          >
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-border/40 bg-slate-50 p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="mt-3 text-sm text-muted-foreground">暂无评论</p>
        <p className="mt-1 text-xs text-muted-foreground">来发表第一条评论吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="rounded-lg border border-border/40 bg-white p-4 transition-colors hover:bg-slate-50/50"
        >
          <div className="flex gap-3">
            {/* 头像 */}
            <div className="flex-shrink-0">
              {comment.user.image ? (
                <img
                  src={comment.user.image}
                  alt={comment.user.name || "用户"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                  {getAvatarFallback(comment.user.name, comment.user.email)}
                </div>
              )}
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {comment.user.name || comment.user.email || "匿名用户"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>

              {/* 点赞按钮（暂时显示数量） */}
              <div className="mt-3 flex items-center gap-4">
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1.5 text-xs text-muted-foreground",
                    "transition-colors hover:text-slate-700"
                  )}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span>{comment.likesCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
