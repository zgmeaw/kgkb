# Cloudflare Worker 部署指南

## 📋 前提条件

1. ✅ Cloudflare 账户（免费）
2. ✅ Node.js 已安装
3. ✅ 命令行工具

---

## 🚀 步骤 1: 安装 Wrangler CLI

打开命令行，执行：

```bash
npm install -g wrangler
```

验证安装：
```bash
wrangler --version
```

应该显示类似：`wrangler 3.x.x`

---

## 🔐 步骤 2: 登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器，要求您登录 Cloudflare 账户并授权。

验证登录：
```bash
wrangler whoami
```

应该显示您的账户信息。

---

## 📦 步骤 3: 创建 R2 Bucket

```bash
wrangler r2 bucket create kgkb-data
```

成功后会显示：
```
✅ Created bucket 'kgkb-data'
```

验证创建：
```bash
wrangler r2 bucket list
```

---

## 🔑 步骤 4: 设置 API Key

```bash
wrangler secret put API_KEY
```

系统会提示您输入密钥，输入一个强密码，例如：
```
kgkb-secret-key-2024-your-random-string
```

**重要：请记住这个密钥，稍后需要在前端配置中使用！**

---

## 📝 步骤 5: 部署 Worker

进入 Worker 目录：
```bash
cd cloudflare-worker
```

部署：
```bash
wrangler deploy
```

成功后会显示：
```
✅ Deployed kgkb-r2-worker
   https://kgkb-r2-worker.your-account.workers.dev
```

**重要：复制这个 URL，稍后需要使用！**

---

## 🧪 步骤 6: 测试 Worker

### 测试上传

```bash
curl -X POST https://kgkb-r2-worker.your-account.workers.dev/upload \
  -H "X-API-Key: kgkb-secret-key-2024-your-random-string" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.txt","data":"Hello World"}'
```

应该返回：
```json
{"success":true,"fileName":"test.txt"}
```

### 测试下载

```bash
curl https://kgkb-r2-worker.your-account.workers.dev/download/test.txt \
  -H "X-API-Key: kgkb-secret-key-2024-your-random-string"
```

应该返回：
```json
{"data":"Hello World"}
```

### 测试列表

```bash
curl https://kgkb-r2-worker.your-account.workers.dev/list \
  -H "X-API-Key: kgkb-secret-key-2024-your-random-string"
```

应该返回文件列表。

---

## ⚙️ 步骤 7: 配置前端

### 方法 1: 本地开发

编辑 `d:\DESK\服务器\kgkb\.env` 文件：

```env
# 访问密码（保持不变）
VITE_ACCESS_PASSWORD_HASH=8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92

# 切换到 Cloudflare R2
VITE_STORAGE_BACKEND=cloudflare_r2

# Worker URL（替换为您的实际 URL）
VITE_R2_WORKER_URL=https://kgkb-r2-worker.your-account.workers.dev

# API Key（替换为您设置的密钥）
VITE_R2_API_KEY=kgkb-secret-key-2024-your-random-string
```

### 方法 2: GitHub Pages 部署

1. 进入 GitHub 仓库
2. **Settings** → **Secrets and variables** → **Actions**
3. 添加以下 Secrets：

| Name | Value |
|------|-------|
| `ACCESS_PASSWORD_HASH` | `8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92` |
| `STORAGE_BACKEND` | `cloudflare_r2` |
| `R2_WORKER_URL` | `https://kgkb-r2-worker.your-account.workers.dev` |
| `R2_API_KEY` | `kgkb-secret-key-2024-your-random-string` |

4. 更新 `.github/workflows/deploy.yml`：

```yaml
- name: Create .env file
  run: |
    echo "VITE_ACCESS_PASSWORD_HASH=${{ secrets.ACCESS_PASSWORD_HASH }}" >> .env
    echo "VITE_STORAGE_BACKEND=${{ secrets.STORAGE_BACKEND }}" >> .env
    echo "VITE_R2_WORKER_URL=${{ secrets.R2_WORKER_URL }}" >> .env
    echo "VITE_R2_API_KEY=${{ secrets.R2_API_KEY }}" >> .env
```

---

## 🏗️ 步骤 8: 构建和部署

### 本地测试

```bash
cd d:\DESK\服务器\kgkb
npm run dev
```

访问 http://localhost:5173，测试功能。

