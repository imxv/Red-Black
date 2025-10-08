# 如何查看注册的用户

## 🎯 快速回答

你的用户数据**确实在数据库中**，只是不在 Supabase 的 Authentication 页面，因为我们使用的是 Better Auth，而不是 Supabase Auth。

## 📍 你的用户在哪里？

### ✅ 正确位置：Table Editor

1. 访问 Supabase Dashboard：
   👉 https://supabase.com/dashboard/project/wifxwnyzzckrlqbzyvxj

2. 点击左侧菜单的 **Table Editor**

3. 在表列表中选择 **User** 表

4. 你会看到所有注册的用户，包括：
   - id
   - email
   - name
   - isMerchant
   - createdAt
   - 等等...

### ❌ 错误位置：Authentication

**Authentication 页面是空的**是正常的！

因为：
- Authentication 是 Supabase 的内置认证服务
- 我们使用的是 Better Auth（独立的认证系统）
- Better Auth 把用户存在 `public.User` 表
- Supabase Auth 把用户存在 `auth.users` 表（我们没有使用）

## 🔍 查看用户的 3 种方法

### 方法 1：Supabase Table Editor（推荐）

**优点**：在线查看，方便快捷

**步骤**：
1. Supabase Dashboard → Table Editor
2. 选择 `User` 表
3. 查看所有字段和数据

**可以做什么**：
- ✅ 查看用户列表
- ✅ 搜索用户
- ✅ 编辑用户数据
- ✅ 删除用户
- ✅ 查看关联数据（Session、Merchant 等）

### 方法 2：Prisma Studio（功能最强）

**优点**：本地运行，功能强大，可视化关系

**启动命令**：
```bash
npm run db:studio
```

**自动打开** http://localhost:5555

**可以做什么**：
- ✅ 查看所有表
- ✅ 可视化表关系
- ✅ 快速编辑数据
- ✅ 执行复杂查询
- ✅ 导出数据

### 方法 3：SQL Editor

**优点**：灵活强大，可以写复杂查询

**步骤**：
1. Supabase Dashboard → SQL Editor
2. 新建查询
3. 运行 SQL：

```sql
-- 查看所有用户
SELECT * FROM "User";

-- 查看用户详细信息（包括会话）
SELECT 
  u.id,
  u.email,
  u.name,
  u."isMerchant",
  u."createdAt",
  COUNT(s.id) as session_count
FROM "User" u
LEFT JOIN "Session" s ON s."userId" = u.id
GROUP BY u.id;

-- 查看最近注册的用户
SELECT * FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- 查看商家用户
SELECT * FROM "User" 
WHERE "isMerchant" = true;
```

## 📊 数据表对照

### 我们的表（Better Auth）
```
public.User          ← 你的用户在这里！
public.Session       ← 登录会话
public.Account       ← 账号信息（密码）
public.Verification  ← 验证记录
```

### Supabase Auth 的表（我们没用）
```
auth.users           ← 空的
auth.sessions        ← 空的
auth.identities      ← 空的
```

## 🎨 Prisma Studio 截图指南

启动 `npm run db:studio` 后，你会看到：

**左侧面板**：
- User（点击查看所有用户）
- Session
- Account
- Merchant
- Post
- Comment
- Reaction
- 等等...

**中间面板**：
- 用户列表（可以滚动、搜索、排序）
- 每一行是一个用户

**右侧面板**：
- 点击用户查看详细信息
- 可以编辑字段
- 可以查看关联数据

## 💡 为什么这样设计？

### Better Auth 的优势

1. **完全控制**
   - 用户表在你的 schema 中
   - 可以自由扩展字段
   - 可以自定义关系

2. **业务灵活性**
   - 添加 `isMerchant` 字段
   - 与 Merchant 表关联
   - 与 Post、Comment 等关联

3. **数据可见性**
   - 所有数据都在 `public` schema
   - 可以用任何工具查看
   - 不依赖特定服务

### 如果用 Supabase Auth

❌ 用户表结构固定，难以扩展  
❌ 需要额外的表来存储业务字段  
❌ 数据在 `auth` schema，不易访问  
❌ 依赖 Supabase，难以迁移  

## ✅ 总结

**你的用户数据完全正常！**

- ✅ 用户在 `public.User` 表中
- ✅ 可以通过 Table Editor 查看
- ✅ 可以通过 Prisma Studio 管理
- ✅ Authentication 页面空的是正常的

**推荐使用 Prisma Studio**，功能最强大：
```bash
npm run db:studio
```

---

**有疑问？** 查看 [BETTER_AUTH_VS_SUPABASE_AUTH.md](./BETTER_AUTH_VS_SUPABASE_AUTH.md) 了解两个系统的详细对比。
