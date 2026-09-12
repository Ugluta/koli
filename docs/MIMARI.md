# Koli — Detaylı Mimari & Dosya Yapısı

> Son güncelleme: 2026-09-12 · Repo: `ugluta/koli` · Branch: `claude/practical-bell-lsgaft`
> Bu belge projenin tam dosya/klasör yapısını, katman kararlarını ve "ince dokunuşları" anlatır.
> Üst seviye özet için bkz. `docs/PROJE-OZET.md`.

---

## 1. Monorepo Kök Yapısı

```
koli/
├── apps/
│   ├── api/                  → NestJS + Fastify backend
│   └── web/                  → Next.js 14 (App Router) frontend
├── packages/
│   └── shared-types/         → iki uygulamanın paylaştığı TS tipleri
├── infrastructure/
│   ├── docker/docker-compose.yml   → geliştirme/alternatif compose
│   └── nginx/koli.conf             → nginx vhost örneği
├── backups/                  → DB yedek dizini (db-backup servisi yazar)
├── docker-compose.prod.yml   → ÜRETİM stack (asıl kullanılan)
├── nginx.conf.example        → üretim nginx + SSL örneği
├── ecosystem.config.js       → PM2 (docker'sız alternatif çalıştırma)
├── deploy.sh                 → deploy yardımcı script
├── setup.sh / setup.ps1 / setup.bat  → ilk kurulum scriptleri
├── turbo.json                → Turborepo pipeline (build/dev/lint/type-check/test)
├── tsconfig.base.json        → paylaşılan TS ayarları
├── package.json              → workspace kökü (npm workspaces)
├── README.md · DEPLOY.md     → dokümantasyon
└── docs/                     → PROJE-OZET.md · MIMARI.md (bu dosya)
```

**Workspace yönetimi:** npm workspaces (`apps/*`, `packages/*`) + Turborepo.
`turbo run build` bağımlılık sırasına göre (`^build`) önce `shared-types`'ı derler.

---

## 2. packages/shared-types

