# Koli — Yayına Alma (Deployment)

İki yöntem var. Daha önce başka projeleri PM2 ile (`git pull && npm run build &&
pm2 restart`) yayına aldıysan **Seçenek A** sana tanıdık gelecek. Sıfırdan,
servisleriyle birlikte konteyner istiyorsan **Seçenek B**.

> Koli bir **monorepo**'dur: `apps/api` (NestJS, port 4000) + `apps/web`
> (Next.js, port 3001). Tek Next app'ten farklı olarak PM2 **iki** süreç çalıştırır.

---

## Seçenek A — PM2 (bare-metal VPS, senin akışın)

### A.1 Önkoşullar
- Node.js 20+, `npm`, `pm2` (`npm i -g pm2`)
- Çalışan **PostgreSQL** (zorunlu). Arama için **Meilisearch**, dosya için
  **MinIO/S3**, oturum/cache için **Redis** (opsiyonel ama önerilir) — bunları
  sistemde veya ayrı docker container olarak çalıştırabilirsin.
- 80/443 için ters proxy (`nginx.conf.example`)

### A.2 İlk kurulum
```bash
cd /var/www/koli                 # klasör adını kendine göre değiştir
git clone <repo-url> .

# Ortam değişkenleri (her app kendi dosyasını okur):
cp apps/api/.env.example apps/api/.env          # DATABASE_URL, JWT_SECRET, MEILI/MINIO/SMTP,
                                                # GOOGLE_PLACES_API_KEY, SITE_URL, ALLOWED_ORIGINS...
cp apps/web/.env.local.example apps/web/.env.local   # NEXT_PUBLIC_API_URL=https://site/api/v1

npm install
npm run build                    # turbo: hem api (nest build) hem web (next build)
pm2 start ecosystem.config.js
pm2 save                         # sunucu reboot'unda otomatik kalkması için: pm2 startup
```

- DB migration'ları **API açılışında otomatik** koşar (`migrationsRun: true`).
- `koli-api` → :4000, `koli-web` → :3001 (nginx bunlara yönlendirir).

### A.3 Sonraki güncellemeler (senin alışık olduğun tek satır)
```bash
cd /var/www/koli && git pull && npm install && npm run build && pm2 restart ecosystem.config.js --update-env
```

> `NEXT_PUBLIC_API_URL` web'e **build sırasında** gömülür; değiştirirsen
> `npm run build` tekrar gerekir (yukarıdaki komut zaten build ediyor).

Süper admin atama, nginx ve yedekler için aşağıdaki **ortak adımlara** (bu
dosyanın devamı: "Süper admin kullanıcısı", `nginx.conf.example`, "Yedekler") bak.

---

## Seçenek B — Docker Compose (tek komutla servisleriyle)

Web ve API imajları sunucuda `--build` ile üretilir; Postgres, Redis,
Meilisearch, MinIO ve otomatik DB yedeği servisleri de gelir.

## 1. Sunucu önkoşulları

- Docker + Docker Compose v2
- 80/443 portlarını karşılayan bir ters proxy (örnek: `nginx.conf.example`)
- Repo'nun klonlanacağı bir dizin (ör. `/opt/koli`)

```bash
sudo mkdir -p /opt/koli && cd /opt/koli
git clone <repo-url> .
```

## 2. Ortam değişkenleri

```bash
cp .env.example .env
# .env içindeki tüm CHANGE_ME değerlerini doldurun:
#   POSTGRES_PASSWORD, REDIS_PASSWORD, JWT_SECRET (openssl rand -hex 64),
#   MEILI_MASTER_KEY, MINIO_ROOT_PASSWORD, SMTP_*, SITE_URL / NEXT_PUBLIC_API_URL
# Opsiyonel entegrasyonlar:
#   IYZICO_*           → ödeme (boşsa sandbox)
#   GOOGLE_PLACES_API_KEY → Admin > Scraper firma içe aktarımı
```

> `NEXT_PUBLIC_API_URL` build sırasında web imajına gömülür; değiştirirseniz web
> imajını yeniden build etmeniz gerekir.

## 3. İlk yayın

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

- **DB şeması ve migration'lar API açılışında otomatik koşar**
  (`migrationsRun: true`), ayrı komut gerekmez.
- Seed migration'ları ile gelir: üyelik planları, kategoriler, Türkiye coğrafyası
  ve örnek blog/haber içerikleri.

### Süper admin kullanıcısı

Seed yalnızca girişi kapalı bir editör hesabı oluşturur. Yönetim paneline
(`/admin`) erişmek için bir kullanıcıyı `super_admin` yapın:

```bash
# Siteden normal kayıt olduktan sonra:
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U koli -d koli -c \
  "UPDATE users SET role='super_admin', email_verified=true, is_verified=true
   WHERE email='SIZIN_EPOSTANIZ';"
```

> SMTP'yi henüz kurmadıysanız e-posta doğrulaması yapamazsınız; yukarıdaki komut
> `email_verified`'ı da true yaptığı için doğrulama gerekmeden giriş yapabilirsiniz.

> MinIO `koli-media` bucket'ı `minio-init` servisi tarafından otomatik oluşturulur
> ve public-read yapılır; ayrı bir adım gerekmez.

## 4. Otomatik deploy (GitHub Actions)

`.github/workflows/deploy.yml` manuel tetiklenir (**Actions > Deploy > Run workflow**).
Sunucuya SSH ile bağlanıp `git pull` + `docker compose up -d --build` çalıştırır.

Gerekli repository secrets:

| Secret | Açıklama |
|--------|----------|
| `DEPLOY_HOST` | Sunucu IP/hostname |
| `DEPLOY_USER` | SSH kullanıcısı |
| `DEPLOY_SSH_KEY` | Özel SSH anahtarı (PEM) |
| `DEPLOY_PATH` | Sunucudaki repo dizini (ör. `/opt/koli`) |
| `DEPLOY_PORT` | (opsiyonel) SSH portu, varsayılan 22 |

## 5. CI

`.github/workflows/ci.yml` her push'ta çalışır: tip kontrolü (API + Web),
API testleri, build ve `main`/`master`'da Docker imaj dry-run build'i.

## 6. Yedekler

`db-backup` servisi periyodik `pg_dump` alır; çıktı `./backups` dizinine yazılır.
Yedekleri sunucu dışına (S3/uzak depolama) düzenli olarak kopyalamanız önerilir.
