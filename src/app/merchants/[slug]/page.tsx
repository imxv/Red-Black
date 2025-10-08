import { notFound } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";
import { getMerchantBySlug } from "@/data/merchants";

import { MerchantDetailClient } from "./merchant-detail-client";

const prisma = new PrismaClient();

export default async function MerchantDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // 从静态数据获取商家基本信息（用于显示）
  const merchantData = getMerchantBySlug(params.slug);

  if (!merchantData) {
    notFound();
  }

  // 从数据库获取该商家的评论
  // 首先查找数据库中的商家
  const dbMerchant = await prisma.merchant.findUnique({
    where: { slug: params.slug },
  });

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
