import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

// POST /api/posts - 创建曝光帖子
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { title, content, tags, images } = body;

    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 });
    }

    if (title.trim().length < 3) {
      return NextResponse.json({ error: "标题至少3个字符" }, { status: 400 });
    }

    if (content.trim().length < 15) {
      return NextResponse.json({ error: "描述至少15个字符" }, { status: 400 });
    }

    // 创建帖子
    const post = await prisma.post.create({
      data: {
        userId,
        title: title.trim(),
        content: content.trim(),
        tags: Array.isArray(tags) ? tags : [],
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

    // 如果有图片，创建图片记录
    if (Array.isArray(images) && images.length > 0) {
      await prisma.image.createMany({
        data: images.map((url: string, index: number) => ({
          postId: post.id,
          url,
          order: index,
        })),
      });
    }

    // 重新查询以包含图片
    const postWithImages = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: postWithImages,
      message: "曝光帖子发布成功"
    });
  } catch (error) {
    console.error("创建曝光帖子失败:", error);
    return NextResponse.json({ error: "发布失败，请稍后重试" }, { status: 500 });
  }
}

// GET /api/posts - 获取曝光帖子列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
          images: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      prisma.post.count(),
    ]);

    // 转换数据格式以匹配前端期望
    const formattedPosts = posts.map(post => ({
      ...post,
      commentsCount: post._count.comments,
    }));

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取曝光帖子列表失败:", error);
    return NextResponse.json({ error: "获取列表失败" }, { status: 500 });
  }
}
