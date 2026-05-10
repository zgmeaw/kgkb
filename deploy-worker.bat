@echo off
chcp 65001 >nul
echo ========================================
echo   Cloudflare Worker 一键部署脚本
echo ========================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误：未安装 Node.js
    echo 请访问 https://nodejs.org/ 下载安装
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
echo.

REM 检查 Wrangler
where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 正在安装 Wrangler CLI...
    call npm install -g wrangler
    if %errorlevel% neq 0 (
        echo ❌ Wrangler 安装失败
        pause
        exit /b 1
    )
    echo ✅ Wrangler 安装成功
) else (
    echo ✅ Wrangler 已安装
)
echo.

REM 登录 Cloudflare
echo 🔐 正在登录 Cloudflare...
echo 浏览器将打开，请登录并授权
call wrangler login
if %errorlevel% neq 0 (
    echo ❌ 登录失败
    pause
    exit /b 1
)
echo ✅ 登录成功
echo.

REM 创建 R2 Bucket
echo 📦 正在创建 R2 Bucket...
call wrangler r2 bucket create kgkb-data
if %errorlevel% neq 0 (
    echo ⚠️  Bucket 可能已存在，继续...
) else (
    echo ✅ Bucket 创建成功
)
echo.

REM 设置 API Key
echo 🔑 请设置 API Key（用于前端访问验证）
echo 建议使用强密码，例如：kgkb-secret-key-2024-随机字符串
echo.
call wrangler secret put API_KEY
if %errorlevel% neq 0 (
    echo ❌ API Key 设置失败
    pause
    exit /b 1
)
echo ✅ API Key 设置成功
echo.

REM 部署 Worker
echo 🚀 正在部署 Worker...
cd cloudflare-worker
call wrangler deploy
if %errorlevel% neq 0 (
    echo ❌ 部署失败
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Worker 部署成功
echo.

echo ========================================
echo   🎉 部署完成！
echo ========================================
echo.
echo 📝 下一步：
echo 1. 复制 Worker URL（上面显示的 https://...workers.dev）
echo 2. 编辑 .env 文件，添加以下配置：
echo.
echo    VITE_STORAGE_BACKEND=cloudflare_r2
echo    VITE_R2_WORKER_URL=你的Worker URL
echo    VITE_R2_API_KEY=你设置的API Key
echo.
echo 3. 运行 npm run build 重新构建
echo 4. 推送到 GitHub 部署
echo.
echo 详细说明请查看 DEPLOY_CLOUDFLARE_WORKER.md
echo.
pause
