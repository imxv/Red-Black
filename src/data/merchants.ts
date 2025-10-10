export type MerchantReview = {
  id: string;
  userName: string;
  avatarFallback: string;
  avatarUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes: number;
  replies: number;
};

export type Merchant = {
  slug: string;
  name: string;
  category: string;
  rating: number;
  scoreDelta: number;
  reviews: number;
  likes: number;
  dislikes: number;
  location: string;
  monthlyGrowth: number;
  responseTime: string;
  avatarFallback: string;
  avatarUrl?: string;
  avatarColor: string;
  description: string;
  highlights: string[];
  customerReviews: MerchantReview[];
  userReaction?: string | null;
};

export const merchants: Merchant[] = [
  {
    slug: "chenguang-bookstore",
    name: "晨光书屋",
    category: "精品书店",
    rating: 4.9,
    scoreDelta: 0.2,
    reviews: 1240,
    likes: 987,
    dislikes: 32,
    location: "上海 · 徐汇",
    monthlyGrowth: 18,
    responseTime: "平均响应 1.8 小时",
    avatarFallback: "晨",
    avatarColor: "#2563eb",
    description: "以城市独立出版和艺术书籍见长，特别为爬宠爱好者准备了跨学科的科普读物与饲养指南。",
    highlights: [
      "自主策展的爬宠主题读书会",
      "店内读者社区活跃，常有线下交流",
      "提供稀缺的原版生物学图鉴预订服务",
    ],
    customerReviews: [
      {
        id: "chenguang-1",
        userName: "阿凌",
        avatarFallback: "凌",
        rating: 5,
        comment: "店员不仅懂书还懂爬宠，推荐的资料非常靠谱，帮我避开很多入坑雷区。",
        createdAt: "2024-03-12",
        likes: 128,
        replies: 5,
      },
      {
        id: "chenguang-2",
        userName: "黄粱",
        avatarFallback: "梁",
        rating: 4.5,
        comment: "读书会上遇到很多同好，不过热门书籍需要提前预约，稍稍有些不便。",
        createdAt: "2024-05-02",
        likes: 94,
        replies: 3,
      },
      {
        id: "chenguang-3",
        userName: "Wendy",
        avatarFallback: "W",
        rating: 4.8,
        comment: "环境安静舒适，爬宠专区的图书分类清晰，很适合系统学习。",
        createdAt: "2024-06-18",
        likes: 112,
        replies: 4,
      },
    ],
  },
  {
    slug: "nanlu-coffee-lab",
    name: "南麓咖啡实验室",
    category: "咖啡馆",
    rating: 4.8,
    scoreDelta: 0.3,
    reviews: 980,
    likes: 864,
    dislikes: 28,
    location: "杭州 · 西湖",
    monthlyGrowth: 22,
    responseTime: "平均响应 1.2 小时",
    avatarFallback: "南",
    avatarColor: "#0ea5e9",
    description: "坐落在西湖边的咖啡空间，提供宠物友好座位与专属的爬宠温控休息区。",
    highlights: [
      "周末举办爬宠主题手冲体验课",
      "咖啡吧台设有透明饲养展示柜",
      "合作兽医不定期坐诊解答问题",
    ],
    customerReviews: [
      {
        id: "nanlu-1",
        userName: "Coco",
        avatarFallback: "C",
        rating: 5,
        comment: "咖啡味道稳定，爬宠休息区卫生做得很好，店员提醒事项也很细致。",
        createdAt: "2024-04-06",
        likes: 156,
        replies: 7,
      },
      {
        id: "nanlu-2",
        userName: "木子",
        avatarFallback: "木",
        rating: 4.7,
        comment: "喜欢店里的互动讲座，可惜报名名额有限，经常抢不到。",
        createdAt: "2024-05-27",
        likes: 103,
        replies: 2,
      },
    ],
  },
  {
    slug: "chixia-slow-food",
    name: "赤霞慢食",
    category: "健康轻食",
    rating: 4.7,
    scoreDelta: 0.1,
    reviews: 860,
    likes: 742,
    dislikes: 36,
    location: "成都 · 锦江",
    monthlyGrowth: 16,
    responseTime: "平均响应 2.3 小时",
    avatarFallback: "赤",
    avatarColor: "#f97316",
    description: "主推低油低盐的能量餐盒，并提供适合爬宠饲主的营养搭配建议。",
    highlights: [
      "提供可自选的钙质补充套餐",
      "配送附赠爬宠饲养日历贴纸",
      "在线客服会跟进饲养难点",
    ],
    customerReviews: [
      {
        id: "chixia-1",
        userName: "阿糖",
        avatarFallback: "糖",
        rating: 4.6,
        comment: "菜品口味清爽，不过配送偶尔有延迟，幸好客服回应及时。",
        createdAt: "2024-03-28",
        likes: 87,
        replies: 3,
      },
      {
        id: "chixia-2",
        userName: "Nina",
        avatarFallback: "N",
        rating: 4.9,
        comment: "包材环保且有饲养贴士，真的很走心，已经回购多次。",
        createdAt: "2024-06-01",
        likes: 141,
        replies: 6,
      },
    ],
  },
  {
    slug: "guiyi-tea-house",
    name: "归一茶社",
    category: "茶饮新式",
    rating: 4.6,
    scoreDelta: -0.1,
    reviews: 730,
    likes: 612,
    dislikes: 42,
    location: "广州 · 越秀",
    monthlyGrowth: 12,
    responseTime: "平均响应 3.1 小时",
    avatarFallback: "归",
    avatarColor: "#22d3ee",
    description: "结合岭南茶饮创意，提供放松心情的爬宠主题包间与香薰体验。",
    highlights: [
      "茶艺师会介绍适合不同爬宠的安抚香薰",
      "包间可预约投影联合观影",
      "有专属线下交流群",
    ],
    customerReviews: [
      {
        id: "guiyi-1",
        userName: "西西",
        avatarFallback: "西",
        rating: 4.5,
        comment: "茶味层次丰富，包间舒适，但晚高峰时段服务响应稍慢。",
        createdAt: "2024-04-18",
        likes: 76,
        replies: 2,
      },
      {
        id: "guiyi-2",
        userName: "River",
        avatarFallback: "R",
        rating: 4.7,
        comment: "香薰组合很贴心，宠物也能放松下来，确实有用。",
        createdAt: "2024-06-11",
        likes: 119,
        replies: 5,
      },
    ],
  },
  {
    slug: "beian-dessert",
    name: "北岸甜品铺",
    category: "甜品铺",
    rating: 4.6,
    scoreDelta: 0.2,
    reviews: 690,
    likes: 578,
    dislikes: 25,
    location: "北京 · 朝阳",
    monthlyGrowth: 15,
    responseTime: "平均响应 1.9 小时",
    avatarFallback: "北",
    avatarColor: "#ec4899",
    description: "主打低糖甜品搭配高蛋白小点，满足爬宠饲主对体力与心情的双重需求。",
    highlights: [
      "每月推出爬宠灵感限定甜品",
      "甜品礼盒可附赠营养补剂试用装",
      "店员会根据饲养经验给出饮食建议",
    ],
    customerReviews: [
      {
        id: "beian-1",
        userName: "Joy",
        avatarFallback: "J",
        rating: 4.8,
        comment: "限定款真的很惊喜，预约取餐流程顺畅，包装也很精致。",
        createdAt: "2024-05-08",
        likes: 134,
        replies: 4,
      },
      {
        id: "beian-2",
        userName: "柳柳",
        avatarFallback: "柳",
        rating: 4.4,
        comment: "味道不错，但午后高峰排队时间稍长，希望能增加自助取餐。",
        createdAt: "2024-06-20",
        likes: 92,
        replies: 3,
      },
    ],
  },
  {
    slug: "shihua-florist",
    name: "石花花坊",
    category: "生活方式",
    rating: 4.5,
    scoreDelta: -0.2,
    reviews: 540,
    likes: 498,
    dislikes: 31,
    location: "深圳 · 南山",
    monthlyGrowth: 9,
    responseTime: "平均响应 2.7 小时",
    avatarFallback: "石",
    avatarColor: "#8b5cf6",
    description: "结合自然景观设计理念，提供适合爬宠生活环境的绿植搭配与定制造景服务。",
    highlights: [
      "可上门测量爬宠饲养空间",
      "提供耐湿耐阴的定制植物组合",
      "赠送养护手册与换盆提醒服务",
    ],
    customerReviews: [
      {
        id: "shihua-1",
        userName: "岚岚",
        avatarFallback: "岚",
        rating: 4.6,
        comment: "造景师很专业，空间利用得当，只是等待安排上门的时间稍长。",
        createdAt: "2024-03-30",
        likes: 81,
        replies: 2,
      },
      {
        id: "shihua-2",
        userName: "Ian",
        avatarFallback: "I",
        rating: 4.3,
        comment: "植物状态不错，售后回访也很及时，希望后续能推出维护套餐。",
        createdAt: "2024-06-09",
        likes: 68,
        replies: 1,
      },
    ],
  },
];

export function getMerchantBySlug(slug: string) {
  return merchants.find((merchant) => merchant.slug === slug);
}
