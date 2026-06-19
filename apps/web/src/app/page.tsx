import type { Metadata } from 'next';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function getFeaturedCities() {
  try {
    const res = await fetch(`${API_URL}/cities?limit=20`, { next: { revalidate: 3600 } });
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch { return []; }
}

async function getTopCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } });
    const json = await res.json();
    const tree = json.data ?? json ?? [];
    return tree.slice(0, 12);
  } catch { return []; }
}

export const metadata: Metadata = {
  title: 'Koli — Avrupa Şehir ve Firma Rehberi',
  description: 'Avrupa genelinde şehirler, firmalar, ürünler ve hizmetler için kapsamlı rehber.',
};

export default async function HomePage() {
  const [cities, categories] = await Promise.all([getFeaturedCities(), getTopCategories()]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Avrupa Firma Rehberi</h1>
          <p className="text-lg text-gray-500 mb-8">Şehirinizdeki firma, ürün ve hizmetleri keşfedin</p>
          <form action="/ara" method="get" className="flex gap-2 max-w-xl mx-auto">
            <input
              name="q"
              type="search"
              placeholder="Firma, ürün veya hizmet ara..."
              className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
            >
              Ara
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Kategoriler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className="bg-white border rounded-xl p-4 text-center hover:shadow-md hover:border-blue-300 transition group"
                >
                  <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                    {cat.name[0]}
                  </div>
                  <p className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition line-clamp-2">{cat.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cities */}
        {cities.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Şehirler</h2>
              <Link href="/ulkeler" className="text-sm text-blue-600 hover:underline">Tüm ülkeler →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {cities.map((city: any) => (
                <Link
                  key={city.id}
                  href={`/${city.slug}`}
                  className="bg-white border rounded-xl px-4 py-3 hover:shadow-md hover:border-blue-300 transition group"
                >
                  <p className="font-medium text-gray-900 group-hover:text-blue-600 transition">{city.name}</p>
                  {city.country && <p className="text-xs text-gray-400 mt-0.5">{city.country.name}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
