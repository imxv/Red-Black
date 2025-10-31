import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

// POST /api/posts/[postId]/comments - 提交评论
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
    const { content } = body;

    // 验证评论内容
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "评论内容不能为空" }, { status: 400 });
    }

    if (content.trim().length < 1) {
      return NextResponse.json({ error: "评论内容不能为空" }, { status: 400 });
    }

    if (content.trim().length > 1000) {
      return NextResponse.json({ error: "评论内容不能超过1000字符" }, { status: 400 });
    }

    // 验证帖子是否存在
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        userId,
        postId,
        content: content.trim(),
        targetType: "POST",
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

    // 更新帖子的评论计数
    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: comment,
      message: "评论发布成功"
    });
  } catch (error) {
    console.error("创建评论失败:", error);
    return NextResponse.json({ error: "评论失败，请稍后重试" }, { status: 500 });
  }
}

// GET /api/posts/[postId]/comments - 获取评论列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // 验证帖子是否存在
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId, targetType: "POST" },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.comment.count({
        where: { postId, targetType: "POST" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取评论列表失败:", error);
    return NextResponse.json({ error: "获取评论失败" }, { status: 500 });
  }
}
