"use client";

import {
  type FormEvent,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type SVGProps,
} from "react";
import { animate } from "animejs";
import Link from "next/link";
import Image from "next/image";

import { RatingDisplay } from "@/components/merchant/rating-display";
import { StarRatingInput } from "@/components/merchant/star-rating-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Merchant } from "@/data/merchants";
import { mainServiceIcons } from "@/data/main-services";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

function BackIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

function LikeIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 10.4v8.2" />
      <path d="M8.5 18.6h7.22a2 2 0 001.93-1.46l1.12-4.08A1.5 1.5 0 0017.33 11h-3.98l.56-2.84a1.8 1.8 0 00-3.48-1.02l-1.93 3.26a2.9 2.9 0 01-.53.67l-.47.44" />
      <path d="M6 10.4H4.3A2.3 2.3 0 002 12.7v3.18A2.3 2.3 0 004.3 18.2H6" />
    </svg>
  );
}

function DislikeIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 13.6V5.4" />
      <path d="M15.5 5.4H8.28a2 2 0 00-1.93 1.46l-1.12 4.08A1.5 1.5 0 006.67 13h3.98l-.56 2.84a1.8 1.8 0 003.48 1.02l1.93-3.26c.15-.25.33-.47.53-.67l.47-.44" />
      <path d="M18 13.6h1.7A2.3 2.3 0 0022 11.3V8.12A2.3 2.3 0 0019.7 5.8H18" />
    </svg>
  );
}

function ReviewIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 6.75A2.75 2.75 0 016.75 4h10.5A2.75 2.75 0 0120 6.75V13a2.75 2.75 0 01-2.75 2.75H12l-4 3.25V15.75H6.75A2.75 2.75 0 014 13V6.75z" />
      <path d="M8.5 8.75h7" />
      <path d="M8.5 12h4.5" />
    </svg>
  );
}

