"use client";

import { useEffect } from "react";
import { animate } from "animejs";

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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Merchant = {
  name: string;
  category: string;
  rating: number;
  scoreDelta: number;
  reviews: number;
  topProduct: string;
  location: string;
  monthlyGrowth: number;
  responseTime: string;
  avatarFallback: string;
  avatarUrl?: string;
  avatarColor: string;
};

const merchants: Merchant[] = [
  {
    name: "晨光书屋",
    category: "精品书店",
    rating: 4.9,
    scoreDelta: 0.2,
    reviews: 1240,
    topProduct: "限量签名本",
    location: "上海 · 徐汇",
    monthlyGrowth: 18,
    responseTime: "平均响应 1.8 小时",
    avatarFallback: "晨",
    avatarColor: "#2563eb",
  },
  {
    name: "南麓咖啡实验室",
    category: "咖啡馆",
    rating: 4.8,
    scoreDelta: 0.3,
    reviews: 980,
    topProduct: "桂花冷萃",
    location: "杭州 · 西湖",
    monthlyGrowth: 22,
    responseTime: "平均响应 1.2 小时",
    avatarFallback: "南",
    avatarColor: "#0ea5e9",
  },
  {
    name: "赤霞慢食",
    category: "健康轻食",
    rating: 4.7,
    scoreDelta: 0.1,
    reviews: 860,
    topProduct: "炙烤三文鱼碗",
    location: "成都 · 锦江",
    monthlyGrowth: 16,
    responseTime: "平均响应 2.3 小时",
    avatarFallback: "赤",
    avatarColor: "#f97316",
  },
  {
    name: "归一茶社",
    category: "茶饮新式",
    rating: 4.6,
    scoreDelta: -0.1,
    reviews: 730,
    topProduct: "炭焙乌龙",
    location: "广州 · 越秀",
    monthlyGrowth: 12,
    responseTime: "平均响应 3.1 小时",
    avatarFallback: "归",
    avatarColor: "#22d3ee",
  },
  {
    name: "北岸甜品铺",
    category: "甜品铺",
    rating: 4.6,
    scoreDelta: 0.2,
    reviews: 690,
    topProduct: "法式千层",
    location: "北京 · 朝阳",
    monthlyGrowth: 15,
    responseTime: "平均响应 1.9 小时",
    avatarFallback: "北",
    avatarColor: "#ec4899",
  },
  {
    name: "石花花坊",
    category: "生活方式",
    rating: 4.5,
    scoreDelta: -0.2,
    reviews: 540,
    topProduct: "限定花束",
    location: "深圳 · 南山",
    monthlyGrowth: 9,
    responseTime: "平均响应 2.7 小时",
    avatarFallback: "石",
    avatarColor: "#8b5cf6",
  },
];

export default function Home() {
  useEffect(() => {
    const animation = animate(".merchant-card", {
      opacity: [0, 1],
      translateY: [24, 0],
      delay: (_el, index) => index * 90,
      duration: 720,
      easing: "easeOutQuad",
    });

    return () => {
      animation.pause();
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_55%)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(at_top_left,_rgba(59,130,246,0.18),_transparent_55%)]" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 lg:px-8">
        <header className="max-w-3xl space-y-4">
          <Badge className="w-fit">城市商家榜</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            城市商家评分榜
          </h1>
          <p className="text-base text-muted-foreground">
            精选本周评分最高的热门商家，通过一句话了解他们的优势、服务口碑与互动趋势。
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {merchants.map((merchant) => (
            <Card
              key={merchant.name}
              className={cn(
                "merchant-card relative border-border/50 bg-slate-900/70 p-6 backdrop-blur-lg",
                "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/5 before:via-white/0 before:to-white/10",
              )}
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

              <CardContent className="gap-6">
                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-4xl font-semibold text-foreground">
                      {merchant.rating.toFixed(1)}
                    </span>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">综合评分</p>
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <Progress value={(merchant.rating / 5) * 100} />
                    <span className="text-xs text-muted-foreground">
                      {merchant.reviews} 条点评
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 text-sm text-foreground sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/40 bg-white/[0.02] p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">招牌推荐</p>
                    <p className="mt-2 font-medium">{merchant.topProduct}</p>
                  </div>
                  <div className="rounded-2xl border border-border/40 bg-white/[0.02] p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">月度互动</p>
                    <p className="mt-2 font-medium">{merchant.monthlyGrowth}% 增长</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
