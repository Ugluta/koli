'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api/client';

interface ScrapeResult {
  queried: number;
  imported: number;
  skipped: number;
  errors: string[];
}

export default function AdminScraper() {
  const [keywords, setKeywords] = useState('');
  const [cities, setCities] = useState('');
  const [categoryIds, setCategoryIds] = useState('');
  const [maxPerQuery, setMaxPerQuery] = useState(60);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const splitList = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

  const run = async () => {
    const kw = splitList(keywords);
    const ct = splitList(cities);
    if (kw.length === 0 || ct.length === 0) {
      setError('En az bir anahtar kelime ve bir şehir girin.');
      return;
    }
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const body = {
        keywords: kw,
        cities: ct,
        categoryIds: splitList(categoryIds).map(Number).filter((n) => !Number.isNaN(n)),
        maxPerQuery,
      };
      const res = await apiClient.post('/admin/places-scraper/run', body);
      setResult(res.data?.data ?? res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message ?? 'Çalıştırma başarısız.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Google Places Scraper</h1>
        <p className="text-sm text-gray-500 mt-1">
          Anahtar kelime ve şehirlere göre Google Places üzerinden işletme içe aktarın.
          Sunucuda <code className="text-xs bg-gray-100 px-1 rounded">GOOGLE_PLACES_API_KEY</code> tanımlı olmalıdır.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Anahtar kelimeler</label>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="ambalaj, koli, matbaa"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <p className="text-xs text-gray-400 mt-1">Virgülle ayırın</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Şehirler</label>
          <input
            value={cities}
            onChange={(e) => setCities(e.target.value)}
            placeholder="İstanbul, Ankara, İzmir"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <p className="text-xs text-gray-400 mt-1">Virgülle ayırın</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori ID’leri (opsiyonel)</label>
            <input
              value={categoryIds}
              onChange={(e) => setCategoryIds(e.target.value)}
              placeholder="1, 5, 12"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sorgu başına maksimum</label>
            <input
              type="number"
              min={1}
              value={maxPerQuery}
              onChange={(e) => setMaxPerQuery(parseInt(e.target.value) || 1)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>

        <button
          onClick={run}
          disabled={running}
          className={`w-full py-2.5 rounded-lg text-sm font-medium text-white transition ${
            running ? 'bg-red-400 cursor-wait' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {running ? 'Çalışıyor… (birkaç dakika sürebilir)' : 'Scraper’ı Çalıştır'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>
        )}
      </div>

      {result && (
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Sonuç</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{result.queried}</div>
              <div className="text-xs text-blue-600 mt-1">Sorgulanan</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{result.imported}</div>
              <div className="text-xs text-green-600 mt-1">İçe aktarılan</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-700">{result.skipped}</div>
              <div className="text-xs text-gray-500 mt-1">Atlanan</div>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-red-600 mb-1">Hatalar ({result.errors.length})</p>
              <ul className="text-xs text-gray-500 space-y-1 max-h-40 overflow-auto">
                {result.errors.map((err, i) => <li key={i} className="font-mono">• {err}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
