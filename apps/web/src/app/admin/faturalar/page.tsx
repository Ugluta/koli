'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

const STATUS_TR: Record<string, string> = {
  pending: 'Bekliyor', paid: 'Ödendi', failed: 'Başarısız', refunded: 'İade', cancelled: 'İptal',
};
const STATUS_COLOR: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-600',
};
const CYCLE_TR: Record<string, string> = { monthly: 'Aylık', yearly: 'Yıllık', one_time: 'Tek Ödeme' };
const PROVIDER_TR: Record<string, string> = { iyzico: 'iyzico', stripe: 'Stripe', manual: 'Manuel' };

export default function AdminFaturalar() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/billing/admin/invoices?page=${p}`);
      setInvoices(res.data?.data ?? []);
      setTotal(res.data?.meta?.total ?? 0);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(1); }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const fmtAmount = (cents: number) => (cents / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Faturalar</h1>
        <span className="text-sm text-gray-400">{total.toLocaleString('tr-TR')} kayıt</span>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tarih</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Firma</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Periyot</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Sağlayıcı</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Tutar</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Yükleniyor...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Kayıt yok</td></tr>
            ) : invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 text-gray-600">{new Date(inv.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{inv.businessId?.slice(0, 8) ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{CYCLE_TR[inv.billingCycle] ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{PROVIDER_TR[inv.provider] ?? inv.provider}</td>
                <td className="px-4 py-3 text-right font-medium">{fmtAmount(inv.amountCents)} ₺</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_TR[inv.status] ?? inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => fetchData(page - 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >← Önceki</button>
          <span className="text-sm text-gray-500">{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => fetchData(page + 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >Sonraki →</button>
        </div>
      )}
    </div>
  );
}
