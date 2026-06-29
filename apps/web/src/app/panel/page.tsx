'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

interface Stats {
  viewCount: number;
  productCount: number;
  serviceCount: number;
  postCount: number;
  pendingScraperItems: number;
  activeCampaigns: number;
  planName: string;
}

const QUICK_LINKS = [
  { label: 'İçerik Ekle', href: '/panel/icerik', icon: '✍️', desc: 'Yeni blog veya haber yaz' },
  { label: 'Ürün Ekle', href: '/panel/urunler', icon: '📦', desc: 'Ürün kataloğunu güncelle' },
  { label: 'Scraper Kuyruğu', href: '/panel/scraper', icon: '🤖', desc: 'Bekleyen içerikleri onayla' },
  { label: 'Reklam Oluştur', href: '/panel/reklamlar', icon: '📢', desc: 'Yeni kampanya başlat' },
];

export default function PanelDashboard() {
  const [stats, setStats] = useState<Partial<Stats>>({});
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState<string>('');

  useEffect(() => {
    Promise.allSettled([
      apiClient.get('/panel/businesses'),
      apiClient.get('/membership/my'),
      apiClient.get('/scraper/queue?limit=1'),
      apiClient.get('/ads/mine?limit=1'),
    ]).then(([bizRes, subRes, queueRes, adsRes]) => {
      const biz = bizRes.status === 'fulfilled' ? bizRes.value.data?.data?.[0] : null;
      if (biz) {
        setBusinessName(biz.name ?? '');
        setStats((s) => ({
          ...s,
          viewCount: biz.viewCount ?? 0,
        }));
      }

      if (subRes.status === 'fulfilled') {
        const sub = subRes.value.data?.data ?? subRes.value.data;
        setStats((s) => ({ ...s, planName: sub?.plan?.displayName ?? sub?.plan?.name ?? 'Ücretsiz' }));
      }

      if (queueRes.status === 'fulfilled') {
        setStats((s) => ({ ...s, pendingScraperItems: queueRes.value.data?.meta?.total ?? 0 }));
      }

      if (adsRes.status === 'fulfilled') {
        const active = (adsRes.value.data?.data ?? []).filter((c: any) => c.status === 'active').length;
        setStats((s) => ({ ...s, activeCampaigns: active }));
      }
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Firma Görüntülenme', value: stats.viewCount?.toLocaleString('tr-TR') ?? '—', icon: '👁️', color: 'bg-blue-50 text-blue-700' },
    { label: 'Aktif Plan', value: stats.planName ?? '—', icon: '⭐', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Scraper Kuyruğu', value: stats.pendingScraperItems?.toString() ?? '—', icon: '🤖', color: 'bg-purple-50 text-purple-700' },
    { label: 'Aktif Reklam', value: stats.activeCampaigns?.toString() ?? '—', icon: '📢', color: 'bg-green-50 text-green-700' },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {businessName ? `${businessName} — Dashboard` : 'Dashboard'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Hoş geldiniz. Aşağıda işletmenizin özeti yer alıyor.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-xl p-4 ${card.color}`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-xl font-bold">{loading ? '...' : card.value}</div>
            <div className="text-xs mt-1 opacity-70">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-lg font-semibold mb-4">Hızlı İşlemler</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-4 bg-white border rounded-xl p-4 hover:shadow-md transition-shadow group"
          >
            <span className="text-2xl">{link.icon}</span>
            <div>
              <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {link.label}
              </div>
              <div className="text-xs text-gray-400">{link.desc}</div>
            </div>
            <span className="ml-auto text-gray-300 group-hover:text-blue-400 transition-colors">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
