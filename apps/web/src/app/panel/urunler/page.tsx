'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { ProductForm } from '../../../components/panel/ProductForm';

interface Product { id: string; name: string; price: number | null; status: string; }

export default function UrunlerPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = async (bId: string) => {
    const res = await apiClient.get(`/panel/businesses/${bId}/products`);
    setProducts(res.data?.data?.data ?? res.data?.data ?? []);
  };

  useEffect(() => {
    apiClient.get('/panel/businesses')
      .then(async (res) => {
        const id = res.data?.data?.[0]?.id;
        if (id) { setBusinessId(id); await fetchProducts(id); }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (productId: string) => {
    if (!businessId || !confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
    setDeleting(productId);
    try {
      await apiClient.delete(`/panel/businesses/${businessId}/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } finally {
      setDeleting(null);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
        <span className="text-sm text-gray-400">{products.length} ürün</span>
      </div>
      <ProductForm businessId={businessId} onSuccess={() => fetchProducts(businessId)} />
      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{p.name}</p>
              <p className="text-xs text-gray-400 capitalize">{p.status}</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold text-gray-700">
                {p.price ? `${Number(p.price).toLocaleString('tr-TR')} ₺` : '—'}
              </p>
              <button
                onClick={() => handleDelete(p.id)}
                disabled={deleting === p.id}
                className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">Henüz ürün eklenmemiş.</p>
        )}
      </div>
    </div>
  );
}
