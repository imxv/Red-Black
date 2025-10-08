# 🔄 恢复 Supabase 项目

## ⚠️ 问题诊断

你的 Supabase 项目很可能处于**暂停状态**。免费的 Supabase 项目在 7 天不活动后会自动暂停。

## 📋 立即操作：恢复项目

### 步骤 1：访问 Supabase Dashboard

点击这个链接：
👉 https://supabase.com/dashboard/project/wifxwnyzzckrlqbzyvxj

### 步骤 2：检查项目状态

在项目页面，你会看到以下之一：

#### 情况 A：项目已暂停
如果看到 **"Project is paused"** 或 **"Inactive"**：

1. 点击 **"Restore project"** 或 **"Resume"** 按钮
2. 等待 1-2 分钟，项目会恢复
3. 状态变为 **"Active"** 后，继续下一步

#### 情况 B：项目已激活
如果项目显示 **"Active"**：
- 那可能是网络问题
- 直接跳到步骤 3

### 步骤 3：项目恢复后运行迁移

回到终端，运行：

```bash
cd "/Users/smz/Code/Red&Black"

# 方法 1: 使用 db push（推荐，更快）
npx prisma db push

# 或者方法 2: 使用 migrate
npx prisma migrate dev --name init
```

### 步骤 4：生成 Prisma Client

```bash
npm run db:generate
```

### 步骤 5：启动开发服务器

```bash
npm run dev
```

### 步骤 6：测试注册登录

1. 访问 http://localhost:3000
2. 点击"注册"
3. 填写信息测试

## ✅ 验证数据库表

在 Supabase Dashboard 中：
1. 左侧菜单选择 **Table Editor**
2. 应该看到所有表：
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

## 🎯 快速命令（项目恢复后执行）

```bash
cd "/Users/smz/Code/Red&Black"
npx prisma db push
npm run dev
```

然后访问 http://localhost:3000

## 💡 防止未来暂停

要保持项目活跃：
1. 定期登录 Dashboard
2. 定期执行数据库查询
3. 或者升级到付费计划（$25/月）

## 🆘 如果还是失败

如果恢复项目后还是无法连接：

1. **检查网络**：
   ```bash
   ping db.wifxwnyzzckrlqbzyvxj.supabase.co
   ```

2. **检查防火墙**：
   确保端口 5432 和 6543 没有被阻止

3. **重新获取连接字符串**：
   在 Supabase Dashboard 的 Settings → Database 中重新复制连接字符串

4. **联系我**：
   把错误信息发给我，我会帮你排查

---

## 📞 现在就做

1. ⬆️ 点击上面的 Supabase 链接
2. 🔄 恢复项目
3. ⌨️ 运行 `npx prisma db push`
4. 🚀 启动 `npm run dev`
5. ✅ 测试注册登录

**项目恢复完成后告诉我，我会继续协助你完成测试！**
