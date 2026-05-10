# Cloudflare R2 存储配置指南

## 🌟 为什么选择 Cloudflare R2？

### 优势
- ✅ **免费额度大**: 10GB 存储 + 每月 1000 万次读取
- ✅ **无出口费用**: 不像 AWS S3 收取流量费
- ✅ **S3 兼容**: 使用标准 S3 API
- ✅ **全球 CDN**: Cloudflare 的全球网络
- ✅ **高性能**: 低延迟访问
- ✅ **安全**: 支持加密和访问控制

### 对比 GitHub Gist
| 特性 | GitHub Gist | Cloudflare R2 |
|------|-------------|---------------|
| 免费额度 | 无限制 | 10GB |
| 文件大小限制 | 100MB | 5TB |
| API 调用限制 | 5000次/小时 | 1000万次/月 |
| 出口流量费用 | 免费 | 免费 |
| 访问速度 | 一般 | 快（CDN） |
| 适用场景 | 小文件 | 大文件 |

---

## 📋 配置步骤

### 步骤 1: 创建 Cloudflare 账户

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 注册或登录账户
3. 进入 R2 页面

### 步骤 2: 创建 R2 Bucket

1. 点击 **"Create bucket"**
2. 输入 Bucket 名称：`kgkb-data`
3. 选择区域（建议选择离您最近的）
4. 点击 **"Create bucket"**

### 步骤 3: 创建 API Token

1. 进入 **"Manage R2 API Tokens"**
2. 点击 **"Create API token"**
3. 配置权限：
   - **Token name**: `KGKB Storage`
   - **Permissions**: `Object Read & Write`
   - **TTL**: 永久或自定义
4. 点击 **"Create API Token"**
5. **重要**: 复制并保存以下信息：
   - Access Key ID
   - Secret Access Key
   - Account ID

### 步骤 4: 配置环境变量

#### 方法 1: 本地开发（.env 文件）

编辑 `.env` 文件，添加：

```env
# Cloudflare R2 配置
VITE_STORAGE_BACKEND=cloudflare_r2
VITE_R2_ACCOUNT_ID=your_account_id_here
VITE_R2_ACCESS_KEY_ID=your_access_key_id_here
VITE_R2_SECRET_ACCESS_KEY=your_secret_access_key_here
VITE_R2_BUCKET_NAME=kgkb-data
```

#### 方法 2: GitHub Pages 部署（GitHub Secrets）

1. 进入 GitHub 仓库
2. **Settings** → **Secrets and variables** → **Actions**
3. 添加以下 Secrets：
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`

4. 更新 `.github/workflows/deploy.yml`：

```yaml
- name: Create .env file
  run: |
    echo "VITE_ACCESS_PASSWORD_HASH=${{ secrets.ACCESS_PASSWORD_HASH }}" >> .env
    echo "VITE_STORAGE_BACKEND=cloudflare_r2" >> .env
    echo "VITE_R2_ACCOUNT_ID=${{ secrets.R2_ACCOUNT_ID }}" >> .env
    echo "VITE_R2_ACCESS_KEY_ID=${{ secrets.R2_ACCESS_KEY_ID }}" >> .env
    echo "VITE_R2_SECRET_ACCESS_KEY=${{ secrets.R2_SECRET_ACCESS_KEY }}" >> .env
    echo "VITE_R2_BUCKET_NAME=${{ secrets.R2_BUCKET_NAME }}" >> .env
```

#### 方法 3: 登录时输入（推荐）

修改登录页面，添加 R2 配置输入：

```typescript
// 登录时保存到 localStorage
localStorage.setItem('r2_account_id', accountId);
localStorage.setItem('r2_access_key_id', accessKeyId);
localStorage.setItem('r2_secret_access_key', secretAccessKey);
localStorage.setItem('r2_bucket_name', bucketName);
```

---

## 🔧 使用方式

### 自动备份

系统会自动使用配置的存储后端：

```typescript
// 自动检测并使用 R2
await cloudStorageService.uploadData(data, password);
```

### 切换存储后端

在 `.env` 文件中修改：

```env
# 使用 GitHub Gist
VITE_STORAGE_BACKEND=github_gist

# 使用 Cloudflare R2
VITE_STORAGE_BACKEND=cloudflare_r2
```

---

## 🔐 安全配置

### CORS 设置

如果遇到 CORS 错误，需要在 R2 Bucket 中配置 CORS：

1. 进入 Bucket 设置
2. 找到 **CORS policy**
3. 添加以下配置：

```json
[
  {
    "AllowedOrigins": [
      "https://your-username.github.io",
      "http://localhost:5173"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 访问控制

建议配置：
- ✅ 启用加密传输（HTTPS）
- ✅ 使用临时凭证
- ✅ 定期轮换 API Token
- ✅ 限制 IP 访问（可选）

---

## 📊 监控和管理

### 查看使用情况

1. 进入 Cloudflare Dashboard
2. 选择 R2
3. 查看：
   - 存储使用量
   - API 调用次数
   - 流量统计

### 成本估算

免费额度：
- 存储：10GB
- Class A 操作（写入）：100 万次/月
- Class B 操作（读取）：1000 万次/月

超出免费额度后：
- 存储：$0.015/GB/月
- Class A 操作：$4.50/百万次
- Class B 操作：$0.36/百万次

---

## 🐛 故障排除

### 问题 1: 上传失败

**错误**: `R2 上传失败: 403 Forbidden`

**解决方案**:
1. 检查 API Token 权限
2. 确认 Bucket 名称正确
3. 检查 CORS 配置

### 问题 2: 签名错误

**错误**: `SignatureDoesNotMatch`

**解决方案**:
1. 检查 Access Key 和 Secret Key
2. 确认时间同步（系统时间）
3. 检查请求头格式

### 问题 3: 找不到文件

**错误**: `未找到云端数据`

**解决方案**:
1. 检查 localStorage 中的 `r2_latest_file`
2. 确认文件已上传
3. 查看 R2 Bucket 中的文件列表

---

## 🔄 数据迁移

### 从 GitHub Gist 迁移到 R2

1. 从 Gist 下载数据
2. 切换存储后端为 R2
3. 重新上传数据

```typescript
// 1. 使用 Gist 下载
const data = await cloudStorageService.downloadData(password);

// 2. 切换到 R2（修改 .env）
// VITE_STORAGE_BACKEND=cloudflare_r2

// 3. 上传到 R2
await cloudStorageService.uploadData(data, password);
```

---

## 📝 最佳实践

### 1. 定期备份
- 设置自动备份（已实现）
- 保留多个版本
- 定期验证备份完整性

### 2. 安全管理
- 不要在代码中硬编码凭证
- 使用环境变量或 Secrets
- 定期轮换 API Token

### 3. 性能优化
- 使用 CDN 加速
- 启用压缩
- 合理设置缓存

### 4. 成本控制
- 监控使用量
- 清理旧文件
- 使用生命周期策略

---

## 🎉 完成

配置完成后，系统会自动使用 Cloudflare R2 进行数据备份：

1. ✅ 创建/编辑数据 → 自动备份到 R2
2. ✅ 数据加密存储
3. ✅ 全球 CDN 加速
4. ✅ 无出口流量费用

**享受更快、更可靠的云端存储！** 🚀

---

## 📚 相关文档

- [Cloudflare R2 官方文档](https://developers.cloudflare.com/r2/)
- [S3 API 兼容性](https://developers.cloudflare.com/r2/api/s3/)
- [CORS 配置指南](https://developers.cloudflare.com/r2/buckets/cors/)
- [定价说明](https://developers.cloudflare.com/r2/pricing/)
