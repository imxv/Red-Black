# Supabase 数据库配置指南

## 📋 步骤一：获取 Supabase 连接字符串

### 1. 登录 Supabase
访问 https://supabase.com/dashboard 并登录你的账户

### 2. 选择或创建项目
- 如果已有项目，选择你要使用的项目
- 如果没有项目，点击 "New Project" 创建新项目

### 3. 获取数据库连接信息

在项目页面：
1. 点击左侧菜单的 **Settings** (齿轮图标)
2. 选择 **Database**
3. 在 "Connection string" 部分，找到 **Connection pooling** 下的 **Transaction mode**
4. 复制显示的连接字符串

连接字符串格式类似：
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**重要提示**：
- `[password]` 需要替换为你的数据库密码（创建项目时设置的）
- 如果忘记密码，可以在同一页面重置

### 4. 推荐使用 Connection Pooling

Supabase 提供两种连接模式：

**Transaction mode（推荐）**：
- 端口：`6543`
- 适合 Prisma 和频繁的短连接
- **这是我们要使用的**

**Session mode**：
- 端口：`5432`
- 适合长连接
- 不推荐用于 Prisma

## 🔧 步骤二：配置项目

### 1. 更新 .env 文件

将 `.env` 文件中的 `DATABASE_URL` 替换为你的 Supabase 连接字符串：

```env
BETTER_AUTH_SECRET=1aswunPwSkKrkEt6OiPS25Kdjsu45Wcg
BETTER_AUTH_URL=http://localhost:3000

# Supabase Database URL
DATABASE_URL="postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

**示例**（替换为你的实际信息）：
```env
DATABASE_URL="postgresql://postgres.abcdefghijk:MySecretPassword123@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

### 2. 添加直连 URL（可选但推荐）

对于某些 Prisma 操作（如迁移），可能需要直连 URL。在 `.env` 中添加：

```env
# 用于 Prisma 迁移的直连 URL（端口 5432）
DIRECT_DATABASE_URL="postgresql://postgres.[your-project-ref]:[your-password]@db.[your-project-ref].supabase.co:5432/postgres"
```

### 3. 更新 Prisma Schema（可选）

如果需要使用直连 URL 进行迁移，更新 `prisma/schema.prisma`：

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")  // 添加这行
}
```

## 🚀 步骤三：运行迁移

现在可以运行数据库迁移了：

```bash
# 1. 生成 Prisma Client
npm run db:generate

# 2. 创建数据库表
npm run db:migrate

# 3. (可选) 初始化测试数据
npm run db:seed
```

## ✅ 步骤四：测试连接

### 测试方法 1：使用 Prisma Studio

```bash
npm run db:studio
```

这会打开 Prisma Studio，你应该能看到所有创建的表。

### 测试方法 2：启动应用

```bash
npm run dev
```

访问 http://localhost:3000，测试注册登录功能。

## 🔍 常见问题

### Q1: "Can't reach database server" 错误

**可能原因**：
1. 密码错误 - 检查连接字符串中的密码是否正确
2. 项目暂停 - Supabase 免费项目如果长期不用会暂停，在 Dashboard 中重启
3. 网络问题 - 检查网络连接

**解决方法**：
```bash
# 测试连接
npx prisma db pull
```

### Q2: "SSL connection required" 错误

Supabase 需要 SSL 连接。确保连接字符串中包含 SSL 参数。

如果出现 SSL 问题，尝试添加参数：
```env
DATABASE_URL="postgresql://...?sslmode=require"
```

### Q3: 迁移超时

如果使用 Connection Pooling 运行迁移超时，使用直连 URL：

```bash
# 临时使用直连 URL
DATABASE_URL="postgresql://postgres.[ref]:[pass]@db.[ref].supabase.co:5432/postgres" npx prisma migrate dev
```

或在 `schema.prisma` 中配置 `directUrl`（已在步骤二中说明）。

### Q4: 查看数据库表

除了 Prisma Studio，还可以：
1. 在 Supabase Dashboard 的 **Table Editor** 中查看
2. 在 Supabase Dashboard 的 **SQL Editor** 中执行 SQL

## 📊 验证迁移成功

在 Supabase Dashboard 中：
1. 进入 **Table Editor**
2. 应该看到以下表：
   - User
   - Session
   - Account
   - Verification
   - Merchant
   - MerchantRating
   - Post
   - Image
   - Comment
   - Reaction

## 🎯 下一步

配置完成后：
1. 访问 http://localhost:3000
2. 测试注册新用户
3. 测试登录功能
4. 在 Supabase Dashboard 的 Table Editor 中查看创建的用户数据

## 💡 Supabase 优势

- ✅ 免费额度充足（500MB 数据库）
- ✅ 自动备份
- ✅ 实时数据库
- ✅ 内置 Auth（虽然我们用的是 Better Auth）
- ✅ 全球 CDN
- ✅ 可视化管理界面

## 📚 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Prisma + Supabase 指南](https://www.prisma.io/docs/guides/database/supabase)
- [Better Auth 文档](https://www.better-auth.com/docs)

---

**提示**：Supabase 免费项目在 7 天不活动后会暂停，访问 Dashboard 即可重启。
