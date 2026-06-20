@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

echo.
echo   ██╗  ██╗ ██████╗ ██╗     ██╗
echo   ██║ ██╔╝██╔═══██╗██║     ██║
echo   █████╔╝ ██║   ██║██║     ██║
echo   ██╔═██╗ ██║   ██║██║     ██║
echo   ██║  ██╗╚██████╔╝███████╗██║
echo   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝
echo.
echo   Avrupa Firma Rehberi - Kurulum
echo   --------------------------------
echo.

:: ── 1. Docker kontrolü ────────────────────────────────────────────────────────
docker --version >nul 2>&1
if errorlevel 1 (
    echo [HATA] Docker bulunamadi.
    echo        https://www.docker.com/products/docker-desktop adresinden indirin.
    pause & exit /b 1
)

docker compose version >nul 2>&1
if errorlevel 1 (
    echo [HATA] Docker Compose v2 bulunamadi. Docker Desktop guncel mi?
    pause & exit /b 1
)

echo [OK] Docker hazir.

:: ── 2. .env dosyası ──────────────────────────────────────────────────────────
if not exist .env (
    echo [!]  .env bulunamadi - olusturuluyor...
    copy .env.example .env >nul

    :: PowerShell ile rastgele şifreler üret
    for /f %%i in ('powershell -NoProfile -Command "[System.BitConverter]::ToString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(24)) -replace '-',''" 2^>nul') do set PG_PASS=%%i
    for /f %%i in ('powershell -NoProfile -Command "[System.BitConverter]::ToString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(24)) -replace '-',''" 2^>nul') do set RD_PASS=%%i
    for /f %%i in ('powershell -NoProfile -Command "[System.BitConverter]::ToString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(24)) -replace '-',''" 2^>nul') do set MI_PASS=%%i
    for /f %%i in ('powershell -NoProfile -Command "[System.BitConverter]::ToString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(24)) -replace '-',''" 2^>nul') do set MN_PASS=%%i
    for /f %%i in ('powershell -NoProfile -Command "[System.BitConverter]::ToString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64)) -replace '-',''" 2^>nul') do set JWT_SEC=%%i

    powershell -NoProfile -Command ^
        "(Get-Content .env) ^
        -replace 'POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD', 'POSTGRES_PASSWORD=!PG_PASS!' ^
        -replace 'REDIS_PASSWORD=CHANGE_ME_STRONG_PASSWORD',    'REDIS_PASSWORD=!RD_PASS!' ^
        -replace 'MEILI_MASTER_KEY=CHANGE_ME_STRONG_PASSWORD',  'MEILI_MASTER_KEY=!MI_PASS!' ^
        -replace 'MINIO_ROOT_PASSWORD=CHANGE_ME_STRONG_PASSWORD','MINIO_ROOT_PASSWORD=!MN_PASS!' ^
        -replace 'JWT_SECRET=CHANGE_ME_GENERATE_64_BYTE_HEX',   'JWT_SECRET=!JWT_SEC!' ^
        | Set-Content .env"

    echo [OK] Guvenli sifreler olusturuldu ve .env dosyasina yazildi.
    echo.
    echo   [ONEMLI] .env dosyasini not defteri ile acip doldurun:
    echo     - SITE_URL, FRONTEND_URL, NEXT_PUBLIC_API_URL, ALLOWED_ORIGINS
    echo     - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM_ADDRESS
    echo.
    echo   Hazir olunca bu pencereye geri gelin.
    echo.

    :: Notepad ile .env aç
    start notepad .env
    pause
) else (
    echo [OK] .env mevcut, kullaniliyor.
)

:: ── 3. Servisleri başlat ──────────────────────────────────────────────────────
echo.
echo [..] Servisler baslatiliyor (ilk seferde build edilir, ~5 dk surebilir)...
docker compose -f docker-compose.prod.yml up -d --build
if errorlevel 1 (
    echo [HATA] docker compose baslatma hatasi.
    echo        Loglari gormek icin: docker compose -f docker-compose.prod.yml logs
    pause & exit /b 1
)

echo [OK] Servisler ayaga kalktı.

:: ── 4. MinIO bucket oluştur ──────────────────────────────────────────────────
echo [..] MinIO bucket olusturuluyor...

:: .env'den değerleri oku
for /f "tokens=1,* delims==" %%a in (.env) do (
    if "%%a"=="MINIO_ROOT_USER"     set MINIO_ROOT_USER=%%b
    if "%%a"=="MINIO_ROOT_PASSWORD" set MINIO_ROOT_PASSWORD=%%b
    if "%%a"=="AWS_S3_BUCKET"       set AWS_S3_BUCKET=%%b
)
if "!AWS_S3_BUCKET!"=="" set AWS_S3_BUCKET=koli-media

:: MinIO hazır olana kadar bekle
set /a TRY=0
:MINIO_WAIT
set /a TRY+=1
if !TRY! gtr 20 goto MINIO_SKIP
docker compose -f docker-compose.prod.yml exec -T minio ^
    mc alias set local http://localhost:9000 "!MINIO_ROOT_USER!" "!MINIO_ROOT_PASSWORD!" >nul 2>&1
if errorlevel 1 (
    timeout /t 3 /nobreak >nul
    goto MINIO_WAIT
)

docker compose -f docker-compose.prod.yml exec -T minio mc mb --ignore-existing local/!AWS_S3_BUCKET! >nul 2>&1
docker compose -f docker-compose.prod.yml exec -T minio mc anonymous set download local/!AWS_S3_BUCKET! >nul 2>&1
echo [OK] MinIO bucket hazir: !AWS_S3_BUCKET!
goto MINIO_DONE

:MINIO_SKIP
echo [!]  MinIO henuz hazir degil. Daha sonra manuel olusturabilirsiniz:
echo      http://localhost:9001  (MinIO Console)
:MINIO_DONE

:: ── 5. Durum raporu ──────────────────────────────────────────────────────────
echo.
echo   ─────────────────────────────────────────
echo [OK] Kurulum tamamlandi!
echo.
echo   Servis Durumu:
docker compose -f docker-compose.prod.yml ps
echo.
echo   Erisim URL'leri:
echo     Web       http://localhost:3000
echo     API       http://localhost:4000/api/v1
echo     MinIO UI  http://localhost:9001
echo.
echo   Log takibi icin:
echo     docker compose -f docker-compose.prod.yml logs -f api
echo     docker compose -f docker-compose.prod.yml logs -f web
echo.
pause
