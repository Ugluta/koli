import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const FLAG_MAP: Record<string, string> = {
  TR: '🇹🇷', DE: '🇩🇪', FR: '🇫🇷', GB: '🇬🇧', IT: '🇮🇹', ES: '🇪🇸',
  NL: '🇳🇱', BE: '🇧🇪', AT: '🇦🇹', CH: '🇨🇭', PL: '🇵🇱', SE: '🇸🇪',
  NO: '🇳🇴', DK: '🇩🇰', FI: '🇫🇮', PT: '🇵🇹', GR: '🇬🇷', CZ: '🇨🇿',
  HU: '🇭🇺', RO: '🇷🇴', BG: '🇧🇬', HR: '🇭🇷', SK: '🇸🇰', SI: '🇸🇮',
};

async function getCountry(slug: string) {
  try {
    const res = await fetch(`${API_URL}/countries`, { next: { revalidate: 3600 } });
    const json = await res.json();
    const countries = json.data ?? json ?? [];
    return countries.find((c: any) => c.slug === slug) ?? null;
  } catch { return null; }
}

async function getCities(countrySlug: string) {
  try {
    const res = await fetch(`${API_URL}/cities?country=${countrySlug}`, { next: { revalidate: 3600 } });
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: { country: string } }): Promise<Metadata> {
  const country = await getCountry(params.country);
  if (!country) return { title: 'Ülke Bulunamadı' };
  return {
    title: `${country.name} Firma Rehberi — Koli`,
    description: `${country.name} şehirleri ve firmalar rehberi.`,
    alternates: { canonical: `/ulkeler/${params.country}` },
  };
}

export default async function CountryPage({ params }: { params: { country: string } }) {
  const [country, cities] = await Promise.all([
    getCountry(params.country),
    getCities(params.country),
  ]);
  if (!country) notFound();

  const flag = FLAG_MAP[country.code?.toUpperCase()] ?? '🌍';

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Ana Sayfa', url: '/' },
    { name: 'Ülkeler', url: '/ulkeler' },
    { name: country.name, url: `/ulkeler/${params.country}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <nav className="text-sm text-gray-400 mb-4 flex flex-wrap gap-1">
            <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/ulkeler" className="hover:text-blue-600">Ülkeler</Link>
            <span>/</span>
            <span className="text-gray-700">{country.name}</span>
          </nav>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl">{flag}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{country.name}</h1>
              <p className="text-gray-500 text-sm mt-1">{cities.length} şehir listeleniyor</p>
            </div>
          </div>

          {cities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cities.map((city: any) => (
                <Link
                  key={city.id}
                  href={`/${city.slug}`}
                  className="bg-white border rounded-xl px-4 py-3 hover:shadow-md hover:border-blue-300 transition group"
                >
                  <p className="font-medium text-gray-900 group-hover:text-blue-600 transition">{city.name}</p>
                  {city.population && (
                    <p className="text-xs text-gray-400 mt-0.5">{Number(city.population).toLocaleString('tr-TR')} nüfus</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Bu ülke için henüz şehir kaydı bulunmuyor.</p>
          )}
        </div>
      </main>
    </>
  );
}
