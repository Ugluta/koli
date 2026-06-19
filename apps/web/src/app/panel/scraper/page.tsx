'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

interface Source {
  id: string;
  name: string;
  url: string;
  type: string;
  status: string;
  cronExpr: string;
  lastFetchedAt: string | null;
  fetchCount: number;
  errorCount: number;
  lastError: string | null;
}

interface QueueItem {
  id: string;
  title: string;
  sourceUrl: string;
  body: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  sourceId: string;
}

type Tab = 'sources' | 'queue';

const TYPE_LABELS: Record<string, string> = { rss: 'RSS', html: 'HTML', json_api: 'JSON API' };
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
};

export default function ScraperPage() {
  const [tab, setTab] = useState<Tab>('sources');
  const [sources, setSources] = useState<Source[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fetching, setFetching] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', url: '', type: 'rss', cronExpr: '0 */6 * * *' });

  useEffect(() => {
    if (tab === 'sources') {
      apiClient.get('/scraper/sources').then((r) => setSources(r.data.data ?? [])).finally(() => setLoading(false));
    } else {
      setLoading(true);
      apiClient.get('/scraper/queue').then((r) => setQueue(r.data.data ?? [])).finally(() => setLoading(false));
    }
  }, [tab]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const r = await apiClient.post('/scraper/sources', form);
    setSources((p) => [r.data, ...p]);
    setShowForm(false);
    setForm({ name: '', url: '', type: 'rss', cronExpr: '0 */6 * * *' });
  }

  async function handleFetch(id: string) {
    setFetching(id);
    try {
      const r = await apiClient.post(`/scraper/sources/${id}/fetch`);
      alert(`Tamamlandı: ${r.data.created} yeni, ${r.data.skipped} atlandı`);
    } catch (e: any) {
      alert(`Hata: ${e.message}`);
    } finally {
      setFetching(null);
    }
  }

  async function handleApprove(id: string) {
    await apiClient.post(`/scraper/queue/${id}/approve`);
    setQueue((p) => p.filter((x) => x.id !== id));
  }

  async function handleReject(id: string) {
    const reason = prompt('Red sebebi (isteğe bağlı):') ?? undefined;
    await apiClient.post(`/scraper/queue/${id}/reject`, { reason });
    setQueue((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Scraper</h1>
        <div className="flex gap-2">
          {tab === 'sources' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              + Kaynak Ekle
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {(['sources', 'queue'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setLoading(true); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'sources' ? 'Kaynaklar' : `İnceleme Kuyruğu${queue.length ? ` (${queue.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* Add source form */}
      {showForm && tab === 'sources' && (
        <form onSubmit={handleCreate} className="bg-white border rounded-xl p-6 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">İsim</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <input required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tür</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="rss">RSS</option>
              <option value="html">HTML</option>
              <option value="json_api">JSON API</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cron (örn: 0 */6 * * *)</label>
            <input value={form.cronExpr} onChange={(e) => setForm({ ...form, cronExpr: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2 flex gap-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">Kaydet</button>
            <button type="button" onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">İptal</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
      ) : tab === 'sources' ? (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">İsim / URL</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tür</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Son Çekim</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">İstatistik</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sources.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-gray-400 truncate max-w-xs">{s.url}</div>
                    {s.lastError && <div className="text-xs text-red-500 mt-0.5 truncate max-w-xs">{s.lastError}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[s.type] ?? s.type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {s.lastFetchedAt ? new Date(s.lastFetchedAt).toLocaleString('tr-TR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {s.fetchCount} çekim / {s.errorCount} hata
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleFetch(s.id)}
                      disabled={fetching === s.id}
                      className="text-blue-600 hover:text-blue-800 text-xs disabled:opacity-50"
                    >
                      {fetching === s.id ? 'Çekiyor...' : 'Şimdi Çek'}
                    </button>
                  </td>
                </tr>
              ))}
              {sources.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Henüz kaynak yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div key={item.id} className="bg-white border rounded-xl p-4 flex gap-4">
              {item.imageUrl && (
                <img src={item.imageUrl} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1 truncate">{item.title}</h3>
                {item.body && <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.body}</p>}
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline truncate block max-w-md">
                  {item.sourceUrl}
                </a>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => handleApprove(item.id)}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700">
                  Onayla
                </button>
                <button onClick={() => handleReject(item.id)}
                  className="border border-red-300 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50">
                  Reddet
                </button>
              </div>
            </div>
          ))}
          {queue.length === 0 && (
            <div className="text-center py-12 text-gray-500">Kuyrukta bekleyen içerik yok</div>
          )}
        </div>
      )}
    </div>
  );
}
