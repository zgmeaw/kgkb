# 云端存储和密码保护配置指南

## 功能说明

系统现在支持：
1. **密码保护** - 只有输入正确密码才能访问系统
2. **云端存储** - 数据加密后保存到GitHub Gist，可在不同设备间同步
3. **数据加密** - 使用AES-256加密，确保数据安全

## 配置步骤

### 1. 设置访问密码

#### 方式1：使用明文密码（推荐）

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，直接填入您的密码：

```env
# 访问密码（明文）
VITE_ACCESS_PASSWORD=your_password_here
```

**优点**：
- 简单直接，无需生成哈希
- 适合在 GitHub Secrets 中使用
- 密码不会出现在代码中

#### 方式2：使用SHA-256哈希（更安全）

如果您希望更安全，可以使用密码哈希：

1. 访问在线SHA-256工具：https://emn178.github.io/online-tools/sha256.html
2. 输入你想要的密码（例如：`mypassword123`），得到SHA-256哈希值

例如：
- 密码：`123456`
- SHA-256：`8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92`

3. 编辑 `.env` 文件：

```env
# 访问密码的SHA-256哈希值
VITE_ACCESS_PASSWORD_HASH=8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
```

**注意**：`VITE_ACCESS_PASSWORD` 和 `VITE_ACCESS_PASSWORD_HASH` 二选一即可，优先使用明文密码。

### 2. 配置GitHub Token（可选，用于云端存储）

#### 2.1 创建GitHub Personal Access Token

1. 登录GitHub
2. 进入 Settings → Developer settings → Personal access tokens → Tokens (classic)
3. 点击 "Generate new token (classic)"
4. 设置：
   - Note: `KGKB Cloud Storage`
   - Expiration: `No expiration` 或选择一个期限
   - 勾选权限：`gist`
5. 点击 "Generate token"
6. **复制生成的token**（只显示一次！）

#### 2.2 配置Token

在 `.env` 文件中添加：

```env
# GitHub Personal Access Token
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. 重新构建

```bash
npm run build
```

## 使用说明

### 登录系统

1. 访问系统URL
2. 输入你设置的密码
3. 点击"登录"

### 云端备份

1. 登录后，点击导航栏的"☁️ 备份到云端"按钮
2. 输入一个加密密码（可以与登录密码相同或不同）
3. 数据会加密后上传到GitHub Gist

### 云端恢复

1. 在新设备上登录系统
2. 点击"📥 从云端恢复"按钮
3. 输入之前设置的加密密码
4. 数据会自动下载并解密

### 退出登录

点击导航栏的"🚪 退出"按钮

## 安全说明

### 密码安全

- 登录密码以SHA-256哈希形式存储在环境变量中
- 实际密码不会出现在代码中
- 登录状态保存在sessionStorage中，关闭浏览器后自动清除

### 数据加密

- 云端数据使用AES-256-GCM加密
- 加密密钥由你设置的密码派生（PBKDF2，100000次迭代）
- 即使GitHub Gist被他人访问，没有密码也无法解密数据

### 最佳实践

1. **使用强密码** - 至少12位，包含大小写字母、数字和特殊字符
2. **定期备份** - 重要数据修改后及时备份到云端
3. **保管好密码** - 忘记密码将无法恢复数据
4. **Token安全** - 不要将GitHub Token提交到公开仓库

## 故障排除

### 忘记登录密码

**方式1：如果使用明文密码**
1. 直接更新 `.env` 文件中的 `VITE_ACCESS_PASSWORD`
2. 重新构建：`npm run build`

**方式2：如果使用密码哈希**
1. 重新生成密码的SHA-256哈希
2. 更新 `.env` 文件中的 `VITE_ACCESS_PASSWORD_HASH`
3. 重新构建：`npm run build`

### 忘记加密密码

如果忘记云端数据的加密密码，数据将无法恢复。建议：
- 使用密码管理器保存密码
- 将密码写在安全的地方

### 云端同步失败

检查：
1. GitHub Token是否正确配置
2. Token是否有`gist`权限
3. 网络连接是否正常

### 清除云端数据

如果需要重新开始：

```javascript
// 在浏览器控制台执行
localStorage.removeItem('gist_id');
```

然后重新备份数据会创建新的Gist。

## 部署注意事项

### GitHub Pages

在GitHub仓库的 **Settings → Secrets and variables → Actions** 中添加：

- `ACCESS_PASSWORD`: 你的访问密码（明文，例如：`mypassword123`）
- `GITHUB_TOKEN`: 你的GitHub Personal Access Token

**不需要**手动修改 `.github/workflows/deploy.yml`，工作流已经配置好自动读取这些密钥。

部署时，GitHub Actions 会自动：
1. 从 Secrets 读取 `ACCESS_PASSWORD` 和 `GITHUB_TOKEN`
2. 创建 `.env` 文件
3. 构建应用
4. 部署到 GitHub Pages

### Cloudflare Pages

在项目设置的 **Environment variables** 中添加：

- `VITE_ACCESS_PASSWORD`: 你的访问密码（明文）
- `VITE_GITHUB_TOKEN`: 你的GitHub Personal Access Token

Cloudflare Pages 会自动读取这些环境变量并在构建时使用。

## 技术细节

### 加密算法

- **密码哈希**: SHA-256
- **数据加密**: AES-256-GCM
- **密钥派生**: PBKDF2 (100000 iterations, SHA-256)
- **随机盐**: 16 bytes
- **随机IV**: 12 bytes

### 数据格式

云端存储的数据结构：

```json
{
  "announcements": [],
  "positions": [],
  "userProfile": {},
  "scoreHistory": [],
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

加密后以Base64格式存储在GitHub Gist中。

## 常见问题

**Q: 可以不设置密码吗？**
A: 可以。如果不设置 `VITE_ACCESS_PASSWORD` 和 `VITE_ACCESS_PASSWORD_HASH`，系统会直接允许访问。

**Q: 明文密码和哈希密码有什么区别？**
A: 
- **明文密码**：直接存储密码，简单方便，适合在 GitHub Secrets 等安全环境中使用
- **哈希密码**：存储密码的哈希值，更安全，即使 `.env` 文件泄露也无法直接看到密码

**Q: 应该使用哪种方式？**
A: 
- **本地开发**：使用明文密码更方便
- **GitHub Secrets**：使用明文密码，因为 Secrets 本身就是加密的
- **公开的配置文件**：使用哈希密码更安全

**Q: 可以不使用云端存储吗？**
A: 可以。如果不配置 `VITE_GITHUB_TOKEN`，系统会提示未配置，但本地存储功能正常使用。

**Q: 数据存储在哪里？**
A: 本地数据存储在浏览器的localStorage中，云端数据存储在GitHub Gist中。

**Q: 如何更换设备？**
A: 在新设备上登录后，使用"从云端恢复"功能即可同步数据。

**Q: 多人可以使用吗？**
A: 当前设计为单用户使用。如需多用户，建议每人使用不同的GitHub Token和密码。

## 支持

如有问题，请查看：
- [项目文档](./README.md)
- [开发指南](./DEVELOPMENT.md)
- [GitHub Issues](https://github.com/yourusername/kgkb/issues)
