import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { type } = await req.json();
    if (!type || !["LIKE", "DISLIKE"].includes(type)) {
      return NextResponse.json({ error: "无效的反应类型" }, { status: 400 });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
    });

    if (!merchant) {
      return NextResponse.json({ error: "商家不存在" }, { status: 404 });
    }

    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_targetType_merchantId: {
          userId: session.user.id,
          targetType: "MERCHANT",
          merchantId: merchant.id,
        },
      },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        return NextResponse.json(
          { error: "您已经对此商家做出过反应" },
          { status: 400 }
        );
      }

      // 更新反应类型
      await prisma.$transaction([
        prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type },
        }),
        prisma.merchant.update({
          where: { id: merchant.id },
          data: {
            likesCount:
              type === "LIKE"
                ? { increment: 1 }
                : { decrement: 1 },
            dislikesCount:
              type === "DISLIKE"
                ? { increment: 1 }
                : { decrement: 1 },
          },
        }),
      ]);
    } else {
      // 创建新反应
      await prisma.$transaction([
        prisma.reaction.create({
          data: {
            userId: session.user.id,
            type,
            targetType: "MERCHANT",
            merchantId: merchant.id,
          },
        }),
        prisma.merchant.update({
          where: { id: merchant.id },
          data: {
            [type === "LIKE" ? "likesCount" : "dislikesCount"]: {
              increment: 1,
            },
          },
        }),
      ]);
    }

    const updatedMerchant = await prisma.merchant.findUnique({
      where: { id: merchant.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        likesCount: updatedMerchant?.likesCount,
        dislikesCount: updatedMerchant?.dislikesCount,
        userReaction: type,
      },
    });
  } catch (error) {
    console.error("处理反应失败:", error);
    return NextResponse.json({ error: "处理反应失败" }, { status: 500 });
  }
}
