'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  depth: number;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminKategoriler() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newParent, setNewParent] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/categories/admin/all');
      setCats(res.data?.data ?? res.data ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await apiClient.post('/categories', {
        name: newName.trim(),
        parentId: newParent ? Number(newParent) : undefined,
      });
      setNewName(''); setNewParent('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Oluşturulamadı');
    } finally { setCreating(false); }
  };

  const toggleActive = async (cat: Category) => {
    setActing(cat.id);
    try {
      await apiClient.patch(`/categories/${cat.id}`, { isActive: !cat.isActive });
      setCats((prev) => prev.map((c) => c.id === cat.id ? { ...c, isActive: !c.isActive } : c));
    } finally { setActing(null); }
  };

  const remove = async (cat: Category) => {
    if (!confirm(`"${cat.name}" kategorisini silmek istediğinizden emin misiniz?`)) return;
    setActing(cat.id);
    setError(null);
    try {
      await apiClient.delete(`/categories/${cat.id}`);
      setCats((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Silinemedi');
    } finally { setActing(null); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>

      {/* create */}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[180px]">
          <span className="text-xs text-gray-500">Yeni kategori adı</span>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Örn: Plastik Ambalaj"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
        </label>
        <label className="min-w-[180px]">
          <span className="text-xs text-gray-500">Üst kategori (opsiyonel)</span>
          <select value={newParent} onChange={(e) => setNewParent(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
            <option value="">— Kök kategori —</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{'— '.repeat(c.depth)}{c.name}</option>
            ))}
          </select>
        </label>
        <button onClick={create} disabled={creating || !newName.trim()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
          {creating ? 'Ekleniyor...' : 'Ekle'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Yükleniyor...</td></tr>
            ) : cats.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Kayıt yok</td></tr>
            ) : cats.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 text-gray-800">
                  <span style={{ paddingLeft: `${c.depth * 16}px` }}>{c.depth > 0 && '↳ '}{c.name}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button disabled={acting === c.id} onClick={() => toggleActive(c)}
                    className="text-xs text-blue-600 hover:underline mr-3 disabled:opacity-40">
                    {c.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                  </button>
                  <button disabled={acting === c.id} onClick={() => remove(c)}
                    className="text-xs text-red-500 hover:underline disabled:opacity-40">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
