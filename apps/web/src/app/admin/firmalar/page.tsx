'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede', active: 'Aktif', draft: 'Taslak',
  suspended: 'Askıda', deleted: 'Silindi',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  suspended: 'bg-red-100 text-red-700',
  deleted: 'bg-red-200 text-red-900',
};

function FirmalarList() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') ?? '';
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await apiClient.get(`/admin/businesses?${params}`);
      setBusinesses(res.data?.data ?? []);
      setTotal(res.data?.meta?.total ?? 0);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(1); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: string) => {
    setActing(id);
    try {
      await apiClient.patch(`/admin/businesses/${id}/status`, { status });
      setBusinesses((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    } finally { setActing(null); }
  };

  const deleteBiz = async (id: string, name: string) => {
    if (!confirm(`"${name}" firmasını kalıcı olarak silmek istediğinizden emin misiniz?`)) return;
    setActing(id);
    try {
      await apiClient.delete(`/admin/businesses/${id}`);
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
      setTotal((t) => t - 1);
    } finally { setActing(null); }
  };

  const filterBtns = [
    { label: 'Tümü', value: '' },
    { label: 'Bekleyen', value: 'pending' },
    { label: 'Aktif', value: 'active' },
    { label: 'Askıda', value: 'suspended' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Firmalar</h1>
        <span className="text-sm text-gray-400">{total} firma</span>
      </div>

      <div className="flex gap-2">
        {filterBtns.map((f) => (
          <a key={f.value} href={f.value ? `/admin/firmalar?status=${f.value}` : '/admin/firmalar'}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${statusFilter === f.value ? 'bg-red-600 text-white border-red-600' : 'bg-white hover:border-gray-400'}`}>
            {f.label}
          </a>
        ))}
      </div>

      {loading ? <p className="text-gray-400">Yükleniyor...</p> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Firma</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Şehir</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {businesses.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <a href={`/firma/${b.slug}`} target="_blank" rel="noopener noreferrer"
                        className="font-medium text-gray-900 hover:text-blue-600">{b.name}</a>
                      <p className="text-xs text-gray-400 mt-0.5">{b.id.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.location?.city?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[b.status] ?? b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      {b.status !== 'active' && (
                        <button onClick={() => updateStatus(b.id, 'active')} disabled={acting === b.id}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-40">
                          Onayla
                        </button>
                      )}
                      {b.status !== 'suspended' && (
                        <button onClick={() => updateStatus(b.id, 'suspended')} disabled={acting === b.id}
                          className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-40">
                          Askıya Al
                        </button>
                      )}
                      <button onClick={() => deleteBiz(b.id, b.name)} disabled={acting === b.id}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-40">
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {businesses.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Firma bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <div className="flex gap-2">
          {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).slice(0, 10).map((p) => (
            <button key={p} onClick={() => fetchData(p)}
              className={`px-3 py-1 rounded text-sm border ${page === p ? 'bg-red-600 text-white border-red-600' : 'bg-white hover:border-gray-400'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FirmalarPage() {
  return <Suspense><FirmalarList /></Suspense>;
}
