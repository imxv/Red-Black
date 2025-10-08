import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: merchants });
  } catch (error) {
    console.error("获取商家列表失败:", error);
    return NextResponse.json({ error: "获取商家列表失败" }, { status: 500 });
  }
}
