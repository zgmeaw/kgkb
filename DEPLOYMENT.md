# 部署指南

## 快速开始

### 1. 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 创建 .env 文件（已创建示例）
# 编辑 .env 文件，设置您的密码
VITE_ACCESS_PASSWORD=your_password

# 3. 启动开发服务器
npm run dev

# 4. 访问 http://localhost:5173
# 使用您设置的密码登录
```

### 2. 部署到 GitHub Pages

#### 步骤1：配置 GitHub Secrets

1. 进入您的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下密钥：

| 名称 | 值 | 说明 |
|------|-----|------|
| `ACCESS_PASSWORD` | `your_password` | 访问密码（明文） |
| `GITHUB_TOKEN` | `ghp_xxxxx` | GitHub Token（可选） |

#### 步骤2：推送代码

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

#### 步骤3：等待部署

- GitHub Actions 会自动构建和部署
- 查看 **Actions** 标签页查看部署进度
- 部署完成后，访问 `https://your-username.github.io/your-repo-name`

### 3. 部署到 Cloudflare Pages

#### 步骤1：连接 GitHub 仓库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → **Create a project**
3. 连接您的 GitHub 仓库

#### 步骤2：配置构建设置

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`

#### 步骤3：添加环境变量

在 **Settings** → **Environment variables** 中添加：

| 变量名 | 值 |
|--------|-----|
| `VITE_ACCESS_PASSWORD` | `your_password` |
| `VITE_GITHUB_TOKEN` | `ghp_xxxxx` (可选) |

#### 步骤4：部署

点击 **Save and Deploy**，Cloudflare 会自动构建和部署。

## 配置说明

### 环境变量

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `VITE_ACCESS_PASSWORD` | 推荐 | 访问密码（明文） |
| `VITE_ACCESS_PASSWORD_HASH` | 可选 | 密码的SHA-256哈希（更安全） |
| `VITE_GITHUB_TOKEN` | 可选 | GitHub Token，用于云端存储 |

**注意**：
- `VITE_ACCESS_PASSWORD` 和 `VITE_ACCESS_PASSWORD_HASH` 二选一
- 优先使用 `VITE_ACCESS_PASSWORD`（明文密码）
- 如果两者都不设置，系统将允许无密码访问

### GitHub Token 配置

如果需要云端存储功能：

1. 访问 [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. 点击 **Generate new token (classic)**
3. 设置：
   - **Note**: `KGKB Cloud Storage`
   - **Expiration**: 选择有效期
   - **Scopes**: 勾选 `gist`
4. 生成并复制 Token

## 故障排除

### 问题1：部署后显示404

**原因**：GitHub Pages 的单页应用路由问题

**解决方案**：已在 `public/404.html` 中配置自动重定向

### 问题2：登录失败

**检查**：
1. 确认环境变量已正确设置
2. 检查密码是否正确
3. 查看浏览器控制台是否有错误

### 问题3：云端同步失败

**检查**：
1. 确认 `VITE_GITHUB_TOKEN` 已设置
2. 确认 Token 有 `gist` 权限
3. 检查网络连接

## 安全建议

1. **不要将 `.env` 文件提交到 Git**
   - 已在 `.gitignore` 中配置
   
2. **使用强密码**
   - 至少12位
   - 包含大小写字母、数字和特殊字符

3. **定期更新 GitHub Token**
   - 设置合理的过期时间
   - 定期轮换 Token

4. **启用 GitHub 两步验证**
   - 保护您的 GitHub 账户

## 更多信息

- [云端存储配置指南](./CLOUD_SETUP.md)
- [开发文档](./DEVELOPMENT.md)
- [项目说明](./README.md)
