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
  title: 'Koli — Avrupa Firma Rehberi',
  description: 'Avrupa genelinde şehirler, firmalar, ürünler ve hizmetler için kapsamlı rehber.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Koli — Avrupa Firma Rehberi',
    description: 'Avrupa genelinde şehirler, firmalar, ürünler ve hizmetler için kapsamlı rehber.',
    url: '/',
    type: 'website',
  },
};

export default async function HomePage() {
  const [cities, categories] = await Promise.all([getFeaturedCities(), getTopCategories()]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero — kurumsal */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* arka plan grid + glow */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28 grid lg:grid-cols-12 gap-12 items-center">
          {/* Sol: başlık + arama */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-blue-300 mb-5">
              <span className="h-px w-8 bg-blue-400" />
              Kurumsal Firma Rehberi
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-5">
              Avrupa'nın işletmelerini
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                tek noktadan keşfedin
              </span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl mb-8">
              Şehir, kategori, ürün ve hizmetlere göre doğrulanmış firmalara ulaşın.
              İşletmenizi ekleyin, dijital vitrininizi dakikalar içinde yayına alın.
            </p>

            <form action="/ara" method="get" className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <input
                name="q"
                type="search"
                placeholder="Firma, ürün veya hizmet ara..."
                className="flex-1 rounded-xl bg-white/95 px-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-7 py-4 rounded-xl text-sm font-semibold hover:bg-blue-500 transition shadow-lg shadow-blue-900/40"
              >
                Ara
              </button>
            </form>

            {/* hızlı kategori çipleri */}
            {categories.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-xs text-slate-400 self-center mr-1">Popüler:</span>
                {categories.slice(0, 5).map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/kategori/${cat.slug}`}
                    className="text-xs font-medium text-slate-200 border border-white/15 rounded-full px-3 py-1.5 hover:bg-white/10 hover:border-white/30 transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/panel"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-300 transition"
              >
                İşletmeni ekle
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* Sağ: değer önerileri (IBM/AWS tarzı blok grid) */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
              {[
                { t: 'Doğrulanmış firmalar', d: 'Güncel iletişim ve konum bilgisi' },
                { t: '81 il + Avrupa', d: 'Geniş coğrafi kapsama' },
                { t: 'Ürün & hizmet', d: 'İşletme vitrini ve katalog' },
                { t: 'SEO odaklı', d: 'Aramalarda öne çıkın' },
              ].map((f) => (
                <div key={f.t} className="bg-slate-900/80 p-6">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/15 text-blue-300 flex items-center justify-center mb-3 text-base font-bold">
                    {f.t[0]}
                  </div>
                  <p className="font-semibold text-sm mb-1">{f.t}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
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
