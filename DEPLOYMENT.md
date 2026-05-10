# 部署指南

## GitHub Pages 部署

### 方式一：自动部署（推荐）

1. **创建GitHub仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/kgkb.git
   git push -u origin main
   ```

2. **启用GitHub Pages**
   - 进入仓库设置 (Settings)
   - 点击左侧菜单的 "Pages"
   - Source 选择 "GitHub Actions"
   - 保存设置

3. **自动部署**
   - 每次推送到 main 分支会自动触发部署
   - 部署完成后访问：`https://你的用户名.github.io/kgkb/`

### 方式二：手动部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **部署到gh-pages分支**
   ```bash
   npm install -g gh-pages
   gh-pages -d dist
   ```

3. **配置GitHub Pages**
   - 进入仓库设置
   - Pages -> Source 选择 "gh-pages" 分支
   - 保存设置

## Cloudflare Pages 部署

### 步骤

1. **登录Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 进入 Pages 页面

2. **创建项目**
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 授权并选择你的GitHub仓库

3. **配置构建设置**
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `20`

4. **部署**
   - 点击 "Save and Deploy"
   - 等待构建完成
   - 访问分配的域名：`https://kgkb.pages.dev`

### 自定义域名

1. 在Cloudflare Pages项目设置中
2. 点击 "Custom domains"
3. 添加你的域名
4. 按照提示配置DNS记录

## Vercel 部署

### 步骤

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```

4. **生产部署**
   ```bash
   vercel --prod
   ```

### 通过GitHub集成

1. 访问 https://vercel.com/
2. 点击 "Import Project"
3. 选择GitHub仓库
4. 配置构建设置（自动检测Vite项目）
5. 点击 "Deploy"

## Netlify 部署

### 步骤

1. **登录Netlify**
   - 访问 https://app.netlify.com/

2. **创建新站点**
   - 点击 "Add new site" -> "Import an existing project"
   - 选择GitHub仓库

3. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **部署**
   - 点击 "Deploy site"
   - 等待构建完成

## 本地预览生产版本

```bash
# 构建
npm run build

# 预览
npm run preview
```

访问 http://localhost:4173

## 环境变量配置

如果需要配置环境变量（如API地址），创建以下文件：

### 开发环境 (.env.development)
```
VITE_APP_TITLE=公考岗位智能分析系统（开发）
```

### 生产环境 (.env.production)
```
VITE_APP_TITLE=公考岗位智能分析系统
```

在代码中使用：
```typescript
const title = import.meta.env.VITE_APP_TITLE;
```

## 常见问题

### 1. 路由404问题

如果部署后刷新页面出现404，需要配置服务器重定向：

**GitHub Pages**: 在 `public` 目录创建 `404.html`，内容与 `index.html` 相同

**Cloudflare Pages**: 在 `public` 目录创建 `_redirects` 文件：
```
/*    /index.html   200
```

**Netlify**: 在 `public` 目录创建 `_redirects` 文件：
```
/*    /index.html   200
```

### 2. 基础路径问题

如果部署在子路径（如 `https://example.com/kgkb/`），需要修改 `vite.config.ts`：

```typescript
export default defineConfig({
  base: '/kgkb/', // 改为你的子路径
  // ...
})
```

### 3. 构建失败

检查Node版本：
```bash
node --version  # 应该是 18.x 或 20.x
```

清除缓存重新安装：
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 性能优化建议

1. **启用Gzip压缩**
   - GitHub Pages 自动启用
   - Cloudflare Pages 自动启用
   - 其他平台查看文档配置

2. **CDN加速**
   - Cloudflare Pages 自带全球CDN
   - GitHub Pages 使用Fastly CDN
   - 可以额外配置Cloudflare CDN

3. **缓存策略**
   - 静态资源自动添加hash，可以长期缓存
   - HTML文件不缓存，确保更新及时

## 监控和分析

### Google Analytics

在 `index.html` 中添加：
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Cloudflare Web Analytics

在Cloudflare Pages项目设置中启用Web Analytics。

## 备份和恢复

### 导出数据
在应用中使用"数据导出"功能，导出JSON文件。

### 导入数据
在应用中使用"数据导入"功能，上传JSON文件。

## 更新部署

### 自动部署
推送代码到main分支即可自动部署：
```bash
git add .
git commit -m "Update features"
git push origin main
```

### 手动部署
```bash
npm run build
# 然后使用对应平台的CLI工具部署
```

## 技术支持

如有问题，请查看：
- [GitHub Issues](https://github.com/你的用户名/kgkb/issues)
- [项目文档](./README.md)
- [开发指南](./DEVELOPMENT.md)
