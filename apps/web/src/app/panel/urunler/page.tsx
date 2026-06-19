'use client';

import { useEffect, useState } from 'react';
import { ProductForm } from '../../../components/panel/ProductForm';

interface Product { id: string; name: string; price: number | null; status: string; }

export default function UrunlerPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (bId: string) => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/panel/businesses/${bId}/products`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const json = await res.json();
    setProducts(json.data?.data ?? []);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/businesses?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(async (j) => {
        const id = j.data?.data?.[0]?.id;
        if (id) { setBusinessId(id); await fetchProducts(id); }
      })
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
        <span className="text-sm text-gray-400">{products.length} ürün</span>
      </div>
      <ProductForm businessId={businessId} onSuccess={() => fetchProducts(businessId)} />
      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{p.name}</p>
              <p className="text-xs text-gray-400">{p.status}</p>
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {p.price ? `${Number(p.price).toLocaleString('tr-TR')} ₺` : '—'}
            </p>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">Henüz ürün eklenmemiş.</p>
        )}
      </div>
    </div>
  );
}
