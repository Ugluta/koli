# Koli — Proje Özeti, Mimari ve Yol Haritası

> Son güncelleme: 2026-09-12
> Repo: `ugluta/koli` · Branch: `claude/practical-bell-lsgaft` · Domain: ikie.net

---

## 1. Amaç ve Hedef

**Koli**, Türkiye'deki **koli / ambalaj üreticileri** başta olmak üzere işletmeleri
listeleyen bir **firma rehberi (business directory)** platformudur.

### Ana fikir
- Kullanıcı bir kategori (ör. "oluklu mukavva", "streç film") ya da şehir seçer,
  ilgili firmaları bulur.
- Firmalar kayıt olur, profil açar, ürün/hizmet/galeri ekler.
- Üyelik planına göre (ücretsiz → kurumsal) daha fazla görünürlük ve özellik alır.
- Reklam, blog/haber içeriği ve arama ile organik trafik hedeflenir.

### İş modeli
- **Üyelik planları:** free / standard / premium / enterprise (aylık-yıllık ücretli).
- **Reklam:** firma bazlı kampanya, gösterim (impression) ve tıklama (click) takibi.
- **SEO trafiği:** şehir + kategori bazlı landing sayfaları, sitemap, blog/haber.

---

## 2. Mimari (Üst Seviye)

Monorepo — **Turborepo** ile yönetilen iki uygulama + paylaşılan tip paketi:

```
koli/
├── apps/
│   ├── api/     → NestJS (Fastify) backend — REST API
│   └── web/     → Next.js 14 (App Router) frontend — SSR/SSG
├── packages/
│   └── shared-types/  → iki taraf arası ortak TypeScript tipleri
├── docker-compose.prod.yml  → tüm prod stack
├── nginx.conf.example       → reverse proxy + SSL
└── turbo.json               → build/dev pipeline
```

### Prod servis topolojisi (Docker Compose)
| Servis | Görev | Port/Not |
|--------|-------|----------|
| **postgres** (16-alpine) | Ana veritabanı | iç ağ |
| **redis** (7-alpine) | Önbellek / kuyruk | iç ağ |
| **meilisearch** (v1.7) | Full-text arama motoru | iç ağ |
| **minio** | S3 uyumlu dosya/medya deposu | iç ağ |
| **minio-init** | Bucket ilk kurulumu | tek seferlik |
| **api** | NestJS API | 4000 |
| **web** | Next.js | 3001 |
| **db-backup** | Günlük otomatik DB yedeği | cron |

İki ağ: `koli_internal` (servisler arası) ve `koli_public` (dışa açık).
Nginx önde durur, SSL'i (Let's Encrypt) sonlandırır, `/api` → 4000, geri kalan → 3001.

---

## 3. Backend Mimarisi (apps/api — NestJS + Fastify)

### Temel kurallar
- **URI versiyonlama:** tüm rotalar `/api/v1/...` altında.
- **ORM:** TypeORM 0.3.x. Üretimde `synchronize: false`, `migrationsRun: true`
  → şema yalnızca migration dosyalarıyla değişir, açılışta otomatik uygulanır.
- **Auth:** JWT (access + refresh). `JwtAuthGuard` + `RolesGuard` + `@Roles()` dekoratörü.
- **Roller:** `UserRole` enum (ör. `SUPER_ADMIN`).

### Modüller
| Modül | Sorumluluk |
|-------|-----------|
| **auth** | Kayıt, giriş, token yenileme, çıkış, şifre sıfırlama, e-posta doğrulama |
| **geography** | Ülke / şehir / ilçe verisi |
| **categories** | Ağaç yapılı kategoriler (closure table), slug ile erişim |
| **businesses** | Firma listeleme (şehir+kategori filtresi, cursor pagination), detay, oluşturma |
| **products** | Firma ürünleri — panel CRUD + public listeleme endpoint'i |
| **services** | Firma hizmetleri — panel CRUD + public listeleme endpoint'i |
| **posts** | Blog / haber / etkinlik içerikleri |
| **panel** | Firma sahibi yönetim paneli API'si (firma, ürün, hizmet, galeri, istatistik) |
| **admin** | Yönetici: kullanıcı/firma yönetimi, onay akışı, istatistik |
| **search** | Meilisearch çok-indeksli arama + reindex |
| **ads** | Reklam kampanyaları, impression/click takibi, admin onayı |
| **billing** | Iyzico webhook, fatura listesi, plan yükseltme |
| **membership** | Üyelik planları, abonelik sorgulama |
| **seo** | sitemap.xml üretimi, redirect yönetimi |
| **scraper** | RSS/HTML/JSON kaynaklardan içerik çekme, onay kuyruğu, zamanlayıcı |
| **places-scraper** | Google Places API ile firma verisi import (koli üreticileri) |
| **mail** | E-posta şablonları (hoş geldiniz, onay, şifre sıfırlama) |
| **media** | MinIO/S3 presigned URL ile dosya yükleme |
| **health** | `/api/v1/health` sağlık kontrolü |