İki uygulama arasında tek doğruluk kaynağı (enum'lar, DTO arayüzleri, sabitler).

```
packages/shared-types/
├── package.json
└── src/index.ts     → ortak tipler (UserRole, BusinessStatus, plan adları, API response şekli…)
```

> **İnce dokunuş:** API response'u her zaman `{ data, meta }` biçiminde döner —
> bu sözleşme hem backend interceptor'ında hem frontend client'ında uygulanır.

---

## 3. apps/api — Backend (NestJS + Fastify)

### 3.1 Genel yerleşim

```
apps/api/src/
├── main.ts                   → bootstrap: Fastify adapter, CORS, versiyonlama, global pipe/filter/interceptor
├── app.module.ts             → kök modül: TypeORM, ConfigModule, Throttler + tüm feature modülleri
├── common/                   → katmanlar arası (cross-cutting) parçalar
├── database/                 → migration, data-source, seed
└── modules/                  → iş modülleri (her biri controller + service + entity + dto)
```

### 3.2 `common/` — İnce Dokunuşların Kalbi

```
common/
├── decorators/
│   ├── current-user.decorator.ts   → @CurrentUser() ile request'ten kullanıcıyı çeker
│   ├── public.decorator.ts         → @Public() ile rotayı auth guard'dan muaf tutar
│   └── roles.decorator.ts          → @Roles(UserRole.X) rol gereksinimi
├── enums/
│   └── billing-cycle.enum.ts       → aylık/yıllık faturalama döngüsü
├── filters/
│   └── http-exception.filter.ts    → tüm hataları tek tip JSON'a çevirir (Fastify reply)
├── guards/
│   ├── jwt-auth.guard.ts           → access token doğrulama
│   ├── roles.guard.ts              → rol kontrolü
│   └── throttle-auth.guard.ts      → auth uçlarında IP başına 5 istek/dk (brute-force önleme)
├── interceptors/
│   ├── response-transform.interceptor.ts → yanıtı { data, meta } şekline sokar + pagination header
│   └── audit.interceptor.ts        → POST/PATCH/PUT/DELETE işlemlerini audit log'a yazar
└── pipes/
    └── sanitize.pipe.ts            → string'lerden null byte/kontrol karakterlerini temizler, trim'ler
```

**Neden önemli (ince dokunuşlar):**
- **response-transform:** Frontend her zaman `res.data.data` bekleyebilir — tutarlılık.
  Ayrıca mobil istemciler için pagination bilgisini header'a da koyar.
- **sanitize.pipe:** SQL/log kırılmasına ve enjeksiyon denemelerine karşı ilk savunma.
- **throttle-auth.guard:** `x-forwarded-for` okuyarak proxy arkasındaki gerçek IP'yi
  baz alır → login/register/refresh'te brute-force yavaşlatma.
- **audit.interceptor:** Yazma işlemlerinin kim/ne/ne zaman kaydını tutar.

### 3.3 `database/`

```
database/
├── data-source.ts            → TypeORM CLI DataSource (migration üretmek/çalıştırmak için)
├── migrations/               → AKTİF migration'lar (sıralı timestamp)
│   ├── 1782277885211-InitialSchema.ts   → tüm tabloların baz şeması
│   ├── 1782277885212-SeedData.ts        → üyelik planları + kategoriler + category_closure
│   ├── 1782277885213-BillingCycles.ts   → faturalama döngüsü alanları
│   └── 1782277885214-SeedContent.ts     → başlangıç içerik/örnek verisi
├── _archived_migrations/     → eski synchronize dönemi migration'ları (ARŞİV, çalıştırılmaz)
│   └── 001…015_*.ts
└── seeds/
    └── turkey.sql            → Türkiye şehir/ilçe coğrafya verisi (toplu SQL)
```

**Migration politikası:**
- Üretimde `synchronize: false`, `migrationsRun: true` → şema sadece bu dosyalarla değişir,
  API açılışında otomatik uygulanır.
- `_archived_migrations/` eski `synchronize:true` döneminden kalmadır; **aktif değildir**,
  referans/tarihçe için tutulur.
- Seed migration'ları idempotent (`ON CONFLICT DO NOTHING`) → tekrar çalışmak güvenli.

### 3.4 `modules/` — İş Modülleri

Her modül NestJS deseniyle: `*.module.ts` (DI), `*.controller.ts` (HTTP),
`*.service.ts` (iş mantığı), `entities/` (TypeORM), `dto/` (validation).

```
modules/
├── auth/
│   ├── auth.{module,controller,service}.ts
│   ├── dto/{login,register}.dto.ts
│   ├── entities/{user,refresh-token}.entity.ts
│   └── strategies/{jwt,jwt-refresh}.strategy.ts   → Passport JWT stratejileri
├── geography/       → country/city/district entity + controller/service
├── categories/      → ağaç (closure table), slug erişimi
├── businesses/
│   ├── dto/{create,update}-business.dto.ts
│   └── entities/
│       ├── business.entity.ts            → ana firma
│       ├── business-location.entity.ts   → OneToOne konum (lat/lng, adres)
│       ├── business-hours.entity.ts      → OneToMany çalışma saatleri
│       ├── business-social-link.entity.ts→ OneToMany sosyal medya
│       └── business-media.entity.ts      → galeri medyası
├── products/        → entity + product-media + dto + public controller
├── services/        → entity + dto + public controller
├── posts/           → blog/haber/etkinlik (entity + dto)
├── panel/           → firma sahibi paneli API'si (tek controller, çok uç)
├── admin/           → yönetici API'si
├── membership/      → plan + subscription entity'leri
├── billing/
│   ├── entities/billing-invoice.entity.ts
│   └── providers/iyzico.provider.ts      → Iyzico ödeme entegrasyonu
├── ads/             → ad-campaign entity + impression/click
├── scraper/         → source + item entity, scheduler (zamanlanmış çekme)
├── places-scraper/  → Google Places API import
├── search/          → Meilisearch multi-index + reindex
├── seo/             → seo-redirect entity, sitemap/redirect servisi
├── media/           → MinIO/S3 presigned URL
├── mail/
│   ├── mail.service.ts
│   └── templates/*.hbs   → welcome, verify-email, reset-password, business-approved, business-pending
└── health/          → /api/v1/health
```

#### businesses entity ilişkileri (veri modelinin merkezi)
- `business` → `owner` (ManyToOne User)
- `business` → `location` (OneToOne BusinessLocation: lat/lng, adres bileşenleri)
- `business` → `hours[]` (OneToMany BusinessHours)
- `business` → `socialLinks[]` (OneToMany BusinessSocialLink)
- `business` → `media[]` (galeri)
- Metrik alanları: `view_count`, `click_count`, `rating_avg`, `rating_count` (bigint/numeric)
- Durum: `status` (enum: PENDING/…), `is_verified`, `is_featured`

### 3.5 `main.ts` bootstrap sırası (ince dokunuşlar)
- Fastify adapter (Express değil — performans).
- Global `ValidationPipe` + `SanitizePipe`.
- Global `HttpExceptionFilter` (tek tip hata JSON'u).
- Global `ResponseTransformInterceptor` + `AuditInterceptor`.
- URI versiyonlama → tüm rotalar `/api/v1`.
- CORS: reddedilen origin'de `cb(null, false)` (hata fırlatmak 500'e yol açıyordu — düzeltildi).

---

## 4. apps/web — Frontend (Next.js 14 App Router)

### 4.1 Genel yerleşim

```
apps/web/src/
├── middleware.ts             → route koruması + SEO redirect + dil yönlendirme
├── app/                      → App Router sayfaları ve route handler'ları
├── components/               → yeniden kullanılabilir bileşenler
└── lib/                      → client, auth, seo, util yardımcıları
```

### 4.2 `app/` — Sayfa Ağacı

```
app/
├── layout.tsx · page.tsx · globals.css     → kök layout + ana sayfa
├── login/ · sifremi-unuttum/ · sifre-sifirla/ · eposta-dogrula/   → auth akışları
├── ara/
│   ├── page.tsx · SearchFilters.tsx · MobileFilters.tsx   → arama + filtre (mobil ayrı)
├── [city]/
│   ├── page.tsx                          → şehir rehberi
│   └── kategori/[slug]/page.tsx          → şehir + kategori landing (SEO)
├── kategori/[slug]/page.tsx              → kategori sayfası
├── firma/[slug]/page.tsx                 → firma detay (harita, ürün, hizmet)
├── ulkeler/ · ulkeler/[country]/         → ülke rehberi
├── haber/ · haber/[slug]/ · blog/[slug]/ → içerik
├── panel/                                → firma sahibi paneli
│   ├── layout.tsx · page.tsx
│   ├── firma/ · urunler/ · hizmetler/ · galeri/ · icerik/
│   ├── reklamlar/ · scraper/ · istatistikler/
│   └── uyelik/ (+ uyelik/callback/)      → plan yükseltme + ödeme dönüşü
├── admin/                                → yönetici paneli
│   ├── layout.tsx · page.tsx
│   ├── firmalar/ · kullanicilar/ · kategoriler/ · planlar/
│   ├── icerik/ · reklamlar/ · scraper/ · faturalar/
├── robots.txt/route.ts
└── sitemap*.xml + sitemap-businesses/[chunk] + sitemap-posts/[chunk]  → parçalı sitemap
```

> **İnce dokunuş — parçalı sitemap:** firma ve post sayısı büyüyebileceği için
> sitemap `[chunk]` route'larıyla bölünür (50k URL limitine karşı).

### 4.3 `components/`

```
components/
├── ads/AdSlot.tsx            → reklam yuvası (impression/click tetikler)
├── map/BusinessMap.tsx       → firma konumu haritası
├── panel/ProductForm.tsx     → panelde ürün ekleme/düzenleme formu
└── search/SearchBar.tsx      → arama kutusu
```

### 4.4 `lib/`

```
lib/
├── api/client.ts             → Axios instance + 401'de otomatik token yenileme interceptor
├── auth.ts                   → setAuth/clearAuth: token'ı HEM localStorage HEM cookie'ye yazar
├── seo/jsonld.ts             → breadcrumb/organization JSON-LD üretici
└── utils/cn.ts               → className birleştirme (tailwind)
```

### 4.5 `middleware.ts` (kritik güvenlik/akış parçası)
- `/panel` ve `/admin` → `access_token` **cookie**'sini okur; yoksa `/login`'e atar.
- SEO redirect kurallarını uygular.
- **İnce dokunuş:** Login token'ı cookie'ye yazılmazsa middleware hep login'e atardı
  (redirect döngüsü) → bu yüzden `lib/auth.ts` cookie'ye de yazıyor.

---

## 5. Katmanlar Arası Veri Akışı (uçtan uca örnek)

**Kullanıcı "İstanbul'da oluklu mukavva" arar:**
1. `web /ara?q=...&city=istanbul&category=oluklu-mukavva`
2. `lib/api/client.ts` → `GET /api/v1/businesses?city=...&category=...&cursor=...`
3. API `businesses.controller` → `businesses.service` → TypeORM query
   (city.slug + category closure join, cursor pagination)
4. `ResponseTransformInterceptor` → `{ data: [...], meta: { nextCursor } }`
5. Web sayfası kartları render eder; "Daha Fazla" cursor ile devam eder.

**Firma kaydı/onayı:**
1. Kullanıcı `/panel/firma` → `POST /api/v1/panel/...` (JWT guard)
2. Firma `status=PENDING` oluşur; `business-pending.hbs` maili gider.
3. Admin `/admin/firmalar` → onaylar → `status=APPROVED`, `business-approved.hbs` maili.
4. Onaylı firma aramada/kategoride görünür; Meilisearch reindex.

---

## 6. Altyapı (Docker Compose — üretim)

`docker-compose.prod.yml` servisleri ve ağ:

```
koli_public  ─ nginx(SSL) ─┬─ web  (Next.js, 3001)
                           └─ api  (NestJS, 4000)
koli_internal ─ postgres(16) · redis(7) · meilisearch(v1.7) · minio(+mc init)
db-backup ── günlük pg_dump → backups/
```

**İnce dokunuşlar:**
- Healthcheck'ler `127.0.0.1` kullanır (alpine'de `localhost` IPv6'ya çözülüp patlıyordu).
- API healthcheck `start_period: 120s` (yavaş soğuk başlatma).
- İki ayrı ağ: DB/Redis/Meili/MinIO dışarı **kapalı**, sadece iç ağda.
- `infrastructure/` altındaki compose ve nginx geliştirme/alternatif içindir;
  üretimde kök `docker-compose.prod.yml` + `nginx.conf.example` kullanılır.

---

## 7. Özet — Mimari Kararlar
| Karar | Gerekçe |
|-------|---------|
| Monorepo + Turborepo | API/Web ortak tip, tek repo, sıralı build |
| NestJS + Fastify | Modüler, DI, yüksek performans |
| TypeORM migration (synchronize kapalı) | Üretimde şema sürprizi yok |
| `{ data, meta }` response sözleşmesi | Frontend tutarlılığı + pagination |
| Cookie + localStorage ikili token | Middleware cookie okur, client localStorage |
| Closure table (kategoriler) | Ağaç sorgularında performans |
| MinIO (S3 uyumlu) | Self-hosted medya, presigned URL |
| Meilisearch | Hızlı Türkçe full-text arama |
| İki Docker ağı | Veri servislerini dışarı kapatma (güvenlik) |
| sanitize pipe + auth throttle + audit | Savunma katmanları |
```

> Güvenlik olayları (sunucu ele geçirilmesi, secret yenileme) ve geçmiş hata
> düzeltmeleri `docs/PROJE-OZET.md` bölüm 7'de.
