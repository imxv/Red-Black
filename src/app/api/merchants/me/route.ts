import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ isAuthenticated: false, isMerchant: false }, { status: 200 });
    }

    const [user, merchant] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id }, select: { isMerchant: true } }),
      prisma.merchant.findUnique({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      isAuthenticated: true,
      isMerchant: !!user?.isMerchant,
      merchant,
    });
  } catch (error) {
    console.error("/api/merchants/me ", error);
    return NextResponse.json({ error: "获取商家状态失败" }, { status: 500 });
  }
}

