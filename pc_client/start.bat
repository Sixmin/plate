@echo off
echo ====================================
echo 小易AI助手 PC客户端启动脚本
echo ====================================
echo.

REM 检查是否安装了Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 请先安装 Node.js 18.0.0 或更高版本
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [信息] Node.js 版本:
node --version

REM 检查是否存在package.json
if not exist "package.json" (
    echo [错误] 未找到 package.json 文件
    echo 请确保在项目根目录下运行此脚本
    pause
    exit /b 1
)

echo [信息] 启动开发服务器...
    pnpm dev
REM 检查是否安装了pnpm
pnpm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [信息] 使用 pnpm 安装依赖...
    pnpm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo.
    
)

pause 