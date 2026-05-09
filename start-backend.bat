@echo off
echo ========================================
echo 城市菜地项目启动脚本
echo ========================================
echo.

echo 正在检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Python，请先安装Python
    pause
    exit /b 1
)

echo 正在启动后端服务...
cd server
pip install -r requirements.txt -q
python admin.py
cd ..

echo 服务已启动
echo 后台管理地址: http://localhost:5001
pause