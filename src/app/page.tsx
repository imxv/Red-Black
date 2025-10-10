"use client";

import {
  type KeyboardEvent,
  type MouseEvent,
  type SVGProps,
  useEffect,
  useState,
} from "react";
import { animate } from "animejs";
import { useRouter } from "next/navigation";

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
import { cn } from "@/lib/utils";
import { RatingDisplay } from "@/components/merchant/rating-display";
import { merchants as merchantSource, type Merchant } from "@/data/merchants";
import { mainServiceIcons } from "@/data/main-services";
import { ExposureForm } from "@/components/exposure/exposure-form";
import { ExposureCard } from "@/components/exposure/exposure-card";
import { loadExposures, updateExposure, type Exposure } from "@/data/exposures";
import { useSession, authClient } from "@/lib/auth-client";
import Link from "next/link";
import Image from "next/image";

const MAX_MAIN_SERVICE_ICONS = 3;
const mainServiceIconsToDisplay = mainServiceIcons.slice(0, MAX_MAIN_SERVICE_ICONS);
const hasExtraMainServiceIcons = mainServiceIcons.length > MAX_MAIN_SERVICE_ICONS;

type IconProps = SVGProps<SVGSVGElement>;

type MerchantRecord = {
  slug: string;
  displayName: string;
  category: string | null;
  averageRating: number | null;
  totalRatings: number | null;
  likesCount: number | null;
  dislikesCount: number | null;
  location: string | null;
  responseTime: string | null;
  avatarFallback?: string | null;
  avatarUrl: string | null;
  avatarColor: string | null;
  description: string | null;
  highlights: string[] | null;
  userReaction: string | null;
};

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

function PlusIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function CloseIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

