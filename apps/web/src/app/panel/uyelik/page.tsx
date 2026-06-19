'use client';

import { useEffect, useState } from 'react';

interface Plan {
  name: string; displayName: string; maxProducts: number;
  maxServices: number; maxImages: number; priceMonthly: number;
}

export default function UyelikPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/membership/plans`)
      .then((r) => r.json())
      .then((j) => setPlans(j.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Yükleniyor...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Üyelik Planları</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className={`bg-white rounded-xl border p-5 ${plan.name === 'premium' ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}>
            {plan.name === 'premium' && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full mb-2 inline-block">Önerilen</span>
            )}
            <h3 className="font-bold text-gray-900 text-lg">{plan.displayName}</h3>
            <p className="text-2xl font-bold text-blue-600 my-2">
              {plan.priceMonthly > 0 ? `${plan.priceMonthly}₺` : 'Ücretsiz'}
              {plan.priceMonthly > 0 && <span className="text-sm font-normal text-gray-400">/ay</span>}
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mt-3">
              <li>✓ {plan.maxProducts === 999 ? 'Sınırsız' : plan.maxProducts} ürün</li>
              <li>✓ {plan.maxServices === 999 ? 'Sınırsız' : plan.maxServices} hizmet</li>
              <li>✓ {plan.maxImages === 999 ? 'Sınırsız' : plan.maxImages} görsel</li>
            </ul>
            {plan.priceMonthly > 0 && (
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Yükselt
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
