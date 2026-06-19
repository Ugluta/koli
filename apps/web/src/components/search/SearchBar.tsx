'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Hit {
  id: string;
  name?: string;
  title?: string;
  slug: string;
  type?: string;
  cityName?: string;
  _formatted?: { name?: string; title?: string; shortDescription?: string; excerpt?: string };
}

interface Results {
  businesses: Hit[];
  posts: Hit[];
  categories: Hit[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const POST_PATH: Record<string, string> = {
  news: '/haber', blog: '/blog', event: '/etkinlik', announcement: '/duyuru', campaign: '/kampanya',
};

export function SearchBar({ placeholder = 'Firma, içerik veya kategori ara...' }: { placeholder?: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Results | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.length < 2) { setResults(null); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&limit=4`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setOpen(true);
        }
      } catch {}
      finally { setLoading(false); }
    }, 300);
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/ara?q=${encodeURIComponent(query)}`);
  }

  const hasResults = results && (
    results.businesses.length > 0 || results.posts.length > 0 || results.categories.length > 0
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => hasResults && setOpen(true)}
            placeholder={placeholder}
            className="w-full border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition flex-shrink-0">
          Ara
        </button>
      </form>

      {open && hasResults && (
        <div className="absolute top-full mt-2 w-full bg-white border rounded-xl shadow-xl z-50 overflow-hidden">
          {results!.businesses.length > 0 && (
            <section>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-50 border-b">Firmalar</div>
              {results!.businesses.map((b) => (
                <a
                  key={b.id}
                  href={`/firma/${b.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition"
                >
                  <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                    {(b._formatted?.name ?? b.name ?? '?')[0]}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate"
                      dangerouslySetInnerHTML={{ __html: b._formatted?.name ?? b.name ?? '' }} />
                    {b.cityName && <div className="text-xs text-gray-400">{b.cityName}</div>}
                  </div>
                </a>
              ))}
            </section>
          )}
          {results!.posts.length > 0 && (
            <section>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-50 border-b">İçerikler</div>
              {results!.posts.map((p) => (
                <a
                  key={p.id}
                  href={`${POST_PATH[p.type ?? 'news'] ?? '/haber'}/${p.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition"
                >
                  <span className="text-lg flex-shrink-0">📰</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate"
                      dangerouslySetInnerHTML={{ __html: p._formatted?.title ?? p.title ?? '' }} />
                  </div>
                </a>
              ))}
            </section>
          )}
          {results!.categories.length > 0 && (
            <section>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-50 border-b">Kategoriler</div>
              {results!.categories.map((c) => (
                <a
                  key={c.id}
                  href={`/kategori/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition"
                >
                  <span className="text-lg flex-shrink-0">🏷️</span>
                  <div className="text-sm font-medium">{c.name}</div>
                </a>
              ))}
            </section>
          )}
          <div className="px-4 py-2 border-t bg-gray-50">
            <button
              onClick={handleSubmit as any}
              className="text-xs text-blue-600 hover:underline w-full text-left"
            >
              "{query}" için tüm sonuçları gör →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
