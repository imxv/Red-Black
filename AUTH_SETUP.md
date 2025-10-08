# 用户登录注册功能使用指南

## ✅ 已完成的功能

1. **Better Auth 集成**
   - 邮箱密码认证
   - 会话管理（7天有效期）
   - 安全的密码存储

2. **完整的 UI 页面**
   - 登录页面：`/auth/signin`
   - 注册页面：`/auth/signup`
   - 导航栏（显示用户状态、登录/注册/退出）

3. **API 路由**
   - 所有认证 API：`/api/auth/*`
   - 自动处理登录、注册、退出等请求

## 🚀 快速开始

### 1. 启动数据库

根据你的 `.env` 文件配置，你正在使用 Prisma Postgres。

**选项 A：使用 Prisma Postgres（推荐用于本地开发）**
```bash
# 启动本地 Prisma Postgres 服务器
npx prisma dev
```

**选项 B：使用传统 PostgreSQL**

如果你想使用传统的 PostgreSQL，修改 `.env` 文件：
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

例如（使用默认的本地 PostgreSQL）：
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/redblack"
```

然后确保 PostgreSQL 服务正在运行。

### 2. 运行数据库迁移

```bash
npm run db:migrate
```

这将创建所有必需的数据库表。

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 测试登录注册功能

1. 打开浏览器访问 http://localhost:3000
2. 点击右上角的"注册"按钮
3. 填写注册信息（邮箱、密码、用户名）
4. 注册成功后会自动登录并跳转到首页
5. 在导航栏可以看到用户信息和退出按钮

## 📁 项目文件结构

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts          # Better Auth API 路由
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx             # 登录页面
│   │   └── signup/
│   │       └── page.tsx             # 注册页面
│   └── page.tsx                      # 首页（已集成导航栏）
├── components/
│   ├── navbar.tsx                    # 导航栏组件
│   └── ui/
│       ├── button.tsx                # Button 组件
│       ├── input.tsx                 # Input 组件
│       └── label.tsx                 # Label 组件
└── lib/
    ├── auth.ts                       # Better Auth 服务端配置
    └── auth-client.ts                # Better Auth 客户端配置
```

## 🎨 功能特性

### 登录页面（/auth/signin）
- 邮箱密码登录
- 错误提示
- 跳转到注册页面
- 返回首页链接

### 注册页面（/auth/signup）
- 邮箱密码注册
- 用户名设置
- 密码确认
- 密码长度验证（最少6位）
- 注册成功自动登录

### 导航栏
- 未登录状态：显示"登录"和"注册"按钮
- 已登录状态：
  - 显示用户名和头像
  - 下拉菜单（个人设置、退出登录）
  - 响应式设计（移动端适配）

## 🔧 配置说明

### Better Auth 配置 (src/lib/auth.ts)

```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // 开发环境禁用邮箱验证
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 天
    updateAge: 60 * 60 * 24, // 1 天
  },
  trustedOrigins: ["http://localhost:3000"],
});
```

### 环境变量 (.env)

必需的环境变量：
```env
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=your_database_url_here
```

## 📝 使用示例

### 在组件中使用认证

```typescript
import { useSession, authClient } from "@/lib/auth-client";

function MyComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>加载中...</div>;
  }

  if (session?.user) {
    return <div>欢迎，{session.user.name}！</div>;
  }

  return <div>请先登录</div>;
}
```

### 编程式登录

```typescript
import { authClient } from "@/lib/auth-client";

async function handleLogin() {
  const result = await authClient.signIn.email({
    email: "user@example.com",
    password: "password123",
  });

  if (result.error) {
    console.error("登录失败:", result.error);
  } else {
    console.log("登录成功！");
  }
}
```

### 编程式注册

```typescript
import { authClient } from "@/lib/auth-client";

async function handleSignup() {
  const result = await authClient.signUp.email({
    email: "user@example.com",
    password: "password123",
    name: "用户名",
  });

  if (result.error) {
    console.error("注册失败:", result.error);
  } else {
    console.log("注册成功！");
  }
}
```

### 退出登录

```typescript
import { authClient } from "@/lib/auth-client";

async function handleSignout() {
  await authClient.signOut();
  router.push("/");
}
```

## 🐛 常见问题

### Q: 数据库连接失败？
**A**: 检查以下几点：
1. 数据库服务是否正在运行
2. `.env` 文件中的 `DATABASE_URL` 是否正确
3. 数据库凭证是否正确

### Q: 登录后页面不刷新？
**A**: 确保在登录成功后调用了 `router.refresh()`：
```typescript
router.push("/");
router.refresh();
```

### Q: 如何修改会话过期时间？
**A**: 在 `src/lib/auth.ts` 中修改 `session.expiresIn` 配置：
```typescript
session: {
  expiresIn: 60 * 60 * 24 * 30, // 30 天
}
```

### Q: 如何启用邮箱验证？
**A**: 在 `src/lib/auth.ts` 中设置：
```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
}
```
并配置邮件发送服务（需要额外配置 SMTP）。

### Q: 如何自定义登录页面样式？
**A**: 直接编辑 `src/app/auth/signin/page.tsx` 和 `src/app/auth/signup/page.tsx` 文件。

## 🎯 下一步

1. **添加社交登录**（Google, GitHub 等）
2. **添加邮箱验证功能**
3. **添加忘记密码功能**
4. **添加用户个人设置页面**
5. **添加用户权限管理（普通用户/商家）**

## 📚 参考文档

- [Better Auth 官方文档](https://www.better-auth.com/docs)
- [Next.js 认证最佳实践](https://nextjs.org/docs/authentication)
- [Prisma 文档](https://www.prisma.io/docs)

---

**提示**: 开发环境下已禁用邮箱验证，可以直接注册登录测试。生产环境建议启用邮箱验证以提升安全性。
