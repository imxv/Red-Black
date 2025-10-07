"use client";

import { type MouseEvent, useState } from "react";
import { animate } from "animejs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Exposure } from "@/data/exposures";

type ExposureCardProps = {
  exposure: Exposure;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
};

export function ExposureCard({ exposure, onLike, onDislike }: ExposureCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const handleReaction = (
    type: "like" | "dislike",
    handler?: (id: string) => void
  ) => (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    handler?.(exposure.id);

    animate(event.currentTarget, {
      scale: [1, 1.12, 1],
      duration: 280,
      easing: "easeOutBack",
    });

    const iconElement = event.currentTarget.querySelector("svg");

    if (iconElement) {
      animate(iconElement, {
        rotate: type === "like" ? [0, -12, 0] : [0, 12, 0],
        duration: 320,
        easing: "easeOutQuad",
      });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % exposure.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + exposure.images.length) % exposure.images.length
    );
  };

  return (
    <>
      <Card
        className={cn(
          "exposure-card relative border-border/50 bg-slate-900/70 p-6 backdrop-blur-lg",
          "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/5 before:via-white/0 before:to-white/10"
        )}
      >
        <CardHeader className="relative mb-4 flex items-start gap-3 p-0">
          <div className="flex items-center gap-3 pr-16">
            <Avatar className="h-10 w-10 text-sm bg-sky-500">
              <AvatarFallback>{exposure.submitterAvatar}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <p className="text-sm font-medium text-foreground">{exposure.submitter}</p>
            </div>
          </div>

          <span className="absolute right-0 top-0 text-xs text-muted-foreground">
            {exposure.createdAt}
          </span>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 p-0">
          <div className="space-y-2">
            {/* 标题 */}
            <h3 className="text-lg font-semibold text-foreground">{exposure.title}</h3>

            {/* 描述 */}
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {exposure.description}
            </p>
          </div>

          {/* 图片轮播 */}
          {exposure.images.length > 0 && (
            <div className="relative">
              <div
                className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-black/20"
                onClick={() => setIsImageViewerOpen(true)}
              >
                <img
                  src={exposure.images[currentImageIndex].url}
                  alt={`证据图片 ${currentImageIndex + 1}`}
                  className="h-full w-full object-contain transition-transform group-hover:scale-105"
                />

                {/* 图片数量指示器 */}
                {exposure.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
                    {currentImageIndex + 1} / {exposure.images.length}
                  </div>
                )}

                {/* 放大图标提示 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="rounded-full bg-black/60 p-3 backdrop-blur">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 左右切换按钮 */}
              {exposure.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-all hover:bg-black/80"
                    aria-label="上一张"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-all hover:bg-black/80"
                    aria-label="下一张"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}

        </CardContent>

        <CardFooter className="mt-4 border-t border-border/40 p-0 pt-4">
          <div className="flex w-full flex-wrap items-end gap-4 text-sm text-muted-foreground">
            {exposure.tags && exposure.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exposure.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-white/[0.04] text-xs text-muted-foreground hover:bg-white/[0.08]"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="ml-auto flex items-center gap-4">
              <button
                type="button"
                onClick={handleReaction("like", onLike)}
                className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full px-2 py-1 text-emerald-300/90 transition-colors hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
                aria-label="支持"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.4}
                >
                  <path d="M6 10.4v8.2" />
                  <path d="M8.5 18.6h7.22a2 2 0 001.93-1.46l1.12-4.08A1.5 1.5 0 0017.33 11h-3.98l.56-2.84a1.8 1.8 0 00-3.48-1.02l-1.93 3.26a2.9 2.9 0 01-.53.67l-.47.44" />
                  <path d="M6 10.4H4.3A2.3 2.3 0 002 12.7v3.18A2.3 2.3 0 004.3 18.2H6" />
                </svg>
                <span className="font-medium text-foreground">
                  {exposure.likes.toLocaleString()}
                </span>
              </button>

              <button
                type="button"
                onClick={handleReaction("dislike", onDislike)}
                className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full px-2 py-1 text-rose-300/90 transition-colors hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60"
                aria-label="质疑"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.4}
                >
                  <path d="M18 13.6V5.4" />
                  <path d="M15.5 5.4H8.28a2 2 0 00-1.93 1.46l-1.12 4.08A1.5 1.5 0 006.67 13h3.98l-.56 2.84a1.8 1.8 0 003.48 1.02l1.93-3.26c.15-.25.33-.47.53-.67l.47-.44" />
                  <path d="M18 13.6h1.7A2.3 2.3 0 0022 11.3V8.12A2.3 2.3 0 0019.7 5.8H18" />
                </svg>
                <span className="font-medium text-foreground">
                  {exposure.dislikes.toLocaleString()}
                </span>
              </button>

              <div className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4 text-sky-300/90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M4 6.75A2.75 2.75 0 016.75 4h10.5A2.75 2.75 0 0120 6.75V13a2.75 2.75 0 01-2.75 2.75H12l-4 3.25V15.75H6.75A2.75 2.75 0 014 13V6.75z" />
                  <path d="M8.5 8.75h7" />
                  <path d="M8.5 12h4.5" />
                </svg>
                <span className="font-medium text-foreground">
                  {exposure.comments.length}
                </span>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* 图片查看器模态框 */}
      {isImageViewerOpen && exposure.images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsImageViewerOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsImageViewerOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="关闭"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={exposure.images[currentImageIndex].url}
              alt={`证据图片 ${currentImageIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />

            {exposure.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                  aria-label="上一张"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                  aria-label="下一张"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur">
                  {currentImageIndex + 1} / {exposure.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
