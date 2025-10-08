# 🚀 快速开始

## 一键启动测试登录注册功能

### 步骤 1: 启动数据库

**使用 Prisma Postgres（推荐）**:
```bash
npx prisma dev
```

**或使用传统 PostgreSQL**:
```bash
# 修改 .env 中的 DATABASE_URL 为:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/redblack"

# 然后启动 PostgreSQL 服务
brew services start postgresql  # macOS
# 或
sudo service postgresql start   # Linux
```

### 步骤 2: 运行数据库迁移
```bash
npm run db:migrate
```

### 步骤 3: 启动开发服务器
```bash
npm run dev
```

### 步骤 4: 测试功能

1. 打开 http://localhost:3000
2. 点击右上角"注册"
3. 填写信息并注册
4. 自动登录后查看导航栏的用户信息
5. 点击头像测试下拉菜单
6. 测试退出登录功能

## 📖 详细文档

- **使用指南**: [AUTH_SETUP.md](./AUTH_SETUP.md)
- **实现总结**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **数据库文档**: [DATABASE.md](./DATABASE.md)

## ✨ 核心功能

✅ 用户注册（邮箱 + 密码）  
✅ 用户登录  
✅ 会话管理（7天有效期）  
✅ 用户信息展示  
✅ 退出登录  
✅ 响应式设计  

## 🎯 访问页面

- 首页: http://localhost:3000
- 登录: http://localhost:3000/auth/signin
- 注册: http://localhost:3000/auth/signup

## 💻 技术栈

- **框架**: Next.js 15
- **认证**: Better Auth
- **数据库**: PostgreSQL + Prisma
- **UI**: Tailwind CSS
- **语言**: TypeScript

---

遇到问题？查看 [AUTH_SETUP.md](./AUTH_SETUP.md) 的常见问题部分。
