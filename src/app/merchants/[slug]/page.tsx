import { notFound } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";
import { getMerchantBySlug } from "@/data/merchants";
import type { Merchant as MerchantCard } from "@/data/merchants";


import { MerchantDetailClient } from "./merchant-detail-client";

const prisma = new PrismaClient();

export default async function MerchantDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // 优先从静态数据获取商家（用于演示数据）
  let merchantData = getMerchantBySlug(params.slug) as MerchantCard | undefined;

  // 查找数据库中的商家（用于用户申请创建的真实数据）
  const dbMerchant = await prisma.merchant.findUnique({
    where: { slug: params.slug },
  });

  if (!merchantData && dbMerchant) {
    merchantData = {
      slug: dbMerchant.slug,
      name: dbMerchant.displayName,
      category: dbMerchant.category || "",
      rating: dbMerchant.averageRating || 0,
      scoreDelta: 0,
      reviews: dbMerchant.totalRatings || 0,
      likes: dbMerchant.likesCount || 0,
      dislikes: dbMerchant.dislikesCount || 0,
      location: dbMerchant.location || "",
      monthlyGrowth: 0,
      responseTime: dbMerchant.responseTime || "",
      avatarFallback: (dbMerchant.displayName || "商").charAt(0),
      avatarUrl: dbMerchant.avatarUrl || undefined,
      avatarColor: dbMerchant.avatarColor || "#0ea5e9",
      description: dbMerchant.description || "",
      highlights: dbMerchant.highlights || [],
      customerReviews: [],
    };
  }

  if (!merchantData) {
    notFound();
  }

  let ratings: Array<{
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
  }> = [];

  if (dbMerchant) {
    // 获取评论列表
    ratings = await prisma.merchantRating.findMany({
      where: { merchantId: dbMerchant.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  return <MerchantDetailClient merchant={merchantData} ratings={ratings} />;
}