### Veritabanı notları
- Migration'lar: `apps/api/src/database/migrations/`
  - `1782277885211-InitialSchema` → baz şema
  - `1782277885212-SeedData` → üyelik planları + kategoriler + category_closure (idempotent, `ON CONFLICT DO NOTHING`)
- Eski `synchronize: true` döneminden kalma tablolar olduğu için baseline migration
  manuel "uygulanmış" işaretlendi (çakışmayı önlemek için).

---

## 4. Frontend Mimarisi (apps/web — Next.js 14 App Router)

### Rotalar
| Rota | İçerik |
|------|--------|
| `/` | Ana sayfa |
| `/login`, `/register` | Kimlik doğrulama |
| `/sifremi-unuttum`, `/sifre-sifirla`, `/eposta-dogrula` | Şifre/e-posta akışları |
| `/ara` | Arama — filtreler + sayfalama |
| `/[city]` | Şehir rehberi |
| `/[city]/kategori/[slug]` | Şehir + kategori landing |
| `/kategori/[slug]` | Kategori sayfası (alt kategoriler + firmalar) |
| `/firma/[slug]` | Firma detay — harita, ürün, hizmet, galeri |
| `/ulkeler`, `/ulkeler/[country]` | Ülke rehberi |
| `/haber`, `/haber/[slug]`, `/blog/[slug]` | İçerik sayfaları |
| `/panel/*` | Firma yönetim paneli (firma, ürün, hizmet, galeri, içerik, reklam, scraper, üyelik, istatistikler) |
| `/admin/*` | Yönetici paneli (firma onay/askıya/sil, kullanıcı rol yönetimi) |
| `/sitemap*.xml`, `/robots.txt` | SEO |

### Önemli frontend kararları
- **Middleware** `/panel` ve `/admin`'i `access_token` cookie'sini okuyarak korur,
  ayrıca SEO redirect ve dil yönlendirmesi yapar.
- **apiClient (Axios)** interceptor: 401 alınca otomatik token yenileme yapar.
- Giriş yapınca token hem `localStorage`'a hem **cookie**'ye yazılır
  (middleware cookie okuduğu için ikisi de şart).

---

## 5. Yol Haritası (Durum: ~%75-80 tamam)

### ✅ Tamamlanan
- Tüm backend modülleri (yukarıdaki tablo)
- Tüm ana frontend sayfaları ve panel/admin
- Docker prod stack + SSL + günlük DB yedekleme
- TypeORM migration sistemi + seed verisi (24 kategori, 4 plan)
- Token yaşam döngüsü, CORS, healthcheck düzeltmeleri
- Google Places scraper (kod hazır)
- Public products/services endpoint'leri
- İstatistikler sayfası (gerçek veriye bağlı, tahmini günlük dağılım)

### ⏳ Kalan / Yapılacak
1. **Google Places API anahtarı** gerçek değerle `.env`'e eklenecek → import çalıştırılacak.
2. **Gerçek günlük analytics** (şu an toplam veri güne dağıtılarak tahmin ediliyor).
3. **DB FK eksikleri** (teknik borç): `products.category_id`, `billing_invoices.*`,
   `scraper_items.*`, `ad_campaigns.*` alanlarına foreign key yok.
4. **DTO validation eksikleri:** ads, billing, membership, scraper modüllerinde inline kullanım.
5. `main` branch'e merge (şu an feature branch'te).

---

## 6. Çalıştırma / Deploy Akışı

Yeni sunucuda sıfırdan ayağa kaldırma:

```bash
# 1. Bağımlılıklar + swap
apt update && apt install -y docker.io docker-compose-plugin git
fallocate -l 8G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 2. Kod
git clone -b claude/practical-bell-lsgaft https://github.com/ugluta/koli.git && cd koli

# 3. .env hazırla (gizli anahtarlarla — repoda YOKtur)

# 4. Ayağa kaldır
docker compose -f docker-compose.prod.yml up -d

# 5. Doğrula
docker compose -f docker-compose.prod.yml ps
curl http://127.0.0.1:4000/api/v1/health
```

