#Requires -Version 5.1
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'

function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "  [X]  $msg" -ForegroundColor Red; Read-Host "Cikmak icin Enter"; exit 1 }
function Coalesce($a, $b) { if ($a) { $a } else { $b } }

Write-Host ""
Write-Host "  Koli - Avrupa Firma Rehberi" -ForegroundColor Cyan
Write-Host "  Kurulum Sihirbazi" -ForegroundColor Cyan
Write-Host "  ------------------------------------------"
Write-Host ""

# ── 1. Docker kontrolü ────────────────────────────────────────────────────────
try { docker --version | Out-Null } catch { Write-Err "Docker bulunamadi. https://www.docker.com/products/docker-desktop" }
try { docker compose version | Out-Null } catch { Write-Err "Docker Compose v2 bulunamadi. Docker Desktop guncel mi?" }
Write-OK "Docker hazir."

# ── 2. .env oluştur ──────────────────────────────────────────────────────────
function New-RandomHex([int]$bytes) {
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $buf = New-Object byte[] $bytes
    $rng.GetBytes($buf)
    ($buf | ForEach-Object { $_.ToString('x2') }) -join ''
}

if (-not (Test-Path '.env')) {
    Write-Warn ".env bulunamadi - olusturuluyor..."
    Copy-Item '.env.example' '.env'

    $content = Get-Content '.env' -Raw
    $content = $content -replace 'POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD', "POSTGRES_PASSWORD=$(New-RandomHex 24)"
    $content = $content -replace 'REDIS_PASSWORD=CHANGE_ME_STRONG_PASSWORD',    "REDIS_PASSWORD=$(New-RandomHex 24)"
    $content = $content -replace 'MEILI_MASTER_KEY=CHANGE_ME_STRONG_PASSWORD',  "MEILI_MASTER_KEY=$(New-RandomHex 24)"
    $content = $content -replace 'MINIO_ROOT_PASSWORD=CHANGE_ME_STRONG_PASSWORD',"MINIO_ROOT_PASSWORD=$(New-RandomHex 24)"
    $content = $content -replace 'JWT_SECRET=CHANGE_ME_GENERATE_64_BYTE_HEX',   "JWT_SECRET=$(New-RandomHex 64)"
    Set-Content '.env' $content -Encoding UTF8

    Write-OK "Guvenli sifreler .env dosyasina yazildi."
    Write-Host ""
    Write-Warn "ONEMLI: Asagidaki alanlari .env dosyasinda doldurmaniz gerekiyor:"
    Write-Host "    SITE_URL, FRONTEND_URL, NEXT_PUBLIC_API_URL, ALLOWED_ORIGINS" -ForegroundColor Yellow
    Write-Host "    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM_ADDRESS" -ForegroundColor Yellow
    Write-Host ""

    Start-Process notepad '.env'
    Read-Host "  .env dosyasini kaydedip kapattiktan sonra Enter'a basin"
} else {
    Write-OK ".env mevcut, kullaniliyor."
}

# ── 3. .env değerlerini yükle ─────────────────────────────────────────────────
$env_vars = @{}
Get-Content '.env' | Where-Object { $_ -match '^([^#][^=]+)=(.*)$' } | ForEach-Object {
    $parts = $_ -split '=', 2
    $env_vars[$parts[0].Trim()] = $parts[1].Trim()
}
$MINIO_USER = Coalesce $env_vars['MINIO_ROOT_USER'] 'minioadmin'
$MINIO_PASS = Coalesce $env_vars['MINIO_ROOT_PASSWORD'] ''
$BUCKET     = Coalesce $env_vars['AWS_S3_BUCKET'] 'koli-media'

# ── 4. Servisleri başlat ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "  [..] Servisler baslatiliyor (ilk seferde ~5 dk surebilir)..." -ForegroundColor White
docker compose -f docker-compose.prod.yml up -d --build
if ($LASTEXITCODE -ne 0) { Write-Err "docker compose hatasi. Loglar icin: docker compose -f docker-compose.prod.yml logs" }
Write-OK "Servisler baslatildi."

# ── 5. MinIO bucket ──────────────────────────────────────────────────────────
Write-Host "  [..] MinIO bucket olusturuluyor..." -ForegroundColor White
$tries = 0
$ready = $false
while (-not $ready -and $tries -lt 20) {
    Start-Sleep -Seconds 3
    $tries++
    docker compose -f docker-compose.prod.yml exec -T minio `
        mc alias set local http://localhost:9000 $MINIO_USER $MINIO_PASS 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { $ready = $true }
}

if ($ready) {
    docker compose -f docker-compose.prod.yml exec -T minio mc mb --ignore-existing "local/$BUCKET" 2>&1 | Out-Null
    docker compose -f docker-compose.prod.yml exec -T minio mc anonymous set download "local/$BUCKET" 2>&1 | Out-Null
    Write-OK "MinIO bucket hazir: $BUCKET"
} else {
    Write-Warn "MinIO henuz hazir degil. http://localhost:9001 adresinden manuel olusturabilirsiniz."
}

# ── 6. Durum raporu ──────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  -------------------------------------------------" -ForegroundColor DarkGray
Write-OK "Kurulum tamamlandi!"
Write-Host ""
Write-Host "  Servis Durumu:" -ForegroundColor White
docker compose -f docker-compose.prod.yml ps
Write-Host ""
Write-Host "  Erisim adresleri:" -ForegroundColor White
Write-Host "    Web     -> http://localhost:3000" -ForegroundColor Cyan
Write-Host "    API     -> http://localhost:4000/api/v1" -ForegroundColor Cyan
Write-Host "    MinIO   -> http://localhost:9001  ($MINIO_USER)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Log takibi:" -ForegroundColor DarkGray
Write-Host "    docker compose -f docker-compose.prod.yml logs -f api" -ForegroundColor DarkGray
Write-Host "    docker compose -f docker-compose.prod.yml logs -f web" -ForegroundColor DarkGray
Write-Host ""
Read-Host "  Cikmak icin Enter"
