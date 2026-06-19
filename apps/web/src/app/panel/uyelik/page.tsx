'use client';

import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api/client';
import { useSearchParams } from 'next/navigation';

interface Plan {
  id: string;
  name: string;
  priceCents: number;
  maxProducts: number | null;
  maxServices: number | null;
  maxImages: number | null;
  canUploadVideo: boolean;
  canUploadFiles: boolean;
  isFeatured: boolean;
}

interface Subscription {
  id: string;
  planId: string;
  status: string;
  endsAt: string | null;
  plan: Plan;
}

export default function UyelikPage() {
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const success = searchParams.get('success');
  const error = searchParams.get('error');

  useEffect(() => {
    Promise.all([
      apiClient.get('/membership/plans'),
      apiClient.get('/membership/my').catch(() => ({ data: null })),
    ]).then(([plansRes, subRes]) => {
      setPlans(plansRes.data?.data ?? plansRes.data ?? []);
      setSubscription(subRes.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (checkoutHtml && formRef.current) {
      formRef.current.innerHTML = checkoutHtml;
      const form = formRef.current.querySelector('form');
      if (form) form.submit();
    }
  }, [checkoutHtml]);

  async function handleUpgrade(plan: Plan) {
    if (upgrading) return;
    setUpgrading(plan.id);
    try {
      const bizRes = await apiClient.get('/panel/businesses').catch(() => ({ data: { data: [] } }));
      const businessId = bizRes.data?.data?.[0]?.id;
      if (!businessId) {
        alert('Önce bir işletme kaydı oluşturun.');
        return;
      }
      const r = await apiClient.post('/billing/upgrade', {
        businessId,
        planId: plan.id,
        planName: plan.name,
        amountCents: plan.priceCents,
      });
      if (r.data.htmlContent) setCheckoutHtml(r.data.htmlContent);
    } catch (e: any) {
      alert(`Ödeme başlatılamadı: ${e?.response?.data?.message ?? e.message}`);
    } finally {
      setUpgrading(null);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Yükleniyor...</div>;

  if (checkoutHtml) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Ödeme sayfasına yönlendiriliyorsunuz...</p>
          <div ref={formRef} className="hidden" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Üyelik Planı</h1>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm">
          Ödemeniz başarıyla alındı. Planınız güncellendi.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
          Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.
        </div>
      )}

      {subscription && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
          Aktif plan: <strong>{subscription.plan?.name ?? subscription.planId}</strong>
          {subscription.endsAt && (
            <> — {new Date(subscription.endsAt).toLocaleDateString('tr-TR')} tarihine kadar</>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {plans.map((plan) => {
          const isCurrent = subscription?.planId === plan.id;
          const isFree = plan.priceCents === 0;
          return (
            <div
              key={plan.id}
              className={`bg-white border rounded-2xl p-5 flex flex-col ${
                plan.isFeatured ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
              }`}
            >
              {plan.isFeatured && (
                <div className="text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 self-start mb-3">
                  Önerilen
                </div>
              )}
              <h2 className="text-lg font-bold mb-1">{plan.name}</h2>
              <div className="text-3xl font-bold mb-4">
                {isFree ? (
                  <span className="text-gray-400">Ücretsiz</span>
                ) : (
                  <>
                    {(plan.priceCents / 100).toLocaleString('tr-TR')} ₺
                    <span className="text-sm font-normal text-gray-400">/ay</span>
                  </>
                )}
              </div>
              <ul className="space-y-1.5 text-sm text-gray-600 flex-1 mb-6">
                <li className="flex items-center gap-2"><span className="text-green-500 text-xs">✓</span>{plan.maxProducts === null ? 'Sınırsız' : plan.maxProducts} Ürün</li>
                <li className="flex items-center gap-2"><span className="text-green-500 text-xs">✓</span>{plan.maxServices === null ? 'Sınırsız' : plan.maxServices} Hizmet</li>
                <li className="flex items-center gap-2"><span className="text-green-500 text-xs">✓</span>{plan.maxImages === null ? 'Sınırsız' : plan.maxImages} Görsel</li>
                {plan.canUploadVideo && <li className="flex items-center gap-2"><span className="text-green-500 text-xs">✓</span>Video Yükleme</li>}
                {plan.canUploadFiles && <li className="flex items-center gap-2"><span className="text-green-500 text-xs">✓</span>Dosya Yükleme</li>}
                {plan.isFeatured && <li className="flex items-center gap-2"><span className="text-green-500 text-xs">✓</span>Öne Çıkarma</li>}
              </ul>
              <button
                disabled={isCurrent || isFree || upgrading === plan.id}
                onClick={() => handleUpgrade(plan)}
                className={`w-full py-2 rounded-xl text-sm font-medium transition ${
                  isCurrent ? 'bg-gray-100 text-gray-400 cursor-default'
                  : isFree ? 'bg-gray-50 text-gray-400 cursor-default'
                  : upgrading === plan.id ? 'bg-blue-400 text-white cursor-wait'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCurrent ? 'Mevcut Plan' : isFree ? 'Temel' : upgrading === plan.id ? 'Yönlendiriliyor...' : 'Yükselt'}
              </button>
            </div>
          );
        })}
      </div>

      <InvoiceHistory />
    </div>
  );
}

function InvoiceHistory() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiClient.get('/billing/invoices').then((r) => setInvoices(r.data.data ?? [])).finally(() => setLoaded(true));
  }, []);

  if (!loaded || invoices.length === 0) return null;

  const STATUS_TR: Record<string, string> = { pending: 'Bekliyor', paid: 'Ödendi', failed: 'Başarısız', refunded: 'İade', cancelled: 'İptal' };
  const STATUS_COLOR: Record<string, string> = { paid: 'text-green-600', failed: 'text-red-600', pending: 'text-yellow-600' };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Fatura Geçmişi</h2>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tarih</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Tutar</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 text-gray-600">{new Date(inv.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="px-4 py-3 text-right font-medium">{(inv.amountCents / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                <td className={`px-4 py-3 font-medium ${STATUS_COLOR[inv.status] ?? 'text-gray-600'}`}>{STATUS_TR[inv.status] ?? inv.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
