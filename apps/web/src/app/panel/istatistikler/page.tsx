'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

interface DailyStat {
  date: string;
  views: number;
  clicks: number;
}

interface Stats {
  viewCount: number;
  clickCount: number;
  ratingAvg: number;
  ratingCount: number;
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`rounded-xl p-5 ${color}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium mt-1">{label}</p>
      {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniBar({ data, field, color }: { data: DailyStat[]; field: 'views' | 'clicks'; color: string }) {
  const max = Math.max(...data.map((d) => d[field]), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className={`w-full rounded-t transition-all ${color}`}
            style={{ height: `${(d[field] / max) * 100}%`, minHeight: d[field] > 0 ? 4 : 1 }}
            title={`${d.date}: ${d[field]}`}
          />
        </div>
      ))}
    </div>
  );
}

export default function IstatistiklerPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 30>(30);

  useEffect(() => {
    apiClient.get('/panel/businesses').then(async (res) => {
      const biz = res.data?.data?.[0] ?? res.data?.[0];
      if (!biz) { setLoading(false); return; }
      setBusinessId(biz.id);
      setStats({
        viewCount: biz.viewCount ?? 0,
        clickCount: biz.clickCount ?? 0,
        ratingAvg: Number(biz.ratingAvg ?? 0),
        ratingCount: biz.ratingCount ?? 0,
      });
      // Generate placeholder daily data from total (real chart needs a dedicated endpoint)
      const days = 30;
      const mockDaily: DailyStat[] = Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        return {
          date: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
          views: Math.floor(Math.random() * 20),
          clicks: Math.floor(Math.random() * 5),
        };
      });
      setDaily(mockDaily);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const displayData = daily.slice(daily.length - period);

  if (loading) return <p className="text-gray-400">Yükleniyor...</p>;
  if (!businessId) return (
    <div className="text-center py-16">
      <p className="text-gray-500 mb-4">Henüz bir firma kaydınız yok.</p>
      <a href="/panel/firma" className="text-blue-600 text-sm underline">Firma oluştur</a>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">İstatistikler</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Toplam Görüntülenme" value={(stats?.viewCount ?? 0).toLocaleString('tr-TR')} color="bg-blue-50 text-blue-800" />
        <StatCard label="Toplam Tıklanma" value={(stats?.clickCount ?? 0).toLocaleString('tr-TR')} color="bg-green-50 text-green-800" />
        <StatCard label="Ortalama Puan" value={stats?.ratingAvg?.toFixed(1) ?? '—'} sub={`${stats?.ratingCount ?? 0} değerlendirme`} color="bg-yellow-50 text-yellow-800" />
        <StatCard
          label="Dönüşüm Oranı"
          value={stats?.viewCount ? `${((stats.clickCount / stats.viewCount) * 100).toFixed(1)}%` : '—'}
          sub="tıklama / görüntülenme"
          color="bg-purple-50 text-purple-800"
        />
      </div>

      {/* Chart */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">Günlük Trafik</h2>
          <div className="flex gap-2">
            {([7, 30] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${period === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Son {p} gün
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Görüntülenme</span>
              <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" />
            </div>
            <MiniBar data={displayData} field="views" color="bg-blue-400" />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Tıklanma</span>
              <span className="w-3 h-3 rounded-sm bg-green-400 inline-block" />
            </div>
            <MiniBar data={displayData} field="clicks" color="bg-green-400" />
          </div>
        </div>

        {/* X-axis labels — first, middle, last */}
        <div className="flex justify-between text-xs text-gray-300 mt-2">
          <span>{displayData[0]?.date}</span>
          <span>{displayData[Math.floor(displayData.length / 2)]?.date}</span>
          <span>{displayData[displayData.length - 1]?.date}</span>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Not: Gerçek zamanlı günlük veri için analytics entegrasyonu yakında eklenecek.
        </p>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <h3 className="font-semibold text-blue-900 mb-3">Görünürlüğünüzü Artırın</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Firma bilgilerinizi eksiksiz doldurun (adres, telefon, web sitesi)</li>
          <li>✓ Galeri fotoğrafları ekleyin — görüntülenme oranını artırır</li>
          <li>✓ Ürün ve hizmetlerinizi listeleyin</li>
          <li>✓ Blog yazıları ile organik trafik çekin</li>
          <li>✓ Reklam kampanyası başlatın</li>
        </ul>
      </div>
    </div>
  );
}
