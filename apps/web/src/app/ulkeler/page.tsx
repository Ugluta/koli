import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const metadata: Metadata = {
  title: 'Ülkeler — Koli Firma Rehberi',
  description: 'Avrupa ülkeleri firma rehberi. Ülkenizi seçin, şehirlerinizi keşfedin.',
  alternates: { canonical: '/ulkeler' },
};

async function getCountries() {
  try {
    const res = await fetch(`${API_URL}/countries`, { next: { revalidate: 3600 } });
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch { return []; }
}

const FLAG_MAP: Record<string, string> = {
  TR: '🇹🇷', DE: '🇩🇪', FR: '🇫🇷', GB: '🇬🇧', IT: '🇮🇹', ES: '🇪🇸',
  NL: '🇳🇱', BE: '🇧🇪', AT: '🇦🇹', CH: '🇨🇭', PL: '🇵🇱', SE: '🇸🇪',
  NO: '🇳🇴', DK: '🇩🇰', FI: '🇫🇮', PT: '🇵🇹', GR: '🇬🇷', CZ: '🇨🇿',
  HU: '🇭🇺', RO: '🇷🇴', BG: '🇧🇬', HR: '🇭🇷', SK: '🇸🇰', SI: '🇸🇮',
  RS: '🇷🇸', UA: '🇺🇦', RU: '🇷🇺', BY: '🇧🇾', LT: '🇱🇹', LV: '🇱🇻',
  EE: '🇪🇪', IE: '🇮🇪', LU: '🇱🇺', MT: '🇲🇹', CY: '🇨🇾', IS: '🇮🇸',
};

export default async function CountriesPage() {
  const countries = await getCountries();

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Ana Sayfa', url: '/' },
    { name: 'Ülkeler', url: '/ulkeler' },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-1">
            <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-gray-700">Ülkeler</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ülkeler</h1>
          <p className="text-gray-500 mb-8">Avrupa firma rehberini keşfetmek için ülke seçin.</p>

          {countries.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {countries.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/ulkeler/${c.slug}`}
                  className="bg-white border rounded-xl p-5 flex items-center gap-3 hover:shadow-md hover:border-blue-300 transition group"
                >
                  <span className="text-3xl">{FLAG_MAP[c.code?.toUpperCase()] ?? '🌍'}</span>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{c.name}</p>
                    {c.defaultLocale && <p className="text-xs text-gray-400">{c.defaultLocale}</p>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Henüz ülke verisi yüklenmemiş.</p>
          )}
        </div>
      </main>
    </>
  );
}
