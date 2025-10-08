import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const prisma = new PrismaClient();

/**
 * GET /api/merchants/[slug]/ratings
 * 获取商家的所有评分和评论
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // 根据 slug 查找商家
    const merchant = await prisma.merchant.findUnique({
      where: { slug },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "商家不存在" },
        { status: 404 }
      );
    }

    // 获取该商家的所有评分，包含用户信息
    const ratings = await prisma.merchantRating.findMany({
      where: { merchantId: merchant.id },
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

    return NextResponse.json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    console.error("获取评论失败:", error);
    return NextResponse.json(
      { error: "获取评论失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/merchants/[slug]/ratings
 * 提交新的评分和评论
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // 验证用户登录状态
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { rating, comment } = body;

    // 验证评分
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "评分必须在 1-5 之间" },
        { status: 400 }
      );
    }

    // 验证评论内容（可选，但如果提供则不能为空）
    if (comment !== undefined && comment !== null && comment.trim().length === 0) {
      return NextResponse.json(
        { error: "评论内容不能为空" },
        { status: 400 }
      );
    }

    // 根据 slug 查找商家
    const merchant = await prisma.merchant.findUnique({
      where: { slug },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "商家不存在" },
        { status: 404 }
      );
    }

    // 检查用户是否已经评价过该商家
    const existingRating = await prisma.merchantRating.findUnique({
      where: {
        merchantId_userId: {
          merchantId: merchant.id,
          userId: session.user.id,
        },
      },
    });

    let result;

    if (existingRating) {
      // 如果已经评价过，则更新评价
      result = await prisma.merchantRating.update({
        where: {
          id: existingRating.id,
        },
        data: {
          rating: Math.round(rating * 2) / 2, // 支持半星评分
          comment: comment?.trim() || null,
          updatedAt: new Date(),
        },
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
      });
    } else {
      // 创建新评价
      result = await prisma.merchantRating.create({
        data: {
          merchantId: merchant.id,
          userId: session.user.id,
          rating: Math.round(rating * 2) / 2, // 支持半星评分
          comment: comment?.trim() || null,
        },
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
      });
    }

    // 更新商家的平均评分和总评分数
    const allRatings = await prisma.merchantRating.findMany({
      where: { merchantId: merchant.id },
      select: { rating: true },
    });

    const totalRatings = allRatings.length;
    const averageRating = totalRatings > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    await prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        averageRating,
        totalRatings,
      },
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: existingRating ? "评价已更新" : "评价已提交",
    });
  } catch (error) {
    console.error("提交评论失败:", error);
    return NextResponse.json(
      { error: "提交评论失败" },
      { status: 500 }
    );
  }
}

