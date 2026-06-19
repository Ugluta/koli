'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

interface Post {
  id: string;
  title: string;
  type: string;
  status: string;
  publishedAt: string | null;
  viewCount: number;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  review: 'İncelemede',
  published: 'Yayında',
  archived: 'Arşiv',
};

const TYPE_LABELS: Record<string, string> = {
  news: 'Haber',
  blog: 'Blog',
  event: 'Etkinlik',
  announcement: 'Duyuru',
  campaign: 'Kampanya',
};

export default function IcerikPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'blog', content: '', excerpt: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.get('/posts?limit=50').then((r) => {
      setPosts(r.data.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await apiClient.post('/posts', form);
      setPosts((p) => [r.data, ...p]);
      setShowForm(false);
      setForm({ title: '', type: 'blog', content: '', excerpt: '' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return;
    await apiClient.delete(`/posts/${id}`);
    setPosts((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">İçerikler</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Yeni İçerik
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tür</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Özet</label>
            <input
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İçerik (HTML)</label>
            <textarea
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Başlık</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tür</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Görüntülenme</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{post.title}</td>
                  <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[post.type] ?? post.type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published' ? 'bg-green-100 text-green-700' :
                      post.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {STATUS_LABELS[post.status] ?? post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{post.viewCount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Henüz içerik yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
