# Koli — Yayına Alma (Deployment)

Bu proje tek sunucuda Docker Compose ile çalışacak şekilde tasarlandı.
Web (Next.js) ve API (NestJS) imajları sunucuda `--build` ile üretilir; ayrıca
Postgres, Redis, Meilisearch, MinIO ve otomatik DB yedeği servisleri gelir.

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
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U koli -d koli -c \
  "UPDATE users SET role='super_admin' WHERE email='SIZIN_EPOSTANIZ';"
```

(Önce siteden normal kayıt olup e-postanızı doğrulayın, sonra bu komutu çalıştırın.)

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
