# 快速开始指南

## 🚀 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置密码

`.env` 文件已经配置好，默认密码是 **123456**

如需修改密码：
1. 访问 https://emn178.github.io/online-tools/sha256.html
2. 输入您的新密码
3. 复制生成的 SHA-256 哈希值
4. 更新 `.env` 文件中的 `VITE_ACCESS_PASSWORD_HASH`

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 登录系统

1. 访问 http://localhost:5173
2. 输入密码：**123456**
3. （可选）输入 GitHub Token 以启用云端存储功能

## ☁️ 云端存储配置

### 获取 GitHub Token

1. 访问 [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. 点击 **Generate new token (classic)**
3. 设置：
   - **Note**: `KGKB Cloud Storage`
   - **Expiration**: 选择有效期（建议 90 天或更长）
   - **Scopes**: 勾选 `gist`
4. 生成并复制 Token（格式：`ghp_xxxxxxxxxxxxxxxxxxxx`）

### 使用云端存储

1. **首次登录时**：在登录页面的 "GitHub Token" 输入框中粘贴您的 Token
2. **Token 会自动保存**到浏览器本地存储，下次登录无需再次输入
3. **备份数据**：点击导航栏的 "☁️ 备份到云端" 按钮
4. **恢复数据**：点击 "📥 从云端恢复" 按钮

## 📦 部署到 GitHub Pages

### 步骤1：生成密码哈希

1. 访问 https://emn178.github.io/online-tools/sha256.html
2. 输入您的密码（例如：`mypassword123`）
3. 复制生成的 SHA-256 哈希值

### 步骤2：配置 GitHub Secrets

1. 进入您的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加密钥：
   - **Name**: `ACCESS_PASSWORD_HASH`
   - **Secret**: 粘贴您的密码哈希值

### 步骤3：推送代码

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 步骤4：访问网站

部署完成后，访问：`https://your-username.github.io/your-repo-name`

## 🔐 安全说明

### 密码保护

- ✅ 使用 SHA-256 哈希存储密码
- ✅ 登录状态保存在 sessionStorage（关闭浏览器自动清除）
- ✅ 密码不会出现在代码中

### GitHub Token

- ✅ Token 保存在浏览器 localStorage（仅本地存储）
- ✅ Token 不会上传到服务器
- ✅ Token 仅用于访问您自己的 GitHub Gist

### 数据加密

- ✅ 云端数据使用 AES-256-GCM 加密
- ✅ 加密密钥由您的密码派生（PBKDF2，100,000 次迭代）
- ✅ 即使 GitHub Gist 被他人访问，没有密码也无法解密

## ❓ 常见问题

### Q: 忘记密码怎么办？

**本地开发**：
1. 重新生成密码的 SHA-256 哈希
2. 更新 `.env` 文件中的 `VITE_ACCESS_PASSWORD_HASH`
3. 重新构建：`npm run build`

**GitHub Pages**：
1. 重新生成密码的 SHA-256 哈希
2. 更新 GitHub Secrets 中的 `ACCESS_PASSWORD_HASH`
3. 重新推送代码触发部署

### Q: 如何更换 GitHub Token？

1. 登录系统
2. 打开浏览器控制台（F12）
3. 执行：`localStorage.setItem('github_token', 'your_new_token')`
4. 或者清除旧 Token 后重新登录：`localStorage.removeItem('github_token')`

### Q: 个人信息保存后没有反应？

请检查：
1. 是否填写了所有必填字段（标有 * 的字段）
2. 查看页面右上角是否有成功提示
3. 刷新页面查看数据是否已保存

### Q: 云端同步失败？

请检查：
1. 是否已输入 GitHub Token
2. Token 是否有 `gist` 权限
3. 网络连接是否正常
4. 查看浏览器控制台的错误信息

## 📚 更多文档

- [详细配置指南](./CLOUD_SETUP.md)
- [部署指南](./DEPLOYMENT.md)
- [开发文档](./DEVELOPMENT.md)
- [项目说明](./README.md)

## 🎯 功能特性

- ✅ 密码保护访问
- ✅ 云端数据备份（GitHub Gist）
- ✅ AES-256 数据加密
- ✅ 智能岗位匹配
- ✅ Excel 数据导入/导出
- ✅ 个人档案管理
- ✅ 公告管理
- ✅ 岗位筛选和统计

## 💡 提示

1. **首次使用**：建议先填写个人档案，以获得精准的岗位匹配
2. **定期备份**：重要数据修改后及时备份到云端
3. **保管密码**：忘记密码将无法恢复云端数据
4. **Token 安全**：不要将 GitHub Token 分享给他人