Migration'lar API açılışında otomatik çalışır (`migrationsRun: true`).

### Doğrulama kontrol listesi
1. `https://ikie.net/api/v1/health` → `{"status":"ok"}`
2. `https://ikie.net/login` → panele giriş
3. `/panel/firma` → kategori açılır menüsü dolu mu?
4. `/ara?q=koli` → arama çalışıyor mu?
5. Admin panelden firma onaylama akışı

---

## 7. ⚠️ HASSAS NOKTALAR, ALINAN KARARLAR VE ÖNLEMLER

> Bu bölüm kritik — özellikle güvenlik.

### 7.1 Sunucu güvenliği (ÖNEMLİ)
- **Eski sunucu (185.237.252.224) hacklenmişti.** Kök dizinde cryptominer binary'leri
  (`/0QPVEy3r`, `/RCLLmEgA5`) ve zararlı `/etc/cron.hourly/free` bulundu; dockerd'yi
  sürekli öldürüyorlardı. Temizlendi ama **sunucu kök erişimiyle ele geçmişti.**
- **KARAR:** Bu yüzden yeni sunucuya (2.27.101.227) geçildi.
- **ÖNLEM (yapılması şart):**
  - Tüm `.env` gizli anahtarları **yenilenecek**: `JWT_SECRET`, DB şifresi,
    `MINIO_SECRET_KEY`, SMTP şifresi, Iyzico anahtarları.
  - Yeni sunucuda ilk iş: `passwd` ile root şifresi değiştir.
  - SSH anahtar tabanlı girişe geç, şifreli girişi kapat.
  - `ufw` firewall + `fail2ban` kur.
  - ⚠️ Root şifresi sohbet içinde açık paylaşıldı → **mutlaka değiştir.**

### 7.2 .env yönetimi
- `.env` dosyası **git'e dahil değildir** (gizli anahtarlar). Her sunucuda elle oluşturulur.
- Eski sunucudaki `.env` ve DB yedeği (varsa) taşınmalı; yoksa sıfırdan güvenli
  değerlerle kurulur, seed otomatik yüklenir.

### 7.3 Migration / veri bütünlüğü kararları
- `synchronize: false` + `migrationsRun: true` benimsendi → prod'da şema sürprizi olmaz.
- Baseline migration manuel "uygulanmış" işaretlendi (eski `synchronize:true` tablolarıyla
  çakışmayı önlemek için). Yeni/boş DB'de bu sorun yok, migration baştan çalışır.
- Seed migration idempotent (`ON CONFLICT DO NOTHING`) → tekrar çalışması güvenli.

### 7.4 Geçmişte çözülen tekrar eden hatalar
| Sorun | Çözüm |
|-------|-------|
| Tarayıcı girişinde CORS 500 | `cb(new Error(...))` → `cb(null, false)` |
| Panel redirect döngüsü | Giriş token'ı cookie'ye de yazılıyor (middleware cookie okuyor) |
| Token yenileme bozuk | `refresh(...)` → `refreshByToken(refreshToken, ip)` |
| Healthcheck yanlış URL | `/api/health` → `/api/v1/health`; `localhost` → `127.0.0.1` (alpine IPv6) |
| places-scraper guard import hatası | Doğru yol `../../common/guards/`; `@Roles(UserRole.SUPER_ADMIN)` |
| "relation already exists" | Baseline migration manuel applied işaretlendi |
| Komutlar "Killed" (swap yok) | 8GB swapfile eklendi |

### 7.5 Altyapı kararları
- Healthcheck'lerde `127.0.0.1` kullanılıyor (alpine'de `localhost` IPv6'ya çözülüp patlıyordu).
- API healthcheck `start_period` 120s (yavaş soğuk başlatma için).
- Günlük otomatik DB yedeği (`db-backup` servisi).

---

## 8. Bilmen Gereken Özet
- Kod GitHub'da güvende, `claude/practical-bell-lsgaft` branch'inde, temiz ve push'lu.
- Sistem ~%75-80 tamam, canlıya alınabilir durumda.
- Kritik iki iş: **(1)** yeni sunucuda güvenli `.env` + secret yenileme,
  **(2)** Google Places API anahtarı ile firma import.
- Güvenlik en öncelikli konu — eski sunucu ele geçmişti, tüm sırlar yenilenmeli.
