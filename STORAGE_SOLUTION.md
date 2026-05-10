# 云端存储解决方案

## 📋 方案对比

我理解您的需求了！您想要数据真正保存到云端，而不仅仅是浏览器的 localStorage。

### 方案 1: GitHub Gist（当前默认）

**优点：**
- ✅ 简单易用，无需额外配置
- ✅ 完全免费
- ✅ 自动版本控制
- ✅ 支持私密 Gist

**缺点：**
- ❌ 文件大小限制（100MB）
- ❌ API 调用限制（5000次/小时）
- ❌ 访问速度一般

**适用场景：**
- 个人使用
- 数据量小（< 10MB）
- 不频繁更新

---

### 方案 2: Cloudflare R2（推荐）

**优点：**
- ✅ 免费额度大（10GB + 1000万次读取/月）
- ✅ 无出口流量费用
- ✅ 全球 CDN 加速
- ✅ 高性能低延迟
- ✅ S3 兼容 API

**缺点：**
- ❌ 需要部署 Cloudflare Worker
- ❌ 配置稍复杂

**适用场景：**
- 专业使用
- 数据量大
- 需要高性能
- 频繁读写

---

### 方案 3: GitHub Repository（不推荐）

**为什么不推荐：**
- ❌ 每次保存都会创建 commit
- ❌ 污染 Git 历史
- ❌ 不适合频繁更新的数据
- ❌ 仓库会变得很大很乱

**示例：**
```
repo/
  data/
    announcements.json  ← 每次修改都会 commit
    positions.json      ← 100 次修改 = 100 个 commits
    userProfile.json    ← Git 历史变得很乱
```

---

## 🎯 推荐方案

### 对于您的需求，我推荐：

**Cloudflare R2 + Worker**

原因：
1. ✅ 数据真正保存在云端（Cloudflare R2）
2. ✅ 不污染 Git 仓库
3. ✅ 免费额度足够使用
4. ✅ 全球 CDN 加速
5. ✅ 自动备份机制已实现

---

## 🚀 快速开始

### 使用 GitHub Gist（默认，最简单）

1. **登录系统**
   - 输入密码：`123456`
   - 输入 GitHub Token（首次）

2. **自动备份**
   - 创建公告 → 自动备份到 Gist
   - 编辑岗位 → 自动备份到 Gist
   - 保存档案 → 自动备份到 Gist

3. **查看备份**
   - 访问 https://gist.github.com/
   - 找到 "公考岗位分析系统 - 云端数据备份"

---

### 使用 Cloudflare R2（推荐，更专业）

#### 步骤 1: 部署 Cloudflare Worker

```bash
# 1. 安装 Wrangler CLI
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 创建 R2 Bucket
wrangler r2 bucket create kgkb-data

# 4. 设置 API Key
wrangler secret put API_KEY
# 输入：your-secret-api-key

# 5. 部署 Worker
cd cloudflare-worker
wrangler deploy
```

#### 步骤 2: 配置前端

编辑 `.env` 文件：

```env
# 切换到 R2
VITE_STORAGE_BACKEND=cloudflare_r2

# Worker URL（部署后获得）
VITE_R2_WORKER_URL=https://kgkb-r2-worker.your-account.workers.dev

# API Key（与 Worker 中设置的相同）
VITE_R2_API_KEY=your-secret-api-key
```

#### 步骤 3: 重新构建部署

```bash
npm run build
git add .
git commit -m "切换到 Cloudflare R2 存储"
git push origin main
```

#### 步骤 4: 使用

- 登录系统（无需输入 GitHub Token）
- 数据自动备份到 Cloudflare R2
- 享受更快的访问速度！

---

## 📊 数据流程

### GitHub Gist 方案

```
用户操作 → 前端 JavaScript → GitHub Gist API → Gist 存储
                ↓
         AES-256 加密
```

### Cloudflare R2 方案

```
用户操作 → 前端 JavaScript → Cloudflare Worker → R2 存储
                ↓                    ↓
         AES-256 加密         API Key 验证
```

