@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Resume Canvas

if not exist "node_modules" (
  echo 首次启动，正在安装本地依赖...
  call npm install
)

echo.
echo Resume Canvas 正在启动...
echo 浏览器地址：http://localhost:3000
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"
call npm run dev
