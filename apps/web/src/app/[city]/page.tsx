import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cityDirectoryJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function getCity(slug: string) {
  const res = await fetch(`${API_URL}/cities/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? json;
}

async function getBusinesses(citySlug: string, categorySlug?: string, cursor?: string) {
  const params = new URLSearchParams({ city: citySlug, limit: '18' });
  if (categorySlug) params.set('category', categorySlug);
  if (cursor) params.set('cursor', cursor);
  const res = await fetch(`${API_URL}/businesses?${params}`, { next: { revalidate: 60 } });
  if (!res.ok) return { data: [], meta: {} };
  const json = await res.json();
  return json.data ?? { data: [], meta: {} };
}

async function getTopCategories() {
  try {
    const res = await fetch(`${API_URL}/categories?flat=true`, { next: { revalidate: 3600 } });
    const json = await res.json();
    return (json.data ?? json ?? []).slice(0, 16);
  } catch { return []; }
}
}

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = await getCity(params.city);
  if (!city) return { title: 'Şehir Bulunamadı' };
  return {
    title: city.seoTitle ?? `${city.name} Firma Rehberi`,
    description:
      city.seoDescription ??
      `${city.name} şehrindeki firma, ürün ve hizmetleri keşfedin.`,
  };
}

export default async function CityPage({
  params,
  searchParams,
}: {
  params: { city: string };
  searchParams: { category?: string; cursor?: string };
}) {
  const [city, categories, businesses] = await Promise.all([
    getCity(params.city),
    getTopCategories(),
    getBusinesses(params.city, searchParams.category, searchParams.cursor),
  ]);
  if (!city) notFound();

  const items: any[] = businesses.data ?? [];
  const nextCursor: string | null = businesses.meta?.nextCursor ?? null;

  const jsonLd = cityDirectoryJsonLd(city);
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Ana Sayfa', url: '/' },
    { name: `${city.name} Rehberi`, url: `/${params.city}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-1">
            <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-gray-700">{city.name}</span>
          </nav>

          <div className="mb-6">
            {city.country && <p className="text-sm text-gray-400 mb-1">{city.country.name}</p>}
            <h1 className="text-3xl font-bold text-gray-900">{city.name} Firma Rehberi</h1>
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <section className="mb-6">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/${params.city}`}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition ${!searchParams.category ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:border-blue-400 hover:text-blue-600'}`}
                >
                  Tümü
                </Link>
                {categories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/${params.city}?category=${cat.slug}`}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition ${searchParams.category === cat.slug ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:border-blue-400 hover:text-blue-600'}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            {items.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((b: any) => (
                    <Link
                      key={b.id}
                      href={`/firma/${b.slug}`}
                      className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {b.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.logoUrl} alt={b.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                            {b.name[0]}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{b.name}</h3>
                          {b.isVerified && <span className="text-xs text-green-600 font-medium">✓ Doğrulanmış</span>}
                        </div>
                      </div>
                      {b.shortDescription && <p className="text-sm text-gray-600 line-clamp-2">{b.shortDescription}</p>}
                      {b.phone && <p className="text-xs text-gray-400 mt-2">{b.phone}</p>}
                    </Link>
                  ))}
                </div>
                {nextCursor && (
                  <div className="mt-6 text-center">
                    <Link
                      href={`/${params.city}?cursor=${nextCursor}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                      className="inline-block bg-white border rounded-xl px-6 py-2.5 text-sm font-medium hover:shadow-md transition"
                    >
                      Daha Fazla Göster →
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">Bu şehirde henüz firma kaydı bulunmuyor.</p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
