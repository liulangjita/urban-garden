@echo off
echo ========================================
echo 城市菜地前端启动脚本
echo ========================================
echo.

echo 正在检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo 正在启动前端开发服务器...
cd frontend
npm install
npm run dev
cd ..

pause