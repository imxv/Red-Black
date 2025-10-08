import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

function makeSlugFromUserId(userId: string) {
  return `merchant-${userId.slice(0, 12)}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const userId = session.user.id;

    // 防止重复申请
    const [user, existingMerchant] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, isMerchant: true } }),
      prisma.merchant.findUnique({ where: { userId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (user.isMerchant || existingMerchant) {
      return NextResponse.json({ error: "您已是商家，无法重复申请" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { category, location, description, highlights } = body ?? {};

    const displayName = user.name || (user.email ? user.email.split("@")[0] : "商家");
    const slug = makeSlugFromUserId(userId);

    // highlights: 允许前端传 string[] 或 逗号分隔字符串
    let highlightsArray: string[] = [];
    if (Array.isArray(highlights)) {
      highlightsArray = highlights.filter((s: unknown) => typeof s === "string").map((s: string) => s.trim()).filter(Boolean).slice(0, 8);
    } else if (typeof highlights === "string") {
      highlightsArray = highlights.split(",").map((s: string) => s.trim()).filter(Boolean).slice(0, 8);
    }

    const merchant = await prisma.merchant.create({
      data: {
        userId,
        slug,
        displayName,
        category: typeof category === "string" && category.trim() ? category.trim() : null,
        location: typeof location === "string" && location.trim() ? location.trim() : null,
        description: typeof description === "string" && description.trim() ? description.trim() : null,
        avatarColor: "#0ea5e9",
        responseTime: null,
        highlights: highlightsArray,
      },
    });

    // 更新用户为商家
    await prisma.user.update({ where: { id: userId }, data: { isMerchant: true } });

    return NextResponse.json({ success: true, data: merchant, message: "申请成功，已成为商家" });
  } catch (error) {
    console.error("申请成为商家失败:", error);
    return NextResponse.json({ error: "申请失败，请稍后重试" }, { status: 500 });
  }
}

