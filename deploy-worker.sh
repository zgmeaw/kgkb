#!/bin/bash

echo "========================================"
echo "  Cloudflare Worker 一键部署脚本"
echo "========================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未安装 Node.js"
    echo "请访问 https://nodejs.org/ 下载安装"
    exit 1
fi

echo "✅ Node.js 已安装"
echo ""

# 检查 Wrangler
if ! command -v wrangler &> /dev/null; then
    echo "📦 正在安装 Wrangler CLI..."
    npm install -g wrangler
    if [ $? -ne 0 ]; then
        echo "❌ Wrangler 安装失败"
        exit 1
    fi
    echo "✅ Wrangler 安装成功"
else
    echo "✅ Wrangler 已安装"
fi
echo ""

# 登录 Cloudflare
echo "🔐 正在登录 Cloudflare..."
echo "浏览器将打开，请登录并授权"
wrangler login
if [ $? -ne 0 ]; then
    echo "❌ 登录失败"
    exit 1
fi
echo "✅ 登录成功"
echo ""

# 创建 R2 Bucket
echo "📦 正在创建 R2 Bucket..."
wrangler r2 bucket create kgkb-data
if [ $? -ne 0 ]; then
    echo "⚠️  Bucket 可能已存在，继续..."
else
    echo "✅ Bucket 创建成功"
fi
echo ""

# 设置 API Key
echo "🔑 请设置 API Key（用于前端访问验证）"
echo "建议使用强密码，例如：kgkb-secret-key-2024-随机字符串"
echo ""
wrangler secret put API_KEY
if [ $? -ne 0 ]; then
    echo "❌ API Key 设置失败"
    exit 1
fi
echo "✅ API Key 设置成功"
echo ""

# 部署 Worker
echo "🚀 正在部署 Worker..."
cd cloudflare-worker
wrangler deploy
if [ $? -ne 0 ]; then
    echo "❌ 部署失败"
    cd ..
    exit 1
fi
cd ..
echo "✅ Worker 部署成功"
echo ""

echo "========================================"
echo "  🎉 部署完成！"
echo "========================================"
echo ""
echo "📝 下一步："
echo "1. 复制 Worker URL（上面显示的 https://...workers.dev）"
echo "2. 编辑 .env 文件，添加以下配置："
echo ""
echo "   VITE_STORAGE_BACKEND=cloudflare_r2"
echo "   VITE_R2_WORKER_URL=你的Worker URL"
echo "   VITE_R2_API_KEY=你设置的API Key"
echo ""
echo "3. 运行 npm run build 重新构建"
echo "4. 推送到 GitHub 部署"
echo ""
echo "详细说明请查看 DEPLOY_CLOUDFLARE_WORKER.md"
echo ""
