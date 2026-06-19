'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

interface Campaign {
  id: string;
  name: string;
  placement: string;
  status: string;
  budgetCents: number;
  spentCents: number;
  impressionCount: number;
  clickCount: number;
  startsAt: string | null;
  endsAt: string | null;
}

const PLACEMENTS = [
  { value: 'city_top_banner', label: 'Şehir Üst Banner' },
  { value: 'city_sidebar', label: 'Şehir Kenar Çubuğu' },
  { value: 'business_list_inline', label: 'Firma Listesi Arası' },
  { value: 'business_detail_sidebar', label: 'Firma Detay Yan' },
  { value: 'post_detail_inline', label: 'İçerik Detay Arası' },
  { value: 'homepage_hero', label: 'Ana Sayfa Hero' },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  ended: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-600',
};

const STATUS_TR: Record<string, string> = {
  draft: 'Taslak', active: 'Aktif', paused: 'Duraklatıldı', ended: 'Bitti', rejected: 'Reddedildi',
};

export default function ReklamlarPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    placement: 'city_top_banner',
    ctaUrl: '',
    title: '',
    description: '',
    imageUrl: '',
    budgetCents: 10000,
    bidCents: 100,
    targetType: 'cpm',
    startsAt: '',
    endsAt: '',
  });

  useEffect(() => {
    apiClient.get('/ads/mine').then((r) => setCampaigns(r.data.data ?? [])).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        budgetCents: Number(form.budgetCents),
        bidCents: Number(form.bidCents),
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        imageUrl: form.imageUrl || null,
        description: form.description || null,
        title: form.title || null,
      };
      const r = await apiClient.post('/ads', payload);
      setCampaigns((p) => [r.data, ...p]);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function viewStats(c: Campaign) {
    setSelected(c);
    const r = await apiClient.get(`/ads/mine/${c.id}/stats?days=30`);
    setStats(r.data);
  }

  const ctr = (c: Campaign) =>
    c.impressionCount > 0 ? ((c.clickCount / c.impressionCount) * 100).toFixed(2) : '0.00';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reklamlarım</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          + Yeni Kampanya
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Kampanya Adı</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yerleşim</label>
              <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {PLACEMENTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hedefleme</label>
              <select value={form.targetType} onChange={(e) => setForm({ ...form, targetType: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="cpm">CPM (1000 görüntüleme başı)</option>
                <option value="cpc">CPC (tıklama başı)</option>
                <option value="flat">Sabit Ücret</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bütçe (kuruş)</label>
              <input type="number" min={0} value={form.budgetCents} onChange={(e) => setForm({ ...form, budgetCents: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teklif (kuruş)</label>
              <input type="number" min={0} value={form.bidCents} onChange={(e) => setForm({ ...form, bidCents: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Hedef URL *</label>
              <input required value={form.ctaUrl} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Başlık</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Görsel URL</label>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Başlangıç</label>
              <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bitiş</label>
              <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
              {saving ? 'Kaydediliyor...' : 'Oluştur'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">İptal</button>
          </div>
        </form>
      )}

      {/* Stats modal */}
      {selected && stats && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{selected.name} — İstatistikler (30 gün)</h2>
              <button onClick={() => { setSelected(null); setStats(null); }} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{stats.totals.impressions.toLocaleString()}</div>
                <div className="text-xs text-blue-600 mt-1">Görüntülenme</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{stats.totals.clicks.toLocaleString()}</div>
                <div className="text-xs text-green-600 mt-1">Tıklama</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {(stats.totals.spentCents / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </div>
                <div className="text-xs text-purple-600 mt-1">Harcama</div>
              </div>
            </div>
            <div className="overflow-auto max-h-64">
              <table className="w-full text-xs">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left px-3 py-2">Tarih</th>
                  <th className="text-right px-3 py-2">Görüntülenme</th>
                  <th className="text-right px-3 py-2">Tıklama</th>
                  <th className="text-right px-3 py-2">Harcama</th>
                </tr></thead>
                <tbody className="divide-y">
                  {stats.daily.map((d: any) => (
                    <tr key={d.date}>
                      <td className="px-3 py-1.5">{d.date}</td>
                      <td className="px-3 py-1.5 text-right">{d.impressions}</td>
                      <td className="px-3 py-1.5 text-right">{d.clicks}</td>
                      <td className="px-3 py-1.5 text-right">{(d.spentCents / 100).toFixed(2)} ₺</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kampanya</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Bütçe</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Harcama</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Görüntü</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Tık / CTR</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-400">{PLACEMENTS.find((p) => p.value === c.placement)?.label ?? c.placement}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_TR[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{(c.budgetCents / 100).toFixed(2)} ₺</td>
                  <td className="px-4 py-3 text-right text-gray-600">{(c.spentCents / 100).toFixed(2)} ₺</td>
                  <td className="px-4 py-3 text-right text-gray-600">{c.impressionCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{c.clickCount} / {ctr(c)}%</td>
                  <td className="px-4 py-3">
                    <button onClick={() => viewStats(c)} className="text-blue-600 hover:text-blue-800 text-xs">
                      İstatistik
                    </button>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Henüz kampanya yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
