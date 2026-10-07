@echo off
:: Thiet lap bang ma UTF-8 cho console
chcp 65001 >nul
set PYTHONIOENCODING=utf-8

:: Chuyen thu muc lam viec ve chinh xac thu muc chua file bat nay
cd /d "%~dp0"

title Phasmophobia Investigation Journal
cls
echo ========================================================
echo   KHOI DONG CUON SO TAY PHASMOPHOBIA JOURNAL (VIET SUB)
echo ========================================================
echo [1] Thu muc goc: %~dp0
echo [2] Dang khoi dong may chu Python va mo trinh duyet...
echo ========================================================

:: Kiem tra lenh python hoac py
where python >nul 2>&1
if %ERRORLEVEL% equ 0 (
    python "%~dp0app.py"
    goto end
)

where py >nul 2>&1
if %ERRORLEVEL% equ 0 (
    py "%~dp0app.py"
    goto end
)

echo [LOI] Khong tim thay Python tren may tinh cua ban!
echo Vui long cai dat Python hoac them Python vao bien moi truong PATH.

:end
pause