type Rating = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export function MerchantDetailClient({
  merchant,
  ratings = [],
}: {
  merchant: Merchant;
  ratings?: Rating[];
}) {
  const [likes, setLikes] = useState(merchant.likes);
  const [dislikes, setDislikes] = useState(merchant.dislikes);
  const [userRating, setUserRating] = useState<number>(0);
  const [isCommentFormOpen, setIsCommentFormOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reviewSectionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("zh-CN", {
        dateStyle: "medium",
      }),
    [],
  );
  const reviewCountLabel = merchant.reviews.toLocaleString();

  const handleReaction = (field: "likes" | "dislikes") =>
    (event: MouseEvent<HTMLButtonElement>) => {
      if (field === "likes") {
        setLikes((previous) => previous + 1);
      } else {
        setDislikes((previous) => previous + 1);
      }

      animate(event.currentTarget, {
        scale: [1, 1.12, 1],
        duration: 280,
        easing: "easeOutBack",
      });

      const iconElement = event.currentTarget.querySelector("svg");

      if (iconElement) {
        animate(iconElement, {
          rotate: field === "likes" ? [0, -12, 0] : [0, 12, 0],
          duration: 320,
          easing: "easeOutQuad",
        });
      }
    };

  const handleScrollToReviews = () => {
    reviewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOpenCommentForm = () => {
    setIsCommentFormOpen(true);
  };

  const handleCloseCommentForm = () => {
    setIsCommentFormOpen(false);
    setCommentContent("");
  };

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 检查用户是否登录
    if (!session?.user) {
      showToast("请先登录后再评论", "error");
      router.push("/auth/signin");
      return;
    }

    // 检查评分
    if (userRating === 0) {
      showToast("请先为商家打分", "error");
      return;
    }

    // 检查评论内容
    const trimmedComment = commentContent.trim();
    if (trimmedComment.length === 0) {
      showToast("请输入评论内容", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/merchants/${merchant.slug}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: userRating,
          comment: trimmedComment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "提交失败");
      }

      showToast(data.message || "评价提交成功！", "success");
      handleCloseCommentForm();
      setUserRating(0);

      // 刷新页面以显示新评论
      router.refresh();
    } catch (error) {
      console.error("提交评论失败:", error);
      showToast(
        error instanceof Error ? error.message : "提交失败，请稍后重试",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const likeCountLabel = likes.toLocaleString();
  const dislikeCountLabel = dislikes.toLocaleString();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.03),_transparent_55%)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(at_top_left,_rgba(255,255,255,0.02),_transparent_55%)]" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 pb-24 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group inline-flex w-fit items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 transition hover:border-white/60 hover:text-white"
        >
          <BackIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          返回榜单
        </Link>

        <Card className="w-full border-border/40 bg-slate-900/70 backdrop-blur">
          <CardHeader className="gap-6 pb-0">
            <div className="flex items-start gap-6">
              <Avatar
                className="h-16 w-16 shrink-0 text-xl"
                style={{ background: merchant.avatarColor }}
              >
                {merchant.avatarUrl ? (
                  <AvatarImage src={merchant.avatarUrl} alt={merchant.name} />
                ) : (
                  <AvatarFallback>{merchant.avatarFallback}</AvatarFallback>
                )}
              </Avatar>

              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="shrink-0">{merchant.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {merchant.location}
                  </span>
                </div>
                <CardTitle className="break-words text-3xl font-semibold text-foreground">
                  {merchant.name}
                </CardTitle>
                <CardDescription className="break-words text-base text-muted-foreground">
                  {merchant.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-10 pt-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center justify-center rounded-2xl border border-border/40 bg-white/[0.02] p-6">
                <RatingDisplay
                  rating={merchant.rating}
                  reviewCount={merchant.reviews}
                  starSize="lg"
                  align="center"
                />
              </div>

              <div className="rounded-2xl border border-border/40 bg-white/[0.02] p-6">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  我的评分
                </p>
                <div className="mt-4 flex flex-col gap-4">
                  <StarRatingInput value={userRating} onChange={setUserRating} />
                  <p className="text-sm text-muted-foreground">
                    {userRating > 0 ? `${userRating.toFixed(1)} 分` : "点击星星为商家打分"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/40 bg-white/[0.02] p-6 md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  主营
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {mainServiceIcons.map((icon) => (
                    <div
                      key={icon.src}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/30 bg-white/[0.04]"
                    >
                      <Image
                        src={icon.src}
                        alt={icon.alt}
                        width={28}
                        height={28}
                        className="h-7 w-7 shrink-0 object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-6">
            <button
              type="button"
              onClick={handleReaction("likes")}
              className="inline-flex cursor-pointer select-none items-center gap-2 rounded-full border border-gray-500/40 px-3 py-1.5 text-gray-300 transition-colors hover:border-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              aria-label={`${merchant.name} 点赞`}
            >
              <LikeIcon className="h-4 w-4" aria-hidden="true" />
              <span className="font-medium text-foreground">{likeCountLabel}</span>
            </button>
            <button
              type="button"
              onClick={handleReaction("dislikes")}
              className="inline-flex cursor-pointer select-none items-center gap-2 rounded-full border border-gray-600/40 px-3 py-1.5 text-gray-500 transition-colors hover:border-gray-400/50 hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              aria-label={`${merchant.name} 点踩`}
            >
              <DislikeIcon className="h-4 w-4" aria-hidden="true" />
              <span className="font-medium text-foreground">{dislikeCountLabel}</span>
            </button>
            <button
              type="button"
              onClick={handleScrollToReviews}
              className="inline-flex cursor-pointer select-none items-center gap-2 rounded-full border border-gray-500/40 px-3 py-1.5 text-gray-300 transition-colors hover:border-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              aria-label={`${merchant.name} 查看用户评价`}
            >
              <ReviewIcon className="h-4 w-4" aria-hidden="true" />
              <span className="font-medium text-foreground">{reviewCountLabel} 条评价</span>
            </button>
          </CardFooter>
        </Card>

        <section
          ref={reviewSectionRef}
          id="merchant-reviews"
          className="space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-foreground">用户评价</h2>
            <span className="text-sm text-muted-foreground">
              {ratings.length > 0 ? `${ratings.length} 条记录` : reviewCountLabel}
            </span>
          </div>

          <div className="space-y-3">
            {ratings.length > 0 ? (
              // 显示数据库中的真实评论
              ratings.map((rating) => {
                const userName = rating.user.name || rating.user.email.split("@")[0];
                const avatarFallback = userName.charAt(0).toUpperCase();

                return (
                  <Card
                    key={rating.id}
                    className="border-border/40 bg-slate-900/60 p-4 lg:p-5 backdrop-blur"
                  >
                    <CardHeader className="mb-1 gap-1.5 pb-1">
                      <div className="grid grid-cols-[auto,1fr] items-start gap-x-2 gap-y-1.5">
                        <Avatar className="h-10 w-10 text-sm">
                          {rating.user.image ? (
                            <AvatarImage src={rating.user.image} alt={userName} />
                          ) : (
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-medium text-foreground">
                              {userName}
                            </h3>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, index) => {
                                const filled = index < Math.floor(rating.rating);
                                const halfFilled = index === Math.floor(rating.rating) && rating.rating % 1 !== 0;

                                return (
                                  <svg
                                    key={index}
                                    className="h-3.5 w-3.5"
                                    fill={filled || halfFilled ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.98a1 1 0 00.95.69h4.19c.969 0 1.371 1.24.588 1.81l-3.392 2.466a1 1 0 00-.364 1.118l1.287 3.98c.3.922-.755 1.688-1.538 1.118l-3.392-2.466a1 1 0 00-1.176 0l-3.392 2.466c-.783.57-1.838-.196-1.539-1.118l1.287-3.98a1 1 0 00-.364-1.118L2.94 9.407c-.783-.57-.38-1.81.588-1.81h4.19a1 1 0 00.95-.69l1.286-3.98z" />
                                  </svg>
                                );
                              })}
                                  <span className="ml-1 text-xs text-white">{rating.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {dateFormatter.format(new Date(rating.createdAt))}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    {rating.comment && (
                      <CardContent className="gap-2 pt-2 pb-1">
                        <p className="break-words text-sm leading-relaxed text-muted-foreground">
                          {rating.comment}
                        </p>
                      </CardContent>
                    )}
                    <CardFooter className="mt-1 w-full justify-end gap-2 border-t border-border/30 pt-2">
                        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <LikeIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                          <span>
                            点赞 <span className="text-foreground font-medium">{rating.likesCount.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              // 如果没有数据库评论，显示静态数据
              merchant.customerReviews.map((review) => (
                <Card
                  key={review.id}
                  className="border-border/40 bg-slate-900/60 p-4 lg:p-5 backdrop-blur"
                >
                  <CardHeader className="mb-1 gap-1.5 pb-1">
                    <div className="grid grid-cols-[auto,1fr] items-start gap-x-2 gap-y-1.5">
                      <Avatar className="h-10 w-10 text-sm">
                        {review.avatarUrl ? (
                          <AvatarImage src={review.avatarUrl} alt={review.userName} />
                        ) : (
                          <AvatarFallback>{review.avatarFallback}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium text-foreground">
                          {review.userName}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {dateFormatter.format(new Date(review.createdAt))}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="gap-2 pt-0 pb-1">
                    <p className="break-words text-sm leading-relaxed text-muted-foreground">
                      {review.comment}
                    </p>
                  </CardContent>
                  <CardFooter className="mt-1 w-full justify-end gap-2 border-t border-border/30 pt-2">
                      <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <LikeIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                        <span>
                          点赞 <span className="text-foreground font-medium">{review.likes.toLocaleString()}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ReviewIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                        <span>
                          回复 <span className="text-foreground font-medium">{review.replies.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </section>

        <button
          type="button"
          onClick={handleOpenCommentForm}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl shadow-white/30 transition-all hover:scale-105 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-label="发表评价"
        >
          <ReviewIcon className="h-6 w-6" aria-hidden="true" />
          <span className="sr-only">打开评价表单</span>
        </button>

        {isCommentFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
              aria-hidden="true"
              onClick={handleCloseCommentForm}
            />

            <Card
              role="dialog"
              aria-modal="true"
              className="relative z-10 w-full max-w-lg border-border/40 bg-slate-900/90 p-2 backdrop-blur"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-foreground">发表评价</CardTitle>
              </CardHeader>

              <form onSubmit={handleCommentSubmit} className="space-y-4 p-4 pt-0">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    评分 {userRating > 0 && <span className="text-white">({userRating.toFixed(1)} 分)</span>}
                  </label>
                  <div className="flex items-center gap-2">
                    <StarRatingInput value={userRating} onChange={setUserRating} />
                  </div>
                  {userRating === 0 && (
                    <p className="text-xs text-muted-foreground">请为商家打分</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="comment-content">
                    评论内容
                  </label>
                  <textarea
                    id="comment-content"
                    value={commentContent}
                    onChange={(event) => setCommentContent(event.target.value)}
                    placeholder="分享你的真实感受..."
                    className="min-h-[160px] w-full resize-none rounded-lg border border-border/40 bg-slate-950/60 px-3 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-white/80 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseCommentForm}
                    className="rounded-full border border-border/40 px-4 py-2 text-sm text-muted-foreground transition hover:border-border/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    disabled={isSubmitting}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={commentContent.trim().length === 0 || userRating === 0 || isSubmitting}
                  >
                    {isSubmitting ? "提交中..." : "提交评价"}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
