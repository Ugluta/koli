'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

const STATUS_TR: Record<string, string> = {
  draft: 'Taslak', review: 'İncelemede', published: 'Yayında', archived: 'Arşiv',
};
const STATUS_COLOR: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  review: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-600',
  archived: 'bg-red-100 text-red-700',
};
const TYPE_TR: Record<string, string> = { blog: 'Blog', news: 'Haber', event: 'Etkinlik', announcement: 'Duyuru', campaign: 'Kampanya' };
const FILTERS = ['', 'review', 'draft', 'published', 'archived'];

export default function AdminIcerik() {
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const limit = 20;

  const fetchData = async (p = 1, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (status) params.set('status', status);
      const res = await apiClient.get(`/posts/admin/all?${params}`);
      setPosts(res.data?.data ?? []);
      setTotal(res.data?.meta?.total ?? 0);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(1, statusFilter); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = async (id: string, status: string) => {
    setActing(id);
    try {
      await apiClient.patch(`/posts/admin/${id}/status`, { status });
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
    } finally { setActing(null); }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`"${title}" içeriğini silmek istediğinizden emin misiniz?`)) return;
    setActing(id);
    try {
      await apiClient.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => t - 1);
    } finally { setActing(null); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">İçerik Moderasyonu</h1>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f || 'all'}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition ${
              statusFilter === f ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f ? STATUS_TR[f] : 'Tümü'}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Başlık</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tür</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Yükleniyor...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Kayıt yok</td></tr>
            ) : posts.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-gray-800 max-w-md truncate">{p.title}</td>
                <td className="px-4 py-3 text-gray-500">{TYPE_TR[p.postType] ?? p.postType}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_TR[p.status] ?? p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {p.status !== 'published' ? (
                    <button disabled={acting === p.id} onClick={() => setStatus(p.id, 'published')}
                      className="text-xs text-green-600 hover:underline mr-3 disabled:opacity-40">Yayınla</button>
                  ) : (
                    <button disabled={acting === p.id} onClick={() => setStatus(p.id, 'draft')}
                      className="text-xs text-yellow-600 hover:underline mr-3 disabled:opacity-40">Yayından kaldır</button>
                  )}
                  <button disabled={acting === p.id} onClick={() => remove(p.id, p.title)}
                    className="text-xs text-red-500 hover:underline disabled:opacity-40">Sil</button>
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
