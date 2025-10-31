import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

// POST /api/posts/[postId]/reactions - 点赞/点踩帖子
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { postId } = await params;
    const userId = session.user.id;
    const body = await request.json();
    const { type } = body; // "LIKE" 或 "DISLIKE"

    // 验证反应类型
    if (!type || !["LIKE", "DISLIKE"].includes(type)) {
      return NextResponse.json({ error: "无效的反应类型" }, { status: 400 });
    }

    // 验证帖子是否存在
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // 查找已存在的反应
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_targetType_postId: {
          userId,
          targetType: "POST",
          postId,
        },
      },
    });

    if (existingReaction) {
      // 如果是同样的反应，则删除（取消点赞/点踩）
      if (existingReaction.type === type) {
        await prisma.reaction.delete({ where: { id: existingReaction.id } });

        // 更新计数
        const updateData = type === "LIKE"
          ? { likesCount: { decrement: 1 } }
          : { dislikesCount: { decrement: 1 } };

        await prisma.post.update({
          where: { id: postId },
          data: updateData,
        });

        return NextResponse.json({
          success: true,
          data: { type: null },
          message: "已取消"
        });
      } else {
        // 如果是不同的反应，则更新
        await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type },
        });

        // 更新计数（原来的-1，新的+1）
        const updateData = type === "LIKE"
          ? { likesCount: { increment: 1 }, dislikesCount: { decrement: 1 } }
          : { likesCount: { decrement: 1 }, dislikesCount: { increment: 1 } };

        await prisma.post.update({
          where: { id: postId },
          data: updateData,
        });

        return NextResponse.json({
          success: true,
          data: { type },
          message: type === "LIKE" ? "已点赞" : "已点踩"
        });
      }
    } else {
      // 创建新反应
      await prisma.reaction.create({
        data: {
          userId,
          type,
          targetType: "POST",
          postId,
        },
      });

      // 更新计数
      const updateData = type === "LIKE"
        ? { likesCount: { increment: 1 } }
        : { dislikesCount: { increment: 1 } };

      await prisma.post.update({
        where: { id: postId },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        data: { type },
        message: type === "LIKE" ? "已点赞" : "已点踩"
      });
    }
  } catch (error) {
    console.error("处理反应失败:", error);
    return NextResponse.json({ error: "操作失败，请稍后重试" }, { status: 500 });
  }
}

// GET /api/posts/[postId]/reactions - 获取当前用户对帖子的反应
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: true, data: null });
    }

    const { postId } = await params;
    const userId = session.user.id;

    const reaction = await prisma.reaction.findUnique({
      where: {
        userId_targetType_postId: {
          userId,
          targetType: "POST",
          postId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: reaction ? { type: reaction.type } : null,
    });
  } catch (error) {
    console.error("获取反应失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
