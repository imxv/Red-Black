# 数据库使用指南

## 🚀 快速开始

首次使用数据库，请按以下步骤操作：

1. **配置数据库连接**：创建 `.env` 文件并配置 `DATABASE_URL`
2. **生成 Prisma Client**：`npm run db:generate`
3. **创建数据库表**：`npm run db:migrate`
4. **初始化测试数据**：`npm run db:seed`（可选）
5. **查看数据**：`npm run db:studio`

详细说明请继续阅读下方文档。

---

## 数据库结构概览

本项目使用 PostgreSQL 数据库 + Prisma ORM，数据库包含以下核心功能模块：

### 1. 用户认证系统（Better Auth）
- **User**: 用户基础信息
- **Session**: 用户会话管理
- **Account**: 第三方账号关联
- **Verification**: 邮箱验证等验证信息

### 2. 商家系统
- **Merchant**: 商家信息表
- **MerchantRating**: 商家评分和评论

### 3. 曝光专区
- **Post**: 曝光帖子
- **Image**: 帖子图片
- **Comment**: 评论系统

### 4. 互动系统
- **Reaction**: 统一的点赞/点踩系统（支持商家、评分、帖子、评论）

## 环境配置

### 1. 配置数据库连接

在项目根目录创建 `.env` 文件（如果还没有），添加以下内容：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
```

示例（本地开发）：
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/redblack?schema=public"
```

### 2. 快速开始（推荐使用 npm scripts）

```bash
# 1. 生成 Prisma Client
npm run db:generate

# 2. 创建并应用数据库迁移
npm run db:migrate

# 3. 初始化测试数据（可选）
npm run db:seed

# 4. 打开 Prisma Studio 可视化管理数据
npm run db:studio
```

### 3. 完整命令列表

#### NPM Scripts（推荐）

| 命令 | 说明 |
|------|------|
| `npm run db:generate` | 生成 Prisma Client |
| `npm run db:migrate` | 创建并应用迁移（开发环境） |
| `npm run db:migrate:prod` | 应用迁移到生产环境 |
| `npm run db:studio` | 打开 Prisma Studio |
| `npm run db:seed` | 运行 seed 脚本初始化数据 |
| `npm run db:reset` | 重置数据库（⚠️ 会清空所有数据） |

#### 原生 Prisma 命令

```bash
# 生成 Prisma Client（修改 schema 后需要运行）
npx prisma generate

# 创建迁移文件并应用到数据库
npx prisma migrate dev --name descriptive_name

# 查看当前迁移状态
npx prisma migrate status

# 应用所有待处理的迁移（生产环境）
npx prisma migrate deploy

# 打开 Prisma Studio 可视化管理数据
npx prisma studio

# 格式化 schema 文件
npx prisma format

# 验证 schema 文件
npx prisma validate

# 重置数据库（清空所有数据并重新应用迁移）⚠️ 危险操作
npx prisma migrate reset
```

## 数据模型说明

### 用户成为商家的流程

1. 用户注册登录后，`User.isMerchant = false`
2. 用户在设置中选择"成为商家"
3. 创建一条 `Merchant` 记录，关联到该用户
4. 更新 `User.isMerchant = true`

### 点赞/点踩系统

使用 `Reaction` 表统一管理所有点赞/点踩：

```typescript
// 示例：用户给商家点赞
{
  userId: "user_xxx",
  type: "LIKE",
  targetType: "MERCHANT",
  merchantId: "merchant_xxx"
}

// 示例：用户给帖子点踩
{
  userId: "user_xxx",
  type: "DISLIKE",
  targetType: "POST",
  postId: "post_xxx"
}
```

**特点：**
- 通过 unique 约束确保用户对同一目标只能有一个反应
- 支持切换反应（修改 type 字段）
- 多态设计，易于扩展新的反应目标

### 统计字段更新策略

为了性能考虑，关键表中包含冗余的统计字段（如 `likesCount`, `dislikesCount` 等）：

**推荐更新方式：**

1. **使用数据库触发器**（推荐）- 自动更新统计
2. **使用 Prisma Middleware** - 在应用层拦截更新
3. **使用事务** - 手动更新统计字段

示例（使用事务）：
```typescript
await prisma.$transaction([
  // 创建点赞记录
  prisma.reaction.create({
    data: {
      userId,
      type: "LIKE",
      targetType: "POST",
      postId
    }
  }),
  // 更新帖子的点赞数
  prisma.post.update({
    where: { id: postId },
    data: { likesCount: { increment: 1 } }
  })
])
```

## 数据库索引

Schema 中已经为常用查询添加了索引：

- 商家按评分排序：`@@index([averageRating(sort: Desc)])`
- 帖子按时间排序：`@@index([createdAt(sort: Desc)])`
- 外键索引：自动为所有关联字段创建

## 最佳实践

1. **每次修改 schema 后**：
   ```bash
   npx prisma migrate dev --name descriptive_name
   npx prisma generate
   ```

2. **定期备份生产数据库**

3. **使用 Prisma Studio 进行数据查看和调试**：
   ```bash
   npx prisma studio
   ```

4. **在 seed 文件中初始化测试数据**（可选）：
   创建 `prisma/seed.ts` 文件用于初始化数据

## 常见问题

### Q: 如何回滚迁移？

```bash
# 查看迁移历史
npx prisma migrate status

# 回滚到特定迁移（需要手动删除后续迁移文件）
# Prisma 不支持自动回滚，需要手动处理
```

### Q: 本地开发数据库和远程数据库如何隔离？

使用不同的 `.env` 文件：
- `.env.local` - 本地开发
- `.env.production` - 生产环境

### Q: 如何查看生成的 SQL？

```bash
npx prisma migrate dev --create-only --name migration_name
# 这会创建迁移文件但不应用，可以查看生成的 SQL
```

## 下一步

1. 运行 `npx prisma migrate dev --name init` 创建数据库表
2. 使用 `npx prisma studio` 查看数据库
3. 开始开发业务逻辑！

---

**注意**: 首次运行迁移前，请确保 PostgreSQL 数据库已启动，并且 `.env` 文件中的 `DATABASE_URL` 配置正确。
