# 部署总结 - Cloudflare R2 存储

## 🎯 目标

将数据真正保存到云端（Cloudflare R2），而不仅仅是浏览器的 localStorage。

---

## ✅ 已完成的工作

### 1. 多后端存储系统
- ✅ GitHub Gist 后端（默认）
- ✅ Cloudflare R2 后端（推荐）
- ✅ 统一的存储接口
- ✅ 轻松切换后端

### 2. Cloudflare Worker
- ✅ Worker 代码（`cloudflare-worker/worker.js`）
- ✅ 配置文件（`cloudflare-worker/wrangler.toml`）
- ✅ 支持上传、下载、列表操作
- ✅ API Key 验证
- ✅ CORS 支持

### 3. 自动备份系统
- ✅ 数据变化自动触发备份
- ✅ 3秒防抖机制
- ✅ 静默通知
- ✅ 失败重试

### 4. 部署工具
- ✅ 一键部署脚本（Windows: `deploy-worker.bat`）
- ✅ 一键部署脚本（Linux/Mac: `deploy-worker.sh`）
- ✅ 详细部署文档（`DEPLOY_CLOUDFLARE_WORKER.md`）

### 5. 文档
- ✅ 存储方案对比（`STORAGE_SOLUTION.md`）
- ✅ R2 配置指南（`CLOUDFLARE_R2_SETUP.md`）
- ✅ Worker 部署指南（`DEPLOY_CLOUDFLARE_WORKER.md`）
- ✅ 自动备份说明（`AUTO_BACKUP_GUIDE.md`）

---

## 🚀 快速部署（3 种方法）

### 方法 1: 一键部署脚本（推荐）

**Windows:**
```bash
.\deploy-worker.bat
```

**Linux/Mac:**
```bash
chmod +x deploy-worker.sh
./deploy-worker.sh
```

脚本会自动：
1. 检查并安装 Wrangler CLI
2. 登录 Cloudflare
3. 创建 R2 Bucket
4. 设置 API Key
5. 部署 Worker

### 方法 2: 手动部署

```bash
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录
wrangler login

# 3. 创建 Bucket
wrangler r2 bucket create kgkb-data

# 4. 设置 API Key
wrangler secret put API_KEY

# 5. 部署
cd cloudflare-worker
wrangler deploy
```

### 方法 3: 使用 GitHub Gist（默认）

如果不想部署 Worker，可以继续使用 GitHub Gist：
- ✅ 无需额外配置
- ✅ 已经可以使用
- ✅ 完全免费

---

## ⚙️ 配置前端

### 本地开发

编辑 `.env` 文件：

```env
# 访问密码
VITE_ACCESS_PASSWORD_HASH=8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92

# 使用 Cloudflare R2
VITE_STORAGE_BACKEND=cloudflare_r2

# Worker URL（替换为您的实际 URL）
VITE_R2_WORKER_URL=https://kgkb-r2-worker.your-account.workers.dev

# API Key（替换为您设置的密钥）
VITE_R2_API_KEY=your-secret-api-key
```

### GitHub Pages 部署

在 GitHub 仓库中添加 Secrets：

| Secret Name | Value |
|-------------|-------|
| `ACCESS_PASSWORD_HASH` | `8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92` |
| `STORAGE_BACKEND` | `cloudflare_r2` |
| `R2_WORKER_URL` | `https://kgkb-r2-worker.your-account.workers.dev` |
| `R2_API_KEY` | `your-secret-api-key` |

---

## 📊 数据流程

```
用户操作（创建公告）
    ↓
前端 JavaScript
    ↓
自动触发备份（3秒防抖）
    ↓
AES-256 加密数据
    ↓
发送到 Cloudflare Worker
    ↓
Worker 验证 API Key
    ↓
保存到 R2 Bucket
    ↓
返回成功响应
    ↓
显示通知："☁️ 数据已自动备份到云端"
```

---

## 🎯 使用流程

### 1. 部署 Worker
```bash
.\deploy-worker.bat  # Windows
# 或
./deploy-worker.sh   # Linux/Mac
```

### 2. 配置前端
编辑 `.env` 文件，填入 Worker URL 和 API Key

### 3. 构建项目
```bash
npm run build
```

### 4. 本地测试
```bash
npm run dev
```
访问 http://localhost:5173，测试功能

### 5. 部署到 GitHub Pages
```bash
git add .
git commit -m "切换到 Cloudflare R2 存储"
git push origin main
```

