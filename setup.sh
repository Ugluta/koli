#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
error() { echo -e "${RED}[✗]${NC} $*"; exit 1; }

echo ""
echo "  ██╗  ██╗ ██████╗ ██╗     ██╗"
echo "  ██║ ██╔╝██╔═══██╗██║     ██║"
echo "  █████╔╝ ██║   ██║██║     ██║"
echo "  ██╔═██╗ ██║   ██║██║     ██║"
echo "  ██║  ██╗╚██████╔╝███████╗██║"
echo "  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝"
echo ""
echo "  Avrupa Firma Rehberi — Kurulum Sihirbazı"
echo "  ─────────────────────────────────────────"
echo ""

# ── 1. Gereksinim kontrolleri ─────────────────────────────────────────────────
command -v docker  >/dev/null 2>&1 || error "Docker bulunamadı. https://docs.docker.com/get-docker/"
command -v openssl >/dev/null 2>&1 || error "openssl bulunamadı."

DOCKER_COMPOSE="docker compose"
$DOCKER_COMPOSE version >/dev/null 2>&1 || error "Docker Compose v2 bulunamadı."

info "Docker ve Compose hazır."

# ── 2. .env dosyası ──────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  warn ".env bulunamadı — .env.example'dan oluşturuluyor..."
  cp .env.example .env

  # Rastgele güvenli şifreler üret
  PG_PASS=$(openssl rand -hex 24)
  RD_PASS=$(openssl rand -hex 24)
  MI_PASS=$(openssl rand -hex 24)
  MN_PASS=$(openssl rand -hex 24)
  JWT_SEC=$(openssl rand -hex 64)

  sed -i "s|POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD|POSTGRES_PASSWORD=${PG_PASS}|" .env
  sed -i "s|REDIS_PASSWORD=CHANGE_ME_STRONG_PASSWORD|REDIS_PASSWORD=${RD_PASS}|" .env
  sed -i "s|MEILI_MASTER_KEY=CHANGE_ME_STRONG_PASSWORD|MEILI_MASTER_KEY=${MI_PASS}|" .env
  sed -i "s|MINIO_ROOT_PASSWORD=CHANGE_ME_STRONG_PASSWORD|MINIO_ROOT_PASSWORD=${MN_PASS}|" .env
  sed -i "s|JWT_SECRET=CHANGE_ME_GENERATE_64_BYTE_HEX|JWT_SECRET=${JWT_SEC}|" .env

  info "Güvenli şifreler otomatik oluşturuldu ve .env dosyasına yazıldı."
  echo ""
  warn "ÖNEMLİ: .env dosyasını açıp aşağıdakileri doldurun:"
  warn "  - SITE_URL, FRONTEND_URL, NEXT_PUBLIC_API_URL, ALLOWED_ORIGINS"
  warn "  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM_ADDRESS"
  warn "  - (opsiyonel) IYZICO_API_KEY, IYZICO_SECRET_KEY"
  echo ""
  read -p "  .env dosyasını düzenleyip hazır olduğunuzda Enter'a basın... "
else
  info ".env mevcut, kullanılıyor."
fi

# ── 3. MinIO bucket oluştur ───────────────────────────────────────────────────
setup_minio() {
  info "MinIO bucket oluşturuluyor..."
  source .env
  # MinIO'nun hazır olmasını bekle
  for i in $(seq 1 20); do
    if docker compose -f docker-compose.prod.yml exec -T minio mc alias set local http://localhost:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" >/dev/null 2>&1; then
      break
    fi
    sleep 2
  done
  docker compose -f docker-compose.prod.yml exec -T minio \
    mc mb --ignore-existing local/"${AWS_S3_BUCKET:-koli-media}" 2>/dev/null || true
  docker compose -f docker-compose.prod.yml exec -T minio \
    mc anonymous set download local/"${AWS_S3_BUCKET:-koli-media}" 2>/dev/null || true
  info "MinIO bucket hazır."
}

# ── 4. Servisleri başlat ──────────────────────────────────────────────────────
info "Servisler başlatılıyor (ilk seferde image build ediliyor, ~5 dk sürebilir)..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build

info "MinIO yapılandırılıyor..."
setup_minio

# ── 5. Durum ─────────────────────────────────────────────────────────────────
echo ""
echo "  ─────────────────────────────────────────"
info "Kurulum tamamlandı!"
echo ""
echo "  Servis Durumu:"
$DOCKER_COMPOSE -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "  Erişim URL'leri (Nginx/reverse proxy kurmayı unutmayın):"
source .env
echo "  🌐 Web       → ${SITE_URL:-http://localhost:3000}"
echo "  🔌 API       → ${SITE_URL:-http://localhost:4000}/api/v1"
echo "  🗄️  MinIO UI  → http://localhost:9001  (kullanıcı: ${MINIO_ROOT_USER:-minioadmin})"
echo ""
echo "  Logları görmek için:"
echo "    docker compose -f docker-compose.prod.yml logs -f api"
echo "    docker compose -f docker-compose.prod.yml logs -f web"
echo ""
