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

const MAX_MAIN_SERVICE_ICONS = 3;
const mainServiceIconsToDisplay = mainServiceIcons.slice(0, MAX_MAIN_SERVICE_ICONS);
const hasExtraMainServiceIcons = mainServiceIcons.length > MAX_MAIN_SERVICE_ICONS;

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

export default function Home() {
  const router = useRouter();
  const [merchantData, setMerchantData] = useState<Merchant[]>(() =>
    merchantSource.map((merchant) => ({ ...merchant })),
  );

  useEffect(() => {
    const cardAnimation = animate(".merchant-card", {
      opacity: [0, 1],
      translateY: [24, 0],
      delay: (_el, index) => index * 90,
      duration: 720,
      easing: "easeOutQuad",
    });

    return () => {
      cardAnimation.pause();
    };
  }, []);

  const handleReaction = (
    index: number,
    field: "likes" | "dislikes",
  ) => (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    setMerchantData((previous) =>
      previous.map((merchant, merchantIndex) =>
        merchantIndex === index
          ? { ...merchant, [field]: merchant[field] + 1 }
          : merchant,
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
        rotate: field === "likes" ? [0, -12, 0] : [0, 12, 0],
        duration: 320,
        easing: "easeOutQuad",
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_55%)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(at_top_left,_rgba(59,130,246,0.18),_transparent_55%)]" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 lg:px-8">
        <header className="max-w-3xl space-y-4">
          <Badge className="w-fit">爬宠界的 “大众点评”</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            爬宠商家红黑榜
          </h1>
          <p className="text-base text-muted-foreground">
            玩家们自发组织的爬宠商家红黑榜，公平公正，旨在帮助大家选择更靠谱的优质商家，避雷黑心商家。
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {merchantData.map((merchant, index) => (
            <Card
              key={merchant.name}
              className={cn(
                "merchant-card relative cursor-pointer border-border/50 bg-slate-900/70 p-6 backdrop-blur-lg",
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
              <CardHeader className="mb-6 flex flex-col gap-6">
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

              <CardContent className="flex flex-col gap-6">
                <RatingDisplay rating={merchant.rating} />

                <div className="grid gap-4 text-sm text-foreground sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/40 bg-white/[0.02] p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">主营</p>
                    <div className="mt-3 flex items-center gap-1.5 overflow-hidden">
                      {mainServiceIconsToDisplay.map((icon) => (
                        <img
                          key={icon.src}
                          src={icon.src}
                          alt={icon.alt}
                          className="h-7 w-7 flex-shrink-0 object-contain"
                          loading="lazy"
                        />
                      ))}
                      {hasExtraMainServiceIcons && (
                        <span className="flex-shrink-0 text-sm font-medium text-muted-foreground">
                          ...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-2 border-t border-border/40 pt-4 text-sm text-muted-foreground">
                <div className="flex w-full flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleReaction(index, "likes")}
                    className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full px-2 py-1 text-emerald-300/90 transition-colors hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    aria-label={`${merchant.name} 点赞`}
                  >
                    <LikeIcon className="like-icon h-4 w-4" aria-hidden="true" />
                    <span className="font-medium text-foreground">
                      {merchant.likes.toLocaleString()}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReaction(index, "dislikes")}
                    className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full px-2 py-1 text-rose-300/90 transition-colors hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    aria-label={`${merchant.name} 点踩`}
                  >
                    <DislikeIcon className="dislike-icon h-4 w-4" aria-hidden="true" />
                    <span className="font-medium text-foreground">
                      {merchant.dislikes.toLocaleString()}
                    </span>
                  </button>
                  <div className="flex items-center gap-1.5">
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
      </main>
    </div>
  );
}
