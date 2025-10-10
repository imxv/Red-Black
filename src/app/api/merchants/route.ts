import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id;

    const merchants = await prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
    });

    // 如果用户已登录，获取用户对这些商家的反应
    let userReactions: Record<string, string> = {};
    if (userId) {
      const reactions = await prisma.reaction.findMany({
        where: {
          userId,
          targetType: "MERCHANT",
          merchantId: { in: merchants.map((m) => m.id) },
        },
      });

      userReactions = Object.fromEntries(
        reactions.map((r) => [r.merchantId, r.type])
      );
    }

    // 将用户反应状态附加到每个商家数据
    const merchantsWithReactions = merchants.map((merchant) => ({
      ...merchant,
      userReaction: userReactions[merchant.id] || null,
    }));

    return NextResponse.json({ success: true, data: merchantsWithReactions });
  } catch (error) {
    console.error("获取商家列表失败:", error);
    return NextResponse.json({ error: "获取商家列表失败" }, { status: 500 });
  }
}
