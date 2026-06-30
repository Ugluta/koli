#!/usr/bin/env bash
# Koli — PM2 bare-metal deploy/güncelleme script'i.
#
# Kullanım (sunucuda, repo dizininde):
#   git pull && bash deploy.sh
#
# İlk çalıştırmada .env dosyalarını örnekten oluşturur ve durur (doldurman için).
# Doldurduktan sonra tekrar çalıştır → kurar, derler, PM2'yi başlatır/yeniler.
# NOT: Veritabanı (PostgreSQL) ayrıca hazır olmalı; bu script DB oluşturmaz.

set -euo pipefail
cd "$(dirname "$0")"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info() { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }

FIRST=0
if [ ! -f apps/api/.env ]; then
  cp apps/api/.env.example apps/api/.env
  warn "apps/api/.env oluşturuldu — DATABASE_URL, JWT_SECRET, SITE_URL'i doldur."
  FIRST=1
fi
if [ ! -f apps/web/.env.local ]; then
  cp apps/web/.env.local.example apps/web/.env.local
  warn "apps/web/.env.local oluşturuldu — NEXT_PUBLIC_API_URL'i doldur."
  FIRST=1
fi

if [ "$FIRST" = "1" ]; then
  echo ""
  warn "İlk kurulum: .env dosyalarını doldurup script'i TEKRAR çalıştır."
  exit 0
fi

info "Bağımlılıklar kuruluyor..."
npm install

info "Projeler derleniyor (api + web)..."
npm run build

if pm2 describe koli-api >/dev/null 2>&1; then
  info "PM2 süreçleri yenileniyor..."
  pm2 restart ecosystem.config.js --update-env
else
  info "PM2 süreçleri ilk kez başlatılıyor..."
  pm2 start ecosystem.config.js
  pm2 save
fi

pm2 status
echo ""
info "Bitti. API:4000  Web:3001  — loglar: pm2 logs koli-api"
