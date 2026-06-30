'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

const STATUS_TR: Record<string, string> = {
  draft: 'Taslak', active: 'Aktif', paused: 'Duraklatıldı', ended: 'Bitti', rejected: 'Reddedildi',
};
const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-600',
  ended: 'bg-gray-200 text-gray-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminReklamlar() {
  const [ads, setAds] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const limit = 20;

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/ads/admin/all?page=${p}`);
      setAds(res.data?.data ?? []);
      setTotal(res.data?.meta?.total ?? 0);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(1); }, []);

  const setStatus = async (id: string, status: string) => {
    setActing(id);
    try {
      await apiClient.patch(`/ads/admin/${id}/status`, { status });
      setAds((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    } finally { setActing(null); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const money = (c: number) => (Number(c) / 100).toLocaleString('tr-TR');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reklamlar</h1>
        <span className="text-sm text-gray-400">{total.toLocaleString('tr-TR')} kampanya</span>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kampanya</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Yerleşim</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Bütçe</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Yükleniyor...</td></tr>
            ) : ads.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Kayıt yok</td></tr>
            ) : ads.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 text-gray-800 max-w-xs truncate">{a.name}</td>
                <td className="px-4 py-3 text-gray-500">{a.placement}</td>
                <td className="px-4 py-3 text-right font-medium">{money(a.budgetCents)} ₺</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_TR[a.status] ?? a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {a.status !== 'active' && (
                    <button disabled={acting === a.id} onClick={() => setStatus(a.id, 'active')}
                      className="text-xs text-green-600 hover:underline mr-3 disabled:opacity-40">Onayla</button>
                  )}
                  {a.status !== 'paused' && (
                    <button disabled={acting === a.id} onClick={() => setStatus(a.id, 'paused')}
                      className="text-xs text-yellow-600 hover:underline mr-3 disabled:opacity-40">Duraklat</button>
                  )}
                  {a.status !== 'rejected' && (
                    <button disabled={acting === a.id} onClick={() => setStatus(a.id, 'rejected')}
                      className="text-xs text-red-500 hover:underline disabled:opacity-40">Reddet</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => fetchData(page - 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">← Önceki</button>
          <span className="text-sm text-gray-500">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => fetchData(page + 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Sonraki →</button>
        </div>
      )}
    </div>
  );
}
