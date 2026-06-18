# Koli Şehir Rehberi

Kurumsal, yüksek performanslı, SEO odaklı şehir ve firma rehberi platformu.

## Önkoşullar

- Node.js 20+
- Docker & Docker Compose

## Hızlı Başlangıç

```bash
# 1. Altyapıyı başlat
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# 2. Ortam değişkenlerini kopyala
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# 3. Bağımlılıkları yükle
npm install

# 4. Geliştirme sunucularını başlat
npm run dev
```

## Servisler

| Servis | URL |
|--------|-----|
| Next.js Web | http://localhost:3000 |
| NestJS API | http://localhost:4000 |
| API Docs (Swagger) | http://localhost:4000/docs |
| Meilisearch | http://localhost:7700 |
| MinIO Console | http://localhost:9001 |

## Uygulama Yapısı

```
apps/
  api/     — NestJS backend (port 4000)
  web/     — Next.js frontend (port 3000)
packages/
  shared-types/  — Ortak TypeScript tipleri
infrastructure/
  docker/  — Docker Compose konfigürasyonu
  nginx/   — Nginx konfigürasyonu
```
