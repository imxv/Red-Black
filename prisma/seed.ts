import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始初始化数据库...');

  // 1. 创建测试用户
  const user1 = await prisma.user.upsert({
    where: { email: 'merchant1@example.com' },
    update: {},
    create: {
      email: 'merchant1@example.com',
      name: '晨光书屋',
      isMerchant: true,
      emailVerified: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      name: '小王',
      isMerchant: false,
      emailVerified: true,
    },
  });

  console.log('✅ 创建用户完成');

  // 2. 创建商家
  const merchant1 = await prisma.merchant.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      slug: 'chenguang-bookstore',
      displayName: '晨光书屋',
      category: '精品书店',
      location: '上海 · 徐汇',
      description: '以城市独立出版和艺术书籍见长，特别为爬宠爱好者准备了跨学科的科普读物与饲养指南。',
      avatarColor: '#2563eb',
      responseTime: '平均响应 1.8 小时',
      highlights: [
        '自主策展的爬宠主题读书会',
        '店内读者社区活跃，常有线下交流',
        '提供稀缺的原版生物学图鉴预订服务',
      ],
      averageRating: 4.9,
      totalRatings: 0,
      likesCount: 987,
      dislikesCount: 32,
    },
  });

  console.log('✅ 创建商家完成');

  // 3. 创建商家评分
  const rating1 = await prisma.merchantRating.upsert({
    where: {
      merchantId_userId: {
        merchantId: merchant1.id,
        userId: user2.id,
      },
    },
    update: {},
    create: {
      merchantId: merchant1.id,
      userId: user2.id,
      rating: 5,
      comment: '店员不仅懂书还懂爬宠，推荐的资料非常靠谱，帮我避开很多入坑雷区。',
      likesCount: 45,
      dislikesCount: 2,
    },
  });

  console.log('✅ 创建评分完成');

  // 4. 创建曝光帖子
  const post1 = await prisma.post.create({
    data: {
      userId: user2.id,
      title: '某宠物店售卖病态蜥蜴，态度恶劣拒绝退款',
      content:
        '在XX宠物店购买的鬃狮蜥到手第二天就出现拒食、精神萎靡的情况，联系店家要求退换，店家态度非常恶劣，说是我自己养的有问题。带去宠物医院检查发现有严重的寄生虫感染，明显是到手之前就已经生病了。现在店家拉黑了我，大家千万别去这家店！',
      tags: ['鬃狮蜥', '病态出售', '拒绝退款'],
      likesCount: 234,
      dislikesCount: 12,
      commentsCount: 1,
      viewsCount: 1500,
    },
  });

  console.log('✅ 创建帖子完成');

  // 5. 创建评论
  const comment1 = await prisma.comment.create({
    data: {
      userId: user1.id,
      content: '我也在这家店买过，确实有问题，已经投诉了',
      targetType: 'POST',
      postId: post1.id,
      likesCount: 45,
      dislikesCount: 0,
    },
  });

  console.log('✅ 创建评论完成');

  // 6. 创建点赞记录
  await prisma.reaction.create({
    data: {
      userId: user2.id,
      type: 'LIKE',
      targetType: 'MERCHANT',
      merchantId: merchant1.id,
    },
  });

  await prisma.reaction.create({
    data: {
      userId: user1.id,
      type: 'LIKE',
      targetType: 'POST',
      postId: post1.id,
    },
  });

  console.log('✅ 创建点赞记录完成');

  console.log('🎉 数据库初始化完成！');
  console.log('\n📊 数据摘要:');
  console.log(`- 用户数: ${await prisma.user.count()}`);
  console.log(`- 商家数: ${await prisma.merchant.count()}`);
  console.log(`- 评分数: ${await prisma.merchantRating.count()}`);
  console.log(`- 帖子数: ${await prisma.post.count()}`);
  console.log(`- 评论数: ${await prisma.comment.count()}`);
  console.log(`- 点赞数: ${await prisma.reaction.count()}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 初始化失败:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
