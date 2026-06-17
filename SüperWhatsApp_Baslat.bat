@echo off
title Süper WhatsApp Baslatici
color 0b
echo ==========================================
echo        SUPER WHATSAPP BASLATILIYOR
echo ==========================================
echo.

:: Node.js kontrolü
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [HATA] Bilgisayarinizda Node.js kurulu degil!
    echo Lutfen internetten "Node.js indir" yazarak (https://nodejs.org) kurun ve bu dosyayi tekrar acin.
    pause
    exit
)

echo [1/3] Gerekli dosyalar kontrol ediliyor...
if not exist "node_modules" (
    echo [2/3] İlk kurulum yapiliyor (bu islem internet hiziniza gore 1-2 dakika surebilir)...
    call npm install
) else (
    echo [2/3] Kurulum zaten tamamlanmis.
)

echo [3/3] Super WhatsApp asistaniniz calistiriliyor...
echo.
echo Lutfen acilan tarayici penceresinden WhatsApp'a giris yapin!
echo (Eger tarayici acilmazsa, Chrome'u acip adres cubuguna http://localhost:3000 yazin)
echo.
echo ==========================================
echo   DIKKAT: BU SIYAH PENCEREYI KAPATMAYIN!
echo  (Kapatirsaniz Super WhatsApp durur)
echo ==========================================
echo.

:: Tarayıcıyı aç
start "" http://localhost:3000

:: Sunucuyu başlat
node server.js

pause
