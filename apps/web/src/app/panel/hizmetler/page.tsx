'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

interface Service {
  id: string;
  name: string;
  priceMin: number | null;
  priceMax: number | null;
  priceUnit: string | null;
  durationMinutes: number | null;
  status: string;
}

function ServiceForm({ businessId, onSuccess }: { businessId: string; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [priceUnit, setPriceUnit] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post(`/panel/businesses/${businessId}/services`, {
        name,
        description: description || undefined,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        priceUnit: priceUnit || undefined,
        durationMinutes: duration ? Number(duration) : undefined,
      });
      setName(''); setPriceMin(''); setPriceMax(''); setPriceUnit(''); setDuration(''); setDescription('');
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Yeni Hizmet Ekle</h3>
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hizmet Adı *</label>
        <input
          value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Örn: Web Tasarım"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min. Fiyat (TRY)</label>
          <input
            type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} min="0" step="0.01"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max. Fiyat (TRY)</label>
          <input
            type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} min="0" step="0.01"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Birim</label>
          <input
            value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="saat / proje / ay"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Süre (dakika)</label>
          <input
            type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min="0"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="60"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit" disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Kaydediliyor...' : 'Hizmet Ekle'}
      </button>
    </form>
  );
}

export default function HizmetlerPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchServices = async (bId: string) => {
    const res = await apiClient.get(`/panel/businesses/${bId}/services`);
    setServices(res.data?.data ?? res.data ?? []);
  };

  useEffect(() => {
    apiClient.get('/panel/businesses')
      .then(async (res) => {
        const id = res.data?.data?.[0]?.id;
        if (id) { setBusinessId(id); await fetchServices(id); }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (serviceId: string) => {
    if (!businessId || !confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) return;
    setDeleting(serviceId);
    try {
      await apiClient.delete(`/panel/businesses/${businessId}/services/${serviceId}`);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } finally {
      setDeleting(null);
    }
  };

  const formatPrice = (s: Service) => {
    if (s.priceMin && s.priceMax) return `${Number(s.priceMin).toLocaleString('tr-TR')} – ${Number(s.priceMax).toLocaleString('tr-TR')} ₺`;
    if (s.priceMin) return `${Number(s.priceMin).toLocaleString('tr-TR')} ₺~`;
    return '—';
  };

  if (loading) return <p className="text-gray-400">Yükleniyor...</p>;
  if (!businessId) return (
    <div className="text-center py-16">
      <p className="text-gray-500 mb-4">Henüz bir firma kaydınız yok.</p>
      <a href="/panel/firma" className="text-blue-600 text-sm underline">Firma oluştur</a>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Hizmetler</h1>
        <span className="text-sm text-gray-400">{services.length} hizmet</span>
      </div>
      <ServiceForm businessId={businessId} onSuccess={() => fetchServices(businessId)} />
      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{s.name}</p>
              <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                {s.durationMinutes && <span>⏱ {s.durationMinutes} dk</span>}
                {s.priceUnit && <span>/ {s.priceUnit}</span>}
                <span className={`capitalize ${s.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>{s.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold text-gray-700">{formatPrice(s)}</p>
              <button
                onClick={() => handleDelete(s.id)}
                disabled={deleting === s.id}
                className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">Henüz hizmet eklenmemiş.</p>
        )}
      </div>
    </div>
  );
}
