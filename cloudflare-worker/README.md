# Cloudflare Worker for R2 Storage

这个 Worker 作为前端和 Cloudflare R2 之间的中间层，处理文件的上传和下载。

## 为什么需要 Worker？

由于浏览器无法直接使用 AWS Signature V4 签名访问 R2，我们需要一个中间层来：
1. 验证请求（API Key）
2. 处理 R2 操作
3. 返回结果给前端

## 部署步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 创建 R2 Bucket

```bash
wrangler r2 bucket create kgkb-data
```

### 4. 设置 API Key Secret

```bash
wrangler secret put API_KEY
# 输入一个强密码，例如：your-secret-api-key-here
```

### 5. 部署 Worker

```bash
cd cloudflare-worker
wrangler deploy
```

### 6. 获取 Worker URL

部署成功后，会显示 Worker URL，例如：
```
https://kgkb-r2-worker.your-account.workers.dev
```

### 7. 配置前端

在 `.env` 文件中添加：

```env
VITE_STORAGE_BACKEND=cloudflare_r2
VITE_R2_WORKER_URL=https://kgkb-r2-worker.your-account.workers.dev
VITE_R2_API_KEY=your-secret-api-key-here
```

## API 接口

### 上传文件

```http
POST /upload
X-API-Key: your-api-key
Content-Type: application/json

{
  "fileName": "kgkb-data-1234567890.enc",
  "data": "encrypted-data-here"
}
```

### 下载文件

```http
GET /download/{fileName}
X-API-Key: your-api-key
```

### 列出文件

```http
GET /list
X-API-Key: your-api-key
```

## 安全配置

### 1. 限制 CORS 来源

修改 `worker.js` 中的 CORS 头：

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-username.github.io',
  // ...
};
```

### 2. 添加速率限制

```javascript
// 使用 Cloudflare KV 存储请求计数
const count = await env.RATE_LIMIT.get(clientIP);
if (count > 100) {
  return new Response('Too Many Requests', { status: 429 });
}
```

### 3. 添加文件大小限制

```javascript
if (data.length > 10 * 1024 * 1024) { // 10MB
  return new Response('File too large', { status: 413 });
}
```

## 监控和日志

### 查看日志

```bash
wrangler tail
```

### 查看分析

访问 Cloudflare Dashboard → Workers → Analytics

## 成本估算

Cloudflare Workers 免费额度：
- 100,000 请求/天
- 10ms CPU 时间/请求

R2 免费额度：
- 10GB 存储
- 1000 万次 Class B 操作（读取）/月
- 100 万次 Class A 操作（写入）/月

对于个人使用，完全在免费额度内！

## 故障排除

### 问题 1: Worker 部署失败

```bash
# 检查配置
wrangler whoami

# 重新登录
wrangler login
```

### 问题 2: R2 Bucket 未绑定

```bash
# 检查 Bucket
wrangler r2 bucket list

# 重新绑定
# 修改 wrangler.toml 中的 bucket_name
```

### 问题 3: API Key 验证失败

```bash
# 重新设置 Secret
wrangler secret put API_KEY
```

## 更新 Worker

修改代码后重新部署：

```bash
wrangler deploy
```

## 删除 Worker

```bash
wrangler delete
```

## 相关文档

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [R2 文档](https://developers.cloudflare.com/r2/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