---

## 🔐 安全性

### 数据加密
- **算法**: AES-256-GCM
- **密钥派生**: PBKDF2（100,000 次迭代）
- **加密对象**: 所有云端数据

### 访问控制
- **GitHub Gist**: Personal Access Token
- **Cloudflare R2**: API Key + Worker 验证

### 传输安全
- **协议**: HTTPS
- **证书**: Let's Encrypt / Cloudflare

---

## 💰 成本对比

### GitHub Gist
- **存储**: 免费（无限制）
- **API 调用**: 免费（5000次/小时）
- **流量**: 免费
- **总成本**: **$0/月**

### Cloudflare R2
- **存储**: 免费（10GB）
- **读取**: 免费（1000万次/月）
- **写入**: 免费（100万次/月）
- **流量**: 免费（无限制）
- **总成本**: **$0/月**（在免费额度内）

### 超出免费额度后（R2）
- **存储**: $0.015/GB/月
- **Class A 操作**: $4.50/百万次
- **Class B 操作**: $0.36/百万次

**估算**：个人使用基本不会超出免费额度

---

## 🎉 已实现的功能

### 1. 自动备份
- ✅ 创建/编辑/删除公告 → 自动备份
- ✅ 导入/编辑/删除岗位 → 自动备份
- ✅ 保存/更新个人档案 → 自动备份

### 2. 智能防抖
- ✅ 3秒内多次修改只备份一次
- ✅ 避免频繁 API 调用
- ✅ 优化性能

### 3. 静默通知
- ✅ 备份成功后显示小提示
- ✅ 3秒后自动消失
- ✅ 不打扰用户操作

### 4. 多后端支持
- ✅ GitHub Gist
- ✅ Cloudflare R2
- ✅ 轻松切换

---

## 📚 相关文档

- [CLOUDFLARE_R2_SETUP.md](./CLOUDFLARE_R2_SETUP.md) - R2 详细配置指南
- [cloudflare-worker/README.md](./cloudflare-worker/README.md) - Worker 部署指南
- [AUTO_BACKUP_GUIDE.md](./AUTO_BACKUP_GUIDE.md) - 自动备份功能说明

---

## ❓ 常见问题

### Q: 为什么不直接保存到 GitHub 仓库？

**A:** 因为：
1. 每次保存都会创建一个 commit
2. 100 次修改 = 100 个 commits
3. Git 历史会变得非常乱
4. 仓库大小会快速增长
5. 不适合频繁更新的数据

### Q: GitHub Gist 和 R2 哪个更好？

**A:** 取决于您的需求：
- **简单使用** → GitHub Gist
- **专业使用** → Cloudflare R2
- **数据量小** → GitHub Gist
- **数据量大** → Cloudflare R2
- **不想配置** → GitHub Gist
- **追求性能** → Cloudflare R2

### Q: 数据会丢失吗？

**A:** 不会！数据存储在：
1. 浏览器 localStorage（本地）
2. GitHub Gist / Cloudflare R2（云端）
3. 自动备份历史（云端）

### Q: 如何切换存储后端？

**A:** 修改 `.env` 文件：
```env
# 使用 GitHub Gist
VITE_STORAGE_BACKEND=github_gist

# 使用 Cloudflare R2
VITE_STORAGE_BACKEND=cloudflare_r2
```

---

## 🎊 总结

我已经为您实现了：

1. ✅ **自动云端备份** - 数据变化自动保存到云端
2. ✅ **多后端支持** - GitHub Gist 和 Cloudflare R2
3. ✅ **数据加密** - AES-256-GCM 加密
4. ✅ **智能防抖** - 避免频繁备份
5. ✅ **静默通知** - 不打扰用户
6. ✅ **完整文档** - 详细的配置指南

**默认使用 GitHub Gist，如需更高性能可切换到 Cloudflare R2！**

---

**数据已真正保存到云端，不会丢失！** 🎉
