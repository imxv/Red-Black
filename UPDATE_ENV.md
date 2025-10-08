# 🔧 更新 .env 文件指南

## 快速步骤

### 1️⃣ 获取 Supabase 连接字符串

在 Supabase Dashboard 中：
1. 打开你的项目
2. 左侧菜单点击 **Settings** (齿轮图标)
3. 选择 **Database**
4. 找到 **Connection string** 部分
5. 选择 **Connection pooling** 标签
6. 复制 **Transaction** 模式下的连接字符串

### 2️⃣ 更新 .env 文件

打开 `.env` 文件，将 `DATABASE_URL` 替换为你的 Supabase 连接字符串：

**当前配置**：
```env
DATABASE_URL="prisma+postgres://localhost:51216/..."
```

**更新为**（替换为你实际的连接字符串）：
```env
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

### 3️⃣ 完整的 .env 示例

```env
BETTER_AUTH_SECRET=1aswunPwSkKrkEt6OiPS25Kdjsu45Wcg
BETTER_AUTH_URL=http://localhost:3000

# 替换为你的 Supabase 连接字符串
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:YourPassword123@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

## 📝 重要提示

### 密码包含特殊字符？

如果密码包含特殊字符（如 `@`, `#`, `%`, `:` 等），需要 URL 编码：

| 字符 | 编码 |
|------|------|
| @ | %40 |
| # | %23 |
| % | %25 |
| : | %3A |
| / | %2F |
| ? | %3F |

**示例**：
- 原密码: `Pass@word#123`
- 编码后: `Pass%40word%23123`

### 找不到密码？

如果忘记了数据库密码：
1. 在 Supabase Dashboard 的 **Settings** -> **Database**
2. 点击 **Reset database password**
3. 设置新密码并保存
4. 使用新密码更新 .env

## ✅ 验证配置

保存 `.env` 文件后，运行以下命令验证连接：

```bash
# 测试数据库连接
npx prisma db pull
```

如果连接成功，会显示：
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres"...
```

## 🚀 下一步

配置完成后，运行：

```bash
# 1. 运行数据库迁移
npm run db:migrate

# 2. 启动开发服务器
npm run dev

# 3. 访问 http://localhost:3000 测试
```

---

**需要帮助？** 查看 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 获取详细指南。
