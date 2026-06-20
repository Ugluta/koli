import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import SearchFilters from './SearchFilters';
import MobileFilters from './MobileFilters';

export async function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Promise<Metadata> {
  return {
    title: searchParams.q ? `"${searchParams.q}" için arama sonuçları` : 'Arama — Koli',
    robots: 'noindex',
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function searchBusinesses(q: string, city: string, country: string, page: number) {
  const params = new URLSearchParams({ q, page: String(page), limit: '12' });
  if (city) params.set('city', city);
  if (country) params.set('country', country);
  const res = await fetch(`${API_URL}/search/businesses?${params}`, { next: { revalidate: 60 } });
  if (!res.ok) return { data: [], meta: { total: 0 } };
  return res.json();
}

async function searchProducts(q: string, city: string, country: string, page: number) {
  const params = new URLSearchParams({ q, page: String(page), limit: '12' });
  if (city) params.set('city', city);
  if (country) params.set('country', country);
  const res = await fetch(`${API_URL}/search/products?${params}`, { next: { revalidate: 60 } });
  if (!res.ok) return { data: [], meta: { total: 0 } };
  return res.json();
}

async function getCountries() {
  try {
    const res = await fetch(`${API_URL}/countries`, { next: { revalidate: 3600 } });
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch { return []; }
}

async function getCities(countrySlug?: string) {
  try {
    const params = countrySlug ? `?country=${countrySlug}` : '?limit=100';
    const res = await fetch(`${API_URL}/cities${params}`, { next: { revalidate: 3600 } });
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch { return []; }
}

export default async function AraPage({
  searchParams,
}: {
  searchParams: { q?: string; tab?: string; page?: string; city?: string; country?: string };
}) {
  const q = searchParams.q?.trim() ?? '';
  const tab = searchParams.tab ?? 'businesses';
  const page = parseInt(searchParams.page ?? '1', 10);
  const city = searchParams.city ?? '';
  const country = searchParams.country ?? '';

  const [bizResults, productResults, countries, cities] = await Promise.all([
    q ? searchBusinesses(q, city, country, page) : { data: [], meta: { total: 0 } },
    q ? searchProducts(q, city, country, page) : { data: [], meta: { total: 0 } },
    getCountries(),
    getCities(country || undefined),
  ]);

  const totalResults = bizResults.meta.total + productResults.meta.total;

  const tabs = [
    { key: 'businesses', label: 'Firmalar', count: bizResults.meta.total },
    { key: 'products', label: 'Ürünler', count: productResults.meta.total },
  ];

  const buildUrl = (overrides: Record<string, string>) => {
    const base: Record<string, string> = { q, tab, page: String(page) };
    if (city) base.city = city;
    if (country) base.country = country;
    const p = new URLSearchParams({ ...base, ...overrides });
    return `/ara?${p}`;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Search bar */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <form action="/ara" method="get">
            <div className="flex gap-2">
              <input
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Firma adı, ürün veya hizmet ara..."
                className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {country && <input type="hidden" name="country" value={country} />}
              {city && <input type="hidden" name="city" value={city} />}
              <button type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                Ara
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters sidebar */}
          <aside className="w-52 shrink-0 hidden md:block">
            <div className="bg-white border rounded-xl p-4 space-y-5 sticky top-4">
              <h3 className="font-semibold text-gray-800 text-sm">Filtreler</h3>
              <Suspense fallback={null}>
                <SearchFilters
                  countries={countries}
                  cities={cities}
                  currentCountry={country}
                  currentCity={city}
                  q={q}
                  tab={tab}
                />
              </Suspense>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter button */}
            <div className="md:hidden mb-4">
              <Suspense fallback={null}>
                <MobileFilters
                  countries={countries}
                  cities={cities}
                  currentCountry={country}
                  currentCity={city}
                  q={q}
                  tab={tab}
                />
              </Suspense>
            </div>
            {q && (
              <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h1 className="font-semibold text-gray-900">"{q}" için sonuçlar</h1>
                  <p className="text-xs text-gray-400 mt-0.5">{totalResults} sonuç</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {country && (
                    <Link href={buildUrl({ country: '', city: '', page: '1' })}
                      className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200">
                      {(countries as any[]).find((c: any) => c.slug === country)?.name ?? country} ✕
                    </Link>
                  )}
                  {city && (
                    <Link href={buildUrl({ city: '', page: '1' })}
                      className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200">
                      {(cities as any[]).find((c: any) => c.slug === city)?.name ?? city} ✕
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Tabs */}
            {q && (
              <div className="flex gap-1 mb-5 border-b">
                {tabs.map((t) => (
                  <Link key={t.key} href={buildUrl({ tab: t.key, page: '1' })}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}>
                    {t.label} <span className="text-xs opacity-70">({t.count})</span>
                  </Link>
                ))}
              </div>
            )}

            {!q && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-medium text-gray-600">Ne arıyorsunuz?</p>
                <p className="text-sm mt-1">Firma adı, ürün veya hizmet adı girin</p>
              </div>
            )}

            {/* Businesses tab */}
            {q && tab === 'businesses' && (
              bizResults.data.length === 0 ? (
                <p className="text-gray-500 text-center py-12">Bu kriterlere uygun firma bulunamadı.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(bizResults.data as any[]).map((b: any) => (
                    <Link key={b.id} href={`/firma/${b.slug}`}
                      className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
                      <h2 className="font-semibold mb-1 [&_mark]:bg-yellow-100 [&_mark]:rounded"
                        dangerouslySetInnerHTML={{ __html: b._formatted?.name ?? b.name }} />
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                        {b.cityName && <span>📍 {b.cityName}</span>}
                        {b.countryName && <span>· {b.countryName}</span>}
                      </div>
                      {(b._formatted?.shortDescription ?? b.shortDescription) && (
                        <p className="text-sm text-gray-600 line-clamp-2 [&_mark]:bg-yellow-100"
                          dangerouslySetInnerHTML={{ __html: b._formatted?.shortDescription ?? b.shortDescription }} />
                      )}
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* Products tab */}
            {q && tab === 'products' && (
              productResults.data.length === 0 ? (
                <p className="text-gray-500 text-center py-12">Bu kriterlere uygun ürün bulunamadı.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(productResults.data as any[]).map((p: any) => (
                    <Link key={p.id} href={`/firma/${p.businessSlug}`}
                      className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <h2 className="font-semibold text-gray-900 truncate">{p.name}</h2>
                          <p className="text-xs text-blue-600 mt-0.5">{p.businessName}</p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                            {p.cityName && <span>📍 {p.cityName}</span>}
                            {p.countryName && <span>· {p.countryName}</span>}
                          </div>
                          {p.shortDescription && (
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{p.shortDescription}</p>
                          )}
                        </div>
                        {p.price && (
                          <p className="text-sm font-bold text-blue-700 shrink-0">
                            {Number(p.price).toLocaleString('tr-TR')} ₺
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* Pagination */}
            {q && (
              <div className="flex gap-2 mt-8 justify-center">
                {page > 1 && (
                  <Link href={buildUrl({ page: String(page - 1) })}
                    className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50">
                    ← Önceki
                  </Link>
                )}
                {(tab === 'businesses' ? bizResults : productResults).data.length === 12 && (
                  <Link href={buildUrl({ page: String(page + 1) })}
                    className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50">
                    Sonraki →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
