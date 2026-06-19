import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cityDirectoryJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function getCity(slug: string) {
  const res = await fetch(`${API_URL}/cities/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

async function getBusinesses(citySlug: string) {
  const res = await fetch(`${API_URL}/businesses?city=${citySlug}&limit=12`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return { data: [] };
  const json = await res.json();
  return json.data ?? { data: [] };
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

export default async function CityPage({ params }: { params: { city: string } }) {
  const city = await getCity(params.city);
  if (!city) notFound();

  const businesses = await getBusinesses(params.city);
  const items: any[] = businesses.data ?? [];

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
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-1">{city.country?.name}</p>
          <h1 className="text-3xl font-bold text-gray-900">{city.name} Firma Rehberi</h1>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Firmalar</h2>
          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((b: any) => (
                <a
                  key={b.id}
                  href={`/${params.city}/${b.slug}`}
                  className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {b.logoUrl ? (
                      <img
                        src={b.logoUrl}
                        alt={b.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {b.name[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{b.name}</h3>
                      {b.isVerified && (
                        <span className="text-xs text-green-600 font-medium">✓ Doğrulanmış</span>
                      )}
                    </div>
                  </div>
                  {b.shortDescription && (
                    <p className="text-sm text-gray-600 line-clamp-2">{b.shortDescription}</p>
                  )}
                  {b.phone && <p className="text-xs text-gray-400 mt-2">{b.phone}</p>}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Bu şehirde henüz firma kaydı bulunmuyor.</p>
          )}
        </section>
      </div>
    </main>
    </>
  );
}
