# Supabase 连接问题排查

## 🔍 当前问题

无法连接到 Supabase 数据库的直连端口（5432）。

## 📋 排查步骤

### 步骤 1：检查 Supabase 项目状态

1. 访问 https://supabase.com/dashboard/project/wifxwnyzzckrlqbzyvxj
2. 查看项目状态：
   - 如果显示 **"Paused"** 或 **"Inactive"**，点击 **"Restore project"** 或 **"Resume"**
   - 等待项目恢复（通常需要 1-2 分钟）

### 步骤 2：使用 Prisma Push（推荐替代方案）

如果迁移继续失败，我们可以使用 `prisma db push` 代替：

```bash
cd "/Users/smz/Code/Red&Black"
npx prisma db push
```

**优点**：
- ✅ 不需要创建迁移文件
- ✅ 直接同步 schema 到数据库
- ✅ 适合开发环境

**缺点**：
- ⚠️ 不会生成迁移历史
- ⚠️ 生产环境应该用 migrate

### 步骤 3：验证连接字符串

确认你的连接字符串格式正确：

**Transaction mode（应用运行时使用）**：
```
postgresql://postgres.wifxwnyzzckrlqbzyvxj:aY7TMy60vbrIJNvn@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**Direct connection（迁移使用）**：
```
postgresql://postgres.wifxwnyzzckrlqbzyvxj:aY7TMy60vbrIJNvn@db.wifxwnyzzckrlqbzyvxj.supabase.co:5432/postgres
```

## 🔧 解决方案

### 方案 A：使用 Prisma Push（最快）

```bash
# 1. 直接同步 schema
npx prisma db push

# 2. 生成 Prisma Client
npm run db:generate

# 3. 启动应用测试
npm run dev
```

### 方案 B：启用 Supabase IPv4

有时 IPv6 连接有问题，尝试在连接字符串中添加参数：

更新 `.env` 中的 `DIRECT_DATABASE_URL`：
```env
DIRECT_DATABASE_URL="postgresql://postgres.wifxwnyzzckrlqbzyvxj:aY7TMy60vbrIJNvn@db.wifxwnyzzckrlqbzyvxj.supabase.co:5432/postgres?connect_timeout=30"
```

然后重试：
```bash
npx prisma migrate dev --name init
```

### 方案 C：仅使用 Pooler 连接

如果直连一直有问题，可以仅使用 pooler 连接：

1. 删除 `.env` 中的 `DIRECT_DATABASE_URL`
2. 从 `prisma/schema.prisma` 中删除 `directUrl` 行
3. 使用 push：
```bash
npx prisma db push
```

## ✅ 推荐操作

**现在立即执行**：

```bash
cd "/Users/smz/Code/Red&Black"

# 使用 push 创建表（跳过迁移文件）
npx prisma db push

# 启动开发服务器
npm run dev
```

然后访问 http://localhost:3000 测试注册登录！

## 📊 验证数据库表

成功后，在 Supabase Dashboard 中：
1. 进入 **Table Editor**
2. 应该看到所有表已创建：
   - User
   - Session
   - Account
   - Merchant
   - Post
   - Comment
   - Reaction
   - 等等

## 💡 为什么选择 Push？

对于开发环境：
- ✅ 更快、更简单
- ✅ 不需要管理迁移文件
- ✅ Supabase Connection Pooling 友好

对于生产环境：
- 使用 `prisma migrate deploy`
- 需要先在开发环境生成迁移文件
