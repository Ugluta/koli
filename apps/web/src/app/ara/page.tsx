import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Promise<Metadata> {
  return {
    title: searchParams.q ? `"${searchParams.q}" için arama sonuçları` : 'Arama',
    robots: 'noindex',
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const POST_PATH: Record<string, string> = {
  news: '/haber', blog: '/blog', event: '/etkinlik', announcement: '/duyuru', campaign: '/kampanya',
};

async function searchBusinesses(q: string, page: number) {
  const res = await fetch(
    `${API_URL}/search/businesses?q=${encodeURIComponent(q)}&page=${page}&limit=12`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return { data: [], meta: { total: 0 } };
  return res.json();
}

async function searchPosts(q: string, page: number) {
  const res = await fetch(
    `${API_URL}/search/posts?q=${encodeURIComponent(q)}&page=${page}&limit=10`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return { data: [], meta: { total: 0 } };
  return res.json();
}

export default async function AraPage({
  searchParams,
}: {
  searchParams: { q?: string; tab?: string; page?: string };
}) {
  const q = searchParams.q?.trim() ?? '';
  const tab = searchParams.tab ?? 'businesses';
  const page = parseInt(searchParams.page ?? '1', 10);

  const [bizResults, postResults] = await Promise.all([
    q ? searchBusinesses(q, page) : { data: [], meta: { total: 0 } },
    q ? searchPosts(q, page) : { data: [], meta: { total: 0 } },
  ]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">
        {q ? <>"{q}" için sonuçlar</> : 'Arama'}
      </h1>
      {q && (
        <p className="text-sm text-gray-500 mb-6">
          {bizResults.meta.total + postResults.meta.total} sonuç bulundu
        </p>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {[
          { key: 'businesses', label: `Firmalar (${bizResults.meta.total})` },
          { key: 'posts', label: `İçerikler (${postResults.meta.total})` },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/ara?q=${encodeURIComponent(q)}&tab=${t.key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {!q && (
        <p className="text-gray-500 text-center py-12">Aramak istediğiniz kelimeyi girin.</p>
      )}

      {q && tab === 'businesses' && (
        <>
          {bizResults.data.length === 0 ? (
            <p className="text-gray-500 text-center py-12">Firma bulunamadı.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bizResults.data.map((b: any) => (
                <Link
                  key={b.id}
                  href={`/firma/${b.slug}`}
                  className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <h2
                    className="font-semibold mb-1 [&_mark]:bg-yellow-100 [&_mark]:rounded"
                    dangerouslySetInnerHTML={{ __html: b._formatted?.name ?? b.name }}
                  />
                  {b.cityName && <p className="text-xs text-gray-400 mb-2">{b.cityName}</p>}
                  {(b._formatted?.shortDescription ?? b.shortDescription) && (
                    <p
                      className="text-sm text-gray-600 line-clamp-2 [&_mark]:bg-yellow-100"
                      dangerouslySetInnerHTML={{ __html: b._formatted?.shortDescription ?? b.shortDescription }}
                    />
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {q && tab === 'posts' && (
        <>
          {postResults.data.length === 0 ? (
            <p className="text-gray-500 text-center py-12">İçerik bulunamadı.</p>
          ) : (
            <div className="space-y-4">
              {postResults.data.map((p: any) => (
                <Link
                  key={p.id}
                  href={`${POST_PATH[p.type] ?? '/haber'}/${p.slug}`}
                  className="block bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <h2
                    className="font-semibold mb-1 [&_mark]:bg-yellow-100"
                    dangerouslySetInnerHTML={{ __html: p._formatted?.title ?? p.title }}
                  />
                  {(p._formatted?.excerpt ?? p.excerpt) && (
                    <p
                      className="text-sm text-gray-600 line-clamp-2 [&_mark]:bg-yellow-100"
                      dangerouslySetInnerHTML={{ __html: p._formatted?.excerpt ?? p.excerpt }}
                    />
                  )}
                  {p.publishedAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(p.publishedAt).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {q && (
        <div className="flex gap-2 mt-8 justify-center">
          {page > 1 && (
            <Link
              href={`/ara?q=${encodeURIComponent(q)}&tab=${tab}&page=${page - 1}`}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              ← Önceki
            </Link>
          )}
          {(tab === 'businesses' ? bizResults : postResults).data.length === 12 && (
            <Link
              href={`/ara?q=${encodeURIComponent(q)}&tab=${tab}&page=${page + 1}`}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