type Section = "merchants" | "exposures";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [activeSection, setActiveSection] = useState<Section>("merchants");
  const [merchantData, setMerchantData] = useState<Merchant[]>(() =>
    merchantSource.map((merchant) => ({ ...merchant })),
  );
  const [exposureData, setExposureData] = useState<Exposure[]>([]);
  const [showExposureForm, setShowExposureForm] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // 加载数据库中的商家并合并到展示列表
  useEffect(() => {
    async function loadDbMerchants() {
      try {
        const res = await fetch("/api/merchants", { cache: "no-store" });
        const json: { data?: MerchantRecord[] } = await res.json();
        if (!res.ok) return;
        const records = Array.isArray(json.data) ? json.data : [];
        const mapped: Merchant[] = records.map((record) => ({
          slug: record.slug,
          name: record.displayName,
          category: record.category ?? "",
          rating: record.averageRating ?? 0,
          scoreDelta: 0,
          reviews: record.totalRatings ?? 0,
          likes: record.likesCount ?? 0,
          dislikes: record.dislikesCount ?? 0,
          location: record.location ?? "",
          monthlyGrowth: 0,
          responseTime: record.responseTime ?? "",
          avatarFallback: (record.displayName || "商").charAt(0),
          avatarUrl: record.avatarUrl || undefined,
          avatarColor: record.avatarColor || "#0ea5e9",
          description: record.description ?? "",
          highlights: record.highlights ?? [],
          customerReviews: [],
          userReaction: record.userReaction,
        }));
        setMerchantData((prev) => {
          const existing = new Set(prev.map((p) => p.slug));
          const merged = [...prev];
          for (const item of mapped) {
            if (!existing.has(item.slug)) merged.push(item);
          }
          return merged;
        });
      } catch (e) {
        console.error("加载商家列表失败", e);
      }
    }
    loadDbMerchants();
  }, []);

  // 加载曝光数据
  useEffect(() => {
    if (activeSection === "exposures") {
      setExposureData(loadExposures());
    }
  }, [activeSection]);

  const handleReaction = (
    merchant: Merchant,
    type: "LIKE" | "DISLIKE",
  ) => async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    try {
      const res = await fetch(`/api/merchants/${merchant.slug}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        return;
      }

      setMerchantData((previous) =>
        previous.map((m) =>
          m.slug === merchant.slug
            ? {
                ...m,
                likes: data.data.likesCount,
                dislikes: data.data.dislikesCount,
                userReaction: data.data.userReaction,
              }
            : m,
        ),
      );

      animate(event.currentTarget, {
        scale: [1, 1.12, 1],
        duration: 280,
        easing: "easeOutBack",
      });

      const iconElement = event.currentTarget.querySelector("svg");

      if (iconElement) {
        animate(iconElement, {
          rotate: type === "LIKE" ? [0, -12, 0] : [0, 12, 0],
          duration: 320,
          easing: "easeOutQuad",
        });
      }
    } catch (error) {
      console.error("处理反应失败:", error);
    }
  };

  const handleExposureReaction = (id: string, field: "likes" | "dislikes") => {
    const exposures = loadExposures();
    const exposure = exposures.find((exp) => exp.id === id);

    if (exposure) {
      const updatedValue = exposure[field] + 1;
      updateExposure(id, { [field]: updatedValue });
      setExposureData(loadExposures());
    }
  };

  const handleExposureSubmitSuccess = () => {
    setExposureData(loadExposures());
    setShowExposureForm(false);
    // 滚动到顶部查看新提交的曝光
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  const getAvatarFallback = (name?: string | null, email?: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_55%)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(at_top_left,_rgba(59,130,246,0.18),_transparent_55%)]" />

      {/* 右上角登录/注册按钮 */}
      <div className="fixed top-6 right-6 z-50">
        {isPending ? (
          <div className="h-10 w-24 animate-pulse rounded-full bg-white/5" />
        ) : session?.user ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 rounded-full border border-border/40 bg-slate-900/80 px-3 py-2 backdrop-blur-lg transition-all hover:border-sky-400/60 hover:bg-slate-900/90"
            >
              <Avatar className="h-7 w-7">
                {session.user.image && (
                  <AvatarImage src={session.user.image} alt={session.user.name || ""} />
                )}
                <AvatarFallback className="bg-sky-500 text-white text-xs">
                  {getAvatarFallback(session.user.name, session.user.email)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm text-foreground">{session.user.name || session.user.email}</span>
            </button>

            {/* 用户菜单下拉 */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/40 bg-slate-900/95 py-2 shadow-xl backdrop-blur-lg z-20">
                  <div className="px-4 py-3 border-b border-border/40">
                    <p className="text-sm font-medium text-foreground truncate">
                      {session.user.name || "用户"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push("/settings");
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-white/5 transition-colors"
                  >
                    个人设置
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-rose-400 hover:bg-white/5 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="rounded-full border border-border/40 bg-slate-900/80 px-5 py-2 text-sm text-foreground backdrop-blur-lg transition-all hover:border-sky-400/60 hover:bg-slate-900/90"
            >
              登录
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-sky-500 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-sky-600 hover:scale-105 shadow-lg shadow-sky-500/30"
            >
              注册
            </Link>
          </div>
        )}
      </div>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <header className="max-w-3xl space-y-4">
            <Badge className="w-fit">爬宠界的 &ldquo;大众点评&rdquo;</Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              爬宠商家红黑榜
            </h1>
            <p className="text-base text-muted-foreground">
              玩家们自发组织的爬宠商家红黑榜，公平公正，旨在帮助大家选择更靠谱的优质商家，避雷黑心商家。
            </p>
          </header>

          {/* 分区切换标签 */}
          <div className="flex gap-2 self-end lg:self-start">
            <button
              type="button"
              onClick={() => setActiveSection("merchants")}
              className={cn(
                "rounded-lg px-6 py-2.5 text-sm font-medium transition-all",
                activeSection === "merchants"
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                  : "bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>商家榜单</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("exposures")}
              className={cn(
                "rounded-lg px-6 py-2.5 text-sm font-medium transition-all",
                activeSection === "exposures"
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                  : "bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>曝光专区</span>
              </div>
            </button>
          </div>
        </div>

        {/* 商家榜单内容 */}
        {activeSection === "merchants" && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {merchantData.map((merchant) => (
              <Card
                key={merchant.name}
                className={cn(
                  "merchant-card relative cursor-pointer border-border/50 bg-slate-900/70 p-5 backdrop-blur-lg",
                  "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/5 before:via-white/0 before:to-white/10",
                )}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/merchants/${merchant.slug}`)}
                onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/merchants/${merchant.slug}`);
                  }
                }}
              >
                <CardHeader className="mb-4 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      className="h-14 w-14 text-lg"
                      style={{ background: merchant.avatarColor }}
                    >
                      {merchant.avatarUrl ? (
                        <AvatarImage src={merchant.avatarUrl} alt={merchant.name} />
                      ) : (
                        <AvatarFallback>{merchant.avatarFallback}</AvatarFallback>
                      )}
                    </Avatar>

                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {merchant.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {merchant.location}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                  <RatingDisplay rating={merchant.rating} />

                  <div className="grid grid-cols-1 gap-3 text-sm text-foreground">
                    <div className="rounded-2xl border border-border/40 bg-white/[0.02] p-3 backdrop-blur">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">主营</p>
                      <div className="mt-2 flex items-center gap-2 overflow-hidden">
                        {mainServiceIconsToDisplay.map((icon) => (
                          <div key={icon.src} className="flex flex-1 justify-center">
                            <Image
                              src={icon.src}
                              alt={icon.alt}
                              width={36}
                              height={36}
                              className="h-9 w-9 flex-shrink-0 object-contain"
                            />
                          </div>
                        ))}
                        {hasExtraMainServiceIcons && (
                          <span className="flex flex-1 justify-center text-base font-medium text-muted-foreground">
                            ...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="mt-2 border-t border-border/40 pt-4 text-sm text-muted-foreground">
                  <div className="flex w-full flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleReaction(merchant, "LIKE")}
                      disabled={merchant.userReaction === "LIKE"}
                      className={cn(
                        "inline-flex select-none items-center gap-1 rounded-full px-2 py-1 text-emerald-300/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                        merchant.userReaction === "LIKE"
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:text-emerald-200"
                      )}
                      aria-label={`${merchant.name} 点赞`}
                    >
                      <LikeIcon className="like-icon h-4 w-4" aria-hidden="true" />
                      <span className="font-medium text-foreground">
                        {merchant.likes.toLocaleString()}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleReaction(merchant, "DISLIKE")}
                      disabled={merchant.userReaction === "DISLIKE"}
                      className={cn(
                        "inline-flex select-none items-center gap-1 rounded-full px-2 py-1 text-rose-300/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                        merchant.userReaction === "DISLIKE"
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:text-rose-200"
                      )}
                      aria-label={`${merchant.name} 点踩`}
                    >
                      <DislikeIcon className="dislike-icon h-4 w-4" aria-hidden="true" />
                      <span className="font-medium text-foreground">
                        {merchant.dislikes.toLocaleString()}
                      </span>
                    </button>
                    <div className="flex items-center gap-1">
                      <ReviewIcon className="h-4 w-4 text-sky-300/90" aria-hidden="true" />
                      <span className="font-medium text-foreground">
                        {merchant.reviews.toLocaleString()} 条
                      </span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* 曝光专区内容 */}
        {activeSection === "exposures" && (
          <>
            <div className="space-y-6 pb-24">
            {/* 曝光提交表单 */}
            {showExposureForm && (
              <ExposureForm onSubmitSuccess={handleExposureSubmitSuccess} />
            )}

            {/* 曝光列表 */}
            {exposureData.length > 0 ? (
              <div className="grid gap-6">
                {exposureData.map((exposure) => (
                  <ExposureCard
                    key={exposure.id}
                    exposure={exposure}
                    onLike={(id) => handleExposureReaction(id, "likes")}
                    onDislike={(id) => handleExposureReaction(id, "dislikes")}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border/40 bg-slate-900/70 p-12 text-center backdrop-blur-lg">
                <svg
                  className="mx-auto h-16 w-16 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-semibold text-foreground">暂无曝光信息</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  还没有人提交曝光，成为第一个曝光黑心商家的人吧！
                </p>
              </div>
            )}
            </div>

            <button
              type="button"
              onClick={() => setShowExposureForm((previous) => !previous)}
              className={cn(
                "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                "shadow-xl shadow-rose-500/40",
                "bg-rose-500 text-white hover:scale-105 hover:bg-rose-600",
              )}
              aria-label={showExposureForm ? "取消提交曝光" : "提交曝光"}
            >
              {showExposureForm ? (
                <CloseIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <PlusIcon className="h-6 w-6" aria-hidden="true" />
              )}
              <span className="sr-only">
                {showExposureForm ? "取消提交曝光" : "提交曝光"}
              </span>
            </button>
          </>
        )}
      </main>
    </div>
  );
}
