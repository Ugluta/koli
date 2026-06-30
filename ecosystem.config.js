// PM2 yapılandırması — bare-metal VPS dağıtımı (Docker'a alternatif).
//
// İlk kurulum:   pm2 start ecosystem.config.js && pm2 save
// Güncelleme:    git pull && npm install && npm run build && pm2 restart ecosystem.config.js --update-env
//
// Gizli değerler ecosystem'e YAZILMAZ; her app kendi .env'inden okur:
//   apps/api/.env            (DATABASE_URL, JWT_SECRET, MEILI/MINIO/SMTP, GOOGLE_PLACES_API_KEY, ...)
//   apps/web/.env.local      (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL)
//
// Portlar nginx.conf.example ile uyumludur: api 4000, web 3001.

module.exports = {
  apps: [
    {
      name: 'koli-api',
      cwd: './apps/api',
      script: 'dist/main.js',          // nest build çıktısı
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'koli-web',
      cwd: './apps/web',
      script: 'npm',
      args: 'start',                    // next start -p 3001
      interpreter: 'none',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