### 6. 验证
1. 访问 GitHub Pages 网站
2. 登录系统
3. 创建测试数据
4. 查看 Cloudflare Dashboard → R2 → kgkb-data
5. 确认文件已上传

---

## 💰 成本分析

### 免费额度（每月）

**Cloudflare Workers:**
- ✅ 100,000 请求/天
- ✅ 10ms CPU 时间/请求

**Cloudflare R2:**
- ✅ 10GB 存储
- ✅ 1000 万次 Class B 操作（读取）
- ✅ 100 万次 Class A 操作（写入）
- ✅ 无出口流量费用

### 个人使用估算

假设每天：
- 创建 10 个公告
- 编辑 20 次
- 查看 50 次

**每月总计：**
- Worker 请求：~2,400 次（远低于 300 万）
- R2 写入：~900 次（远低于 100 万）
- R2 读取：~1,500 次（远低于 1000 万）
- 存储：~1MB（远低于 10GB）

**结论：完全在免费额度内！** 💯

---

## 🔐 安全性

### 数据加密
- **算法**: AES-256-GCM
- **密钥派生**: PBKDF2（100,000 次迭代）
- **加密对象**: 所有云端数据

### 访问控制
- **API Key**: Worker 验证
- **CORS**: 限制来源
- **HTTPS**: 加密传输

### 最佳实践
- ✅ 使用强 API Key
- ✅ 定期轮换密钥
- ✅ 限制 CORS 来源
- ✅ 监控访问日志

---

## 📈 监控和管理

### 查看 Worker 日志
```bash
wrangler tail
```

### 查看 Worker 分析
1. 访问 Cloudflare Dashboard
2. Workers & Pages → kgkb-r2-worker
3. Analytics 标签

### 查看 R2 使用情况
1. 访问 Cloudflare Dashboard
2. R2 → kgkb-data
3. 查看存储和 API 调用统计

---

## 🐛 常见问题

### Q1: Worker 部署失败？
**A:** 检查：
1. Wrangler 是否已登录：`wrangler whoami`
2. R2 Bucket 是否已创建：`wrangler r2 bucket list`
3. 查看错误日志

### Q2: 前端无法连接 Worker？
**A:** 检查：
1. Worker URL 是否正确
2. API Key 是否匹配
3. CORS 配置是否正确
4. 浏览器控制台错误信息

### Q3: 数据没有备份？
**A:** 检查：
1. 是否已配置 R2 后端
2. Worker 是否正常运行
3. 浏览器控制台是否有错误
4. Worker 日志：`wrangler tail`

### Q4: 如何切换回 GitHub Gist？
**A:** 修改 `.env` 文件：
```env
VITE_STORAGE_BACKEND=github_gist
```
然后重新构建。

---

## 🎉 完成检查清单

- [ ] Wrangler CLI 已安装
- [ ] 已登录 Cloudflare
- [ ] R2 Bucket 已创建
- [ ] API Key 已设置
- [ ] Worker 已部署
- [ ] Worker URL 已复制
- [ ] 前端 .env 已配置
- [ ] 项目已重新构建
- [ ] 本地测试通过
- [ ] 已推送到 GitHub
- [ ] GitHub Pages 部署成功
- [ ] 生产环境测试通过

---

## 📚 相关文档

- [DEPLOY_CLOUDFLARE_WORKER.md](./DEPLOY_CLOUDFLARE_WORKER.md) - 详细部署指南
- [STORAGE_SOLUTION.md](./STORAGE_SOLUTION.md) - 存储方案对比
- [CLOUDFLARE_R2_SETUP.md](./CLOUDFLARE_R2_SETUP.md) - R2 配置指南
- [AUTO_BACKUP_GUIDE.md](./AUTO_BACKUP_GUIDE.md) - 自动备份说明

---

## 🎊 总结

您现在有两个选择：

### 选项 1: GitHub Gist（默认）
- ✅ 无需额外配置
- ✅ 已经可以使用
- ✅ 适合个人使用

### 选项 2: Cloudflare R2（推荐）
- ✅ 更高性能
- ✅ 更大容量
- ✅ 全球 CDN
- ✅ 适合专业使用

**两种方案都会将数据真正保存到云端！**

---

## 🚀 开始部署

**Windows 用户：**
```bash
.\deploy-worker.bat
```

**Linux/Mac 用户：**
```bash
chmod +x deploy-worker.sh
./deploy-worker.sh
```

**或者查看详细文档：**
```bash
# 打开部署指南
code DEPLOY_CLOUDFLARE_WORKER.md
```

---

**祝您部署顺利！** 🎉

如有问题，请查看文档或检查 Worker 日志。
