export type ExposureImage = {
  id: string;
  url: string; // 远程托管 URL (Freeimage.host)
  caption?: string;
};

export type ExposureComment = {
  id: string;
  userName: string;
  avatarFallback: string;
  comment: string;
  createdAt: string;
  likes: number;
};

export type Exposure = {
  id: string;
  title: string;
  description: string;
  images: ExposureImage[];
  submitter: string;
  submitterAvatar: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  comments: ExposureComment[];
  tags?: string[];
};

// 本地存储键名
const STORAGE_KEY = 'rb_exposures';

// 初始示例数据
const initialExposures: Exposure[] = [
  {
    id: 'exp-1',
    title: '某宠物店售卖病态蜥蜴，态度恶劣拒绝退款',
    description: '在XX宠物店购买的鬃狮蜥到手第二天就出现拒食、精神萎靡的情况，联系店家要求退换，店家态度非常恶劣，说是我自己养的有问题。带去宠物医院检查发现有严重的寄生虫感染，明显是到手之前就已经生病了。现在店家拉黑了我，大家千万别去这家店！',
    images: [],
    submitter: '小王',
    submitterAvatar: '王',
    createdAt: '2024-10-05',
    likes: 234,
    dislikes: 12,
    comments: [
      {
        id: 'comm-1',
        userName: '李明',
        avatarFallback: '李',
        comment: '我也在这家店买过，确实有问题，已经投诉了',
        createdAt: '2024-10-05',
        likes: 45,
      },
    ],
    tags: ['鬃狮蜥', '病态出售', '拒绝退款'],
  },
  {
    id: 'exp-2',
    title: '网购爬宠用品，商家发错货还要我承担运费',
    description: '在某网店购买了UVB灯管，结果发来的是UVA的。联系客服要求换货，客服说可以换但是来回运费要我自己出。明明是他们发错了，凭什么让买家承担损失？而且态度特别差，一直在踢皮球。',
    images: [],
    submitter: 'Amy',
    submitterAvatar: 'A',
    createdAt: '2024-10-06',
    likes: 189,
    dislikes: 8,
    comments: [],
    tags: ['UVB灯', '发错货', '运费纠纷'],
  },
];

// 从 localStorage 加载曝光数据
export function loadExposures(): Exposure[] {
  if (typeof window === 'undefined') {
    return initialExposures;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialExposures;
    }
    // 首次加载，保存初始数据
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialExposures));
    return initialExposures;
  } catch (error) {
    console.error('Failed to load exposures:', error);
    return initialExposures;
  }
}

// 保存曝光数据到 localStorage
export function saveExposures(exposures: Exposure[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exposures));
  } catch (error) {
    console.error('Failed to save exposures:', error);
  }
}

// 添加新的曝光
export function addExposure(exposure: Omit<Exposure, 'id' | 'createdAt' | 'likes' | 'dislikes' | 'comments'>): Exposure {
  const newExposure: Exposure = {
    ...exposure,
    id: `exp-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    likes: 0,
    dislikes: 0,
    comments: [],
  };

  const exposures = loadExposures();
  exposures.unshift(newExposure);
  saveExposures(exposures);

  return newExposure;
}

// 更新曝光（用于点赞等操作）
export function updateExposure(id: string, updates: Partial<Exposure>): void {
  const exposures = loadExposures();
  const index = exposures.findIndex((exp) => exp.id === id);

  if (index !== -1) {
    exposures[index] = { ...exposures[index], ...updates };
    saveExposures(exposures);
  }
}

// 删除曝光
export function deleteExposure(id: string): void {
  const exposures = loadExposures();
  const filtered = exposures.filter((exp) => exp.id !== id);
  saveExposures(filtered);
}

// 添加评论
export function addComment(exposureId: string, comment: Omit<ExposureComment, 'id' | 'createdAt' | 'likes'>): void {
  const exposures = loadExposures();
  const index = exposures.findIndex((exp) => exp.id === exposureId);

  if (index !== -1) {
    const newComment: ExposureComment = {
      ...comment,
      id: `comm-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
    };

    exposures[index].comments.push(newComment);
    saveExposures(exposures);
  }
}
