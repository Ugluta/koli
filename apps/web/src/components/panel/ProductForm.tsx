'use client';

import { useState } from 'react';

interface Props {
  businessId: string;
  onSuccess?: () => void;
}

export function ProductForm({ businessId, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/panel/businesses/${businessId}/products`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, price: price ? Number(price) : undefined, description }),
        },
      );
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message ?? 'Hata oluştu'); return; }
      setName(''); setPrice(''); setDescription('');
      onSuccess?.();
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Yeni Ürün Ekle</h3>
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı *</label>
        <input
          value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Örn: Ahşap Sandalye"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (TRY)</label>
        <input
          type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
        />
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
        {loading ? 'Kaydediliyor...' : 'Ürün Ekle'}
      </button>
    </form>
  );
}