### 部署到 GitHub Pages

```bash
git add .
git commit -m "切换到 Cloudflare R2 存储"
git push origin main
```

等待 GitHub Actions 完成部署（约 2-3 分钟）。

---

## ✅ 步骤 9: 验证部署

1. 访问您的 GitHub Pages 网站
2. 登录系统（密码：`123456`）
3. 创建一个测试公告
4. 等待 3 秒，应该看到提示："☁️ 数据已自动备份到云端"
5. 访问 Cloudflare Dashboard → R2 → kgkb-data
6. 应该能看到备份的文件

---

## 🔧 故障排除

### 问题 1: Wrangler 安装失败

**解决方案：**
```bash
# 使用 npm 全局安装
npm install -g wrangler --force

# 或使用 npx
npx wrangler login
```

### 问题 2: 登录失败

**解决方案：**
```bash
# 清除缓存
wrangler logout
wrangler login
```

### 问题 3: R2 Bucket 创建失败

**错误：** `You must verify your email before you can create R2 buckets`

**解决方案：**
1. 检查邮箱，验证 Cloudflare 账户
2. 等待几分钟后重试

### 问题 4: Worker 部署失败

**错误：** `Error: No account found`

**解决方案：**
```bash
# 重新登录
wrangler login

# 检查账户
wrangler whoami
```

### 问题 5: API Key 验证失败

**错误：** `401 Unauthorized`

**解决方案：**
1. 确认 API Key 设置正确
2. 重新设置 Secret：
```bash
wrangler secret put API_KEY
```

### 问题 6: CORS 错误

**错误：** `Access to fetch at '...' from origin '...' has been blocked by CORS`

**解决方案：**
修改 `cloudflare-worker/worker.js`，更新 CORS 头：
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-username.github.io',
  // 或使用 '*' 允许所有来源（不推荐生产环境）
  // 'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};
```

重新部署：
```bash
wrangler deploy
```

---

## 📊 监控和管理

### 查看实时日志

```bash
wrangler tail
```

### 查看 Worker 分析

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择 **Workers & Pages**
3. 点击 **kgkb-r2-worker**
4. 查看 **Analytics** 标签

### 查看 R2 使用情况

1. 访问 Cloudflare Dashboard
2. 选择 **R2**
3. 点击 **kgkb-data**
4. 查看存储使用量和 API 调用次数

---

## 🔄 更新 Worker

如果需要修改 Worker 代码：

1. 编辑 `cloudflare-worker/worker.js`
2. 重新部署：
```bash
cd cloudflare-worker
wrangler deploy
```

---

## 🗑️ 清理资源

如果不再需要，可以删除：

### 删除 Worker
```bash
wrangler delete
```

### 删除 R2 Bucket
```bash
wrangler r2 bucket delete kgkb-data
```

---

## 💰 成本估算

### 免费额度（每月）
- ✅ Workers: 100,000 请求/天
- ✅ R2 存储: 10GB
- ✅ R2 读取: 1000 万次
- ✅ R2 写入: 100 万次

### 个人使用估算
- 每天创建 10 个公告
- 每天编辑 20 次
- 每天查看 50 次

**每月总计：**
- 写入：~900 次（远低于 100 万）
- 读取：~1500 次（远低于 1000 万）
- 存储：~1MB（远低于 10GB）

**结论：完全在免费额度内！** 💯

---

## 🎉 完成！

恭喜！您已成功部署 Cloudflare Worker 和 R2 存储。

现在您的系统：
- ✅ 数据自动备份到 Cloudflare R2
- ✅ 全球 CDN 加速
- ✅ 完全免费（在免费额度内）
- ✅ 高性能低延迟

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
2. 查看 [R2 文档](https://developers.cloudflare.com/r2/)
3. 查看 Worker 日志：`wrangler tail`
4. 检查浏览器控制台错误

---

## 📝 快速命令参考

```bash
# 登录
wrangler login

# 创建 Bucket
wrangler r2 bucket create kgkb-data

# 设置 Secret
wrangler secret put API_KEY

# 部署 Worker
cd cloudflare-worker
wrangler deploy

# 查看日志
wrangler tail

# 列出 Buckets
wrangler r2 bucket list

# 删除 Worker
wrangler delete
```

---

**祝您使用愉快！** 🚀
