# 部署指南

## 📋 目录

- [快速开始](#快速开始)
- [云端存储配置](#云端存储配置)
- [GitHub Pages 部署](#github-pages-部署)
- [Cloudflare R2 配置（可选）](#cloudflare-r2-配置可选)
- [故障排除](#故障排除)

---

## 快速开始

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问 http://localhost:5173
# 默认密码：123456
```

### 配置访问密码

系统默认密码是 **123456**。如需修改：

1. 访问 [SHA-256 在线工具](https://emn178.github.io/online-tools/sha256.html)
2. 输入您的新密码
3. 复制生成的 SHA-256 哈希值
4. 编辑 `.env` 文件：

```env
VITE_ACCESS_PASSWORD_HASH=your_sha256_hash_here
```

5. 重新构建：`npm run build`

---

## 云端存储配置

系统支持两种云端存储方案：

### 方案 1: GitHub Gist（推荐，简单）

**优点：**
- ✅ 完全免费
- ✅ 配置简单
- ✅ 自动版本控制

**配置步骤：**

1. **获取 GitHub Token**
   - 访问 [GitHub Settings → Tokens](https://github.com/settings/tokens)
   - 点击 **Generate new token (classic)**
   - 设置：
     - Note: `KGKB Cloud Storage`
     - Expiration: 选择有效期
     - Scopes: 勾选 `gist`
   - 生成并复制 Token

2. **使用 Token**
   - 登录系统时，在 "GitHub Token" 输入框中粘贴 Token
   - Token 会自动保存到浏览器本地存储
   - 下次登录无需再次输入

3. **自动备份**
   - 创建/编辑数据时，系统会自动备份到 GitHub Gist
   - 3 秒防抖机制，避免频繁备份
   - 备份成功后显示提示："☁️ 数据已自动备份到云端"

### 方案 2: Cloudflare R2（高级，高性能）

**优点：**
- ✅ 免费额度大（10GB + 1000万次读取/月）
- ✅ 全球 CDN 加速
- ✅ 无出口流量费用

**配置步骤：**

详见 [Cloudflare R2 配置](#cloudflare-r2-配置可选) 章节。

---

## GitHub Pages 部署

### 步骤 1: 配置 GitHub Secrets

1. 进入 GitHub 仓库
2. **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加密钥：

| Name | Value | 说明 |
|------|-------|------|
| `ACCESS_PASSWORD_HASH` | `8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92` | 密码哈希（对应密码：123456） |

### 步骤 2: 推送代码

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 步骤 3: 等待部署

- GitHub Actions 会自动构建和部署（约 2-3 分钟）
- 查看 **Actions** 标签页查看部署进度
- 部署完成后，访问 `https://your-username.github.io/your-repo-name`

### 步骤 4: 验证部署

1. 访问网站
2. 使用密码 `123456` 登录
3. 输入 GitHub Token（首次登录）
4. 测试功能：
   - 创建公告
   - 导入岗位
   - 保存个人档案
   - 查看云端备份提示

---

## Cloudflare R2 配置（可选）

如果您需要更高性能的云端存储，可以使用 Cloudflare R2。

### 方法 1: 使用 Cloudflare Dashboard（推荐）

#### 1. 创建 R2 Bucket

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧菜单选择 **R2**
3. 点击 **Create bucket**
4. Bucket 名称：`kgkb-data`
5. 点击 **Create bucket**

#### 2. 创建 Worker

1. 左侧菜单选择 **Workers & Pages**
2. 点击 **Create application** → **Create Worker**
3. Worker 名称：`kgkb-r2-worker`
4. 点击 **Deploy**

#### 3. 编辑 Worker 代码

1. 点击 **Edit code**
2. 删除默认代码
3. 复制 `cloudflare-worker/worker.js` 的内容并粘贴
4. 点击 **Save and deploy**

#### 4. 绑定 R2 Bucket

1. 返回 Worker 页面 → **Settings** 标签
2. 找到 **Variables and Secrets**
3. 添加 R2 bucket binding：
   - Type: **R2 bucket binding**
   - Variable name: `KGKB_BUCKET`
   - R2 bucket: 选择 `kgkb-data`
4. 点击 **Save**

#### 5. 设置 API Key

1. 在 **Variables and Secrets** 部分
2. 添加 Secret：
   - Type: **Secret**
   - Variable name: `API_KEY`
   - Value: 输入一个强密码（例如：`kgkb-secret-2024-随机字符串`）
3. 点击 **Save**

#### 6. 配置前端

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

#### 7. 重新构建部署

```bash
npm run build
git add .
git commit -m "切换到 Cloudflare R2 存储"
git push origin main
```

### 方法 2: 使用 Wrangler CLI

```bash
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 创建 R2 Bucket
wrangler r2 bucket create kgkb-data

# 4. 设置 API Key
wrangler secret put API_KEY

# 5. 部署 Worker
cd cloudflare-worker
wrangler deploy
```

---

## 故障排除

### 问题 1: 登录失败

**检查：**
1. 确认密码是否正确（默认：123456）
2. 检查 `.env` 文件中的 `VITE_ACCESS_PASSWORD_HASH`
3. 查看浏览器控制台错误信息

**解决：**
- 重新生成密码哈希并更新 `.env` 文件
- 清除浏览器缓存后重试

### 问题 2: GitHub Token 无法保存

**检查：**
1. Token 是否有 `gist` 权限
2. 浏览器是否允许 localStorage

**解决：**
- 重新生成 Token，确保勾选 `gist` 权限
- 检查浏览器隐私设置，允许网站存储数据

### 问题 3: 云端备份失败

**检查：**
1. 是否已输入 GitHub Token
2. 网络连接是否正常
3. 浏览器控制台错误信息

**解决：**
- 确认 Token 有效且有正确权限
- 检查网络连接
- 查看 GitHub Gist 是否创建成功

### 问题 4: 部署后显示 404

**原因：** GitHub Pages 的单页应用路由问题

**解决：** 已在 `public/404.html` 中配置自动重定向，无需额外操作

### 问题 5: Cloudflare Worker 部署失败

**检查：**
1. Wrangler 是否已登录：`wrangler whoami`
2. R2 Bucket 是否已创建：`wrangler r2 bucket list`

**解决：**
- 使用 Cloudflare Dashboard 手动创建（方法 1）
- 或重新登录 Wrangler：`wrangler logout && wrangler login`

### 问题 6: CORS 错误

**解决：**
修改 `cloudflare-worker/worker.js` 中的 CORS 头：

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-username.github.io',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};
```

---

## 安全建议

1. **使用强密码**
   - 至少 12 位
   - 包含大小写字母、数字和特殊字符

2. **保护 GitHub Token**
   - 不要分享给他人
   - 定期轮换 Token
   - 设置合理的过期时间

3. **保护 API Key**
   - 使用随机生成的强密钥
   - 不要提交到代码仓库
   - 定期更换

4. **启用两步验证**
   - 为 GitHub 账户启用 2FA
   - 为 Cloudflare 账户启用 2FA

---

## 数据安全

### 加密机制

- **密码哈希**: SHA-256
- **数据加密**: AES-256-GCM
- **密钥派生**: PBKDF2（100,000 次迭代）

### 数据存储

- **本地**: 浏览器 localStorage
- **云端**: GitHub Gist 或 Cloudflare R2
- **传输**: HTTPS 加密

### 隐私保护

- Token 仅存储在用户本地浏览器
- 云端数据经过加密，无密码无法解密
- 不收集任何用户数据

---

## 成本说明

### GitHub Gist
- **存储**: 免费（无限制）
- **API 调用**: 免费（5000次/小时）
- **总成本**: **$0/月**

### Cloudflare R2
- **存储**: 免费（10GB）
- **读取**: 免费（1000万次/月）
- **写入**: 免费（100万次/月）
- **总成本**: **$0/月**（在免费额度内）

**个人使用完全在免费额度内！**

---

## 更多帮助

- [项目说明](./README.md)
- [快速开始](./QUICK_START.md)
- [开发文档](./DEVELOPMENT.md)
- [GitHub Issues](https://github.com/yourusername/kgkb/issues)

---

**祝您部署顺利！** 🚀
