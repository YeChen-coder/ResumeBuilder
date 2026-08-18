@echo off
setlocal
cd /d "%~dp0"
title Resume Canvas Launcher

netstat -ano | findstr /R /C:":3000 .*LISTENING" >nul
if not errorlevel 1 (
  start "" "http://localhost:3000/"
  exit /b 0
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo Node.js or npm was not found in PATH.
  echo Please reinstall Node.js, then try again.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing Resume Canvas dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting Resume Canvas at http://localhost:3000/ ...
start "Resume Canvas Server" cmd.exe /k "cd /d ""%~dp0"" && npm.cmd run dev"

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$deadline=(Get-Date).AddSeconds(45); do { try { $response=Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3000/' -TimeoutSec 2; if ($response.StatusCode -eq 200) { Start-Process 'http://localhost:3000/'; exit 0 } } catch {}; Start-Sleep -Milliseconds 750 } while ((Get-Date) -lt $deadline); exit 1"

if errorlevel 1 (
  echo.
  echo Resume Canvas did not answer within 45 seconds.
  echo Check the server window for the error message.
  pause
  exit /b 1
)

exit /b 0
