# 数据库设计总结

## ✅ 已完成的工作

### 1. 完整的数据库 Schema 设计
位置：`prisma/schema.prisma`

**核心特性：**
- ✅ Better Auth 集成（用户认证系统）
- ✅ 商家系统（用户可切换为商家）
- ✅ 商家评分和评论系统
- ✅ 曝光专区（帖子、图片、评论）
- ✅ 统一的点赞/点踩系统（支持多种目标）
- ✅ 完善的索引优化
- ✅ 统计字段冗余（提升性能）

### 2. 数据模型结构

#### 用户认证（4 个表）
- `User` - 用户基础信息
- `Session` - 会话管理
- `Account` - 第三方账号
- `Verification` - 验证信息

#### 商家系统（2 个表）
- `Merchant` - 商家信息
- `MerchantRating` - 商家评分/评论

#### 曝光专区（3 个表）
- `Post` - 曝光帖子
- `Image` - 帖子图片
- `Comment` - 评论系统

#### 互动系统（1 个表）
- `Reaction` - 统一的点赞/点踩（支持商家、评分、帖子、评论）

**总计：10 个数据模型 + 2 个枚举类型**

### 3. 核心设计亮点

#### 🎯 统一的点赞/点踩系统
使用多态关联设计，一个 `Reaction` 表支持所有点赞/点踩场景：
- 商家点赞/点踩
- 商家评分点赞/点踩
- 帖子点赞/点踩
- 评论点赞/点踩

**优势：**
- 代码复用，逻辑统一
- 通过 unique 约束防止重复操作
- 易于扩展新的反应目标

#### 🚀 性能优化
1. **统计字段冗余**：在关键表中存储计数（likesCount, dislikesCount 等）
2. **索引优化**：为常用查询字段添加索引
3. **级联删除**：合理的 onDelete 策略保证数据一致性

#### 🔐 数据完整性
- unique 约束：防止重复评分、重复反应
- 外键关联：保证数据引用完整性
- 枚举类型：限制字段值的范围

### 4. 用户业务流程

#### 用户成为商家
```
1. 用户注册/登录（User.isMerchant = false）
2. 用户在设置中选择"成为商家"
3. 创建 Merchant 记录
4. 更新 User.isMerchant = true
```

#### 商家评分流程
```
1. 用户对商家进行 1-5 星评分
2. 创建 MerchantRating 记录
3. 更新 Merchant.averageRating 和 totalRatings
4. 其他用户可以对评分点赞/点踩
```

#### 曝光帖子流程
```
1. 用户创建 Post（标题、内容、标签）
2. 上传图片（Image 记录）
3. 其他用户浏览、点赞/点踩
4. 其他用户评论（Comment）
5. 评论也可以被点赞/点踩
```

### 5. 配套文件

#### 📄 DATABASE.md
完整的数据库使用文档，包括：
- 快速开始指南
- 数据库结构说明
- 环境配置
- 命令列表
- 数据模型说明
- 最佳实践
- 常见问题

#### 🌱 seed.ts
数据库初始化脚本，自动创建测试数据：
- 示例用户
- 示例商家
- 示例评分
- 示例曝光帖子
- 示例评论
- 示例点赞记录

#### 📦 package.json
添加了便捷的 npm scripts：
- `npm run db:generate` - 生成 Prisma Client
- `npm run db:migrate` - 创建并应用迁移
- `npm run db:seed` - 初始化测试数据
- `npm run db:studio` - 打开可视化管理工具
- `npm run db:reset` - 重置数据库

## 📋 后续建议

### 短期（必需）
1. **配置环境变量**：创建 `.env` 文件，配置 `DATABASE_URL`
2. **运行迁移**：`npm run db:migrate` 创建数据库表
3. **测试数据**：`npm run db:seed` 初始化示例数据

### 中期（推荐）
1. **实现统计字段更新**：
   - 使用数据库触发器（推荐）
   - 或使用 Prisma Middleware
   - 或使用事务手动更新

2. **实现 API 路由**：
   - 用户认证 API（Better Auth 已提供）
   - 商家管理 API
   - 评分/评论 API
   - 曝光帖子 API
   - 点赞/点踩 API

3. **前端集成**：
   - 更新现有的 mock 数据为真实 API 调用
   - 实现用户登录/注册界面
   - 实现"成为商家"功能
   - 集成所有互动功能

### 长期（可选）
1. **高级功能**：
   - 举报系统
   - 通知系统
   - 用户关注功能
   - 管理员审核功能
   - 搜索功能（使用 PostgreSQL 全文搜索或 Elasticsearch）

2. **性能优化**：
   - 实现缓存层（Redis）
   - 图片 CDN 存储
   - 数据库读写分离
   - 分页优化

3. **安全增强**：
   - 内容审核
   - 频率限制
   - XSS/CSRF 防护
   - 敏感信息过滤

## 🎯 下一步行动

```bash
# 1. 确保 PostgreSQL 已安装并运行

# 2. 配置环境变量
cp .env.example .env  # 如果有模板文件
# 编辑 .env 文件，配置 DATABASE_URL

# 3. 生成 Prisma Client
npm run db:generate

# 4. 创建数据库表
npm run db:migrate

# 5. 初始化测试数据
npm run db:seed

# 6. 打开 Prisma Studio 查看数据
npm run db:studio
```

## 📚 参考资料

- [Prisma 官方文档](https://www.prisma.io/docs)
- [Better Auth 文档](https://www.better-auth.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

---

**设计完成日期**: 2024
**数据库版本**: v1.0
**ORM**: Prisma 6.17.0
