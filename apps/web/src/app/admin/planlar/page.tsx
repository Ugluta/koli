'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

interface Plan {
  id: number;
  name: string;
  displayName: string;
  priceMonthly: number;
  priceYearly: number;
  priceOnetime: number;
  maxProducts: number;
  maxServices: number;
  maxImages: number;
  maxCampaigns: number;
  canUploadVideo: boolean;
  canAddFiles: boolean;
  canUseWhatsapp: boolean;
  canAppearFeatured: boolean;
  analyticsDays: number;
  isActive: boolean;
  sortOrder: number;
}

const NUM_FIELDS: { key: keyof Plan; label: string }[] = [
  { key: 'priceMonthly', label: 'Aylık ₺' },
  { key: 'priceYearly', label: 'Yıllık ₺' },
  { key: 'priceOnetime', label: 'Tek Ödeme ₺' },
  { key: 'maxProducts', label: 'Ürün' },
  { key: 'maxServices', label: 'Hizmet' },
  { key: 'maxImages', label: 'Görsel' },
  { key: 'maxCampaigns', label: 'Reklam' },
  { key: 'analyticsDays', label: 'Analitik gün' },
];
const BOOL_FIELDS: { key: keyof Plan; label: string }[] = [
  { key: 'canUploadVideo', label: 'Video' },
  { key: 'canAddFiles', label: 'Dosya' },
  { key: 'canUseWhatsapp', label: 'WhatsApp' },
  { key: 'canAppearFeatured', label: 'Öne çıkar' },
  { key: 'isActive', label: 'Aktif' },
];

export default function AdminPlanlar() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get('/membership/admin/plans')
      .then((r) => setPlans((r.data?.data ?? r.data ?? []).map((p: any) => ({
        ...p,
        priceMonthly: Number(p.priceMonthly), priceYearly: Number(p.priceYearly), priceOnetime: Number(p.priceOnetime),
      }))))
      .finally(() => setLoading(false));
  }, []);

  const setField = (id: number, key: keyof Plan, value: number | boolean | string) => {
    setPlans((prev) => prev.map((p) => p.id === id ? { ...p, [key]: value } : p));
  };

  const save = async (plan: Plan) => {
    setSaving(plan.id);
    try {
      const { id, name, ...payload } = plan;
      await apiClient.patch(`/membership/admin/plans/${id}`, payload);
      setSavedId(id);
      setTimeout(() => setSavedId((s) => (s === id ? null : s)), 2000);
    } finally { setSaving(null); }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Üyelik Planları</h1>

      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <input
                  value={plan.displayName}
                  onChange={(e) => setField(plan.id, 'displayName', e.target.value)}
                  className="font-semibold text-lg border-b border-transparent hover:border-gray-200 focus:border-red-400 focus:outline-none"
                />
                <span className="text-xs text-gray-400 font-mono">{plan.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {savedId === plan.id && <span className="text-xs text-green-600">Kaydedildi ✓</span>}
                <button
                  disabled={saving === plan.id}
                  onClick={() => save(plan)}
                  className="px-4 py-1.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {saving === plan.id ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {NUM_FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="text-xs text-gray-500">{f.label}</span>
                  <input
                    type="number"
                    value={plan[f.key] as number}
                    onChange={(e) => setField(plan.id, f.key, parseFloat(e.target.value) || 0)}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </label>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              {BOOL_FIELDS.map((f) => (
                <label key={f.key} className="flex items-center gap-1.5 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={plan[f.key] as boolean}
                    onChange={(e) => setField(plan.id, f.key, e.target.checked)}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
