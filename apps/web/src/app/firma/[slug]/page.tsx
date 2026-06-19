import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localBusinessJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld';

interface Props {
  params: { slug: string };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://koli.app';

async function getBusiness(slug: string) {
  const res = await fetch(`${API_URL}/businesses/${slug}`, { next: { revalidate: 600 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch business');
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const business = await getBusiness(params.slug);
  if (!business) return { title: 'Firma bulunamadı' };
  const cityName = business.location?.city?.name;
  return {
    title: `${business.name}${cityName ? ` — ${cityName}` : ''}`,
    description: business.shortDescription ?? business.description?.substring(0, 160),
    openGraph: {
      title: business.name,
      description: business.shortDescription ?? undefined,
      images: business.coverImageUrl ? [{ url: business.coverImageUrl }] : [],
      type: 'website',
      url: `${SITE_URL}/firma/${params.slug}`,
    },
  };
}

export default async function FirmaDetailPage({ params }: Props) {
  const business = await getBusiness(params.slug);
  if (!business) notFound();

  const jsonLd = localBusinessJsonLd(business);
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Ana Sayfa', url: '/' },
    ...(business.location?.city
      ? [{ name: business.location.city.name, url: `/${business.location.city.slug}` }]
      : []),
    { name: business.name, url: `/firma/${params.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8 flex items-start gap-6">
          {business.logoUrl ? (
            <img src={business.logoUrl} alt={business.name} className="w-24 h-24 rounded-xl object-cover border" />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl border">
              {business.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-1">{business.name}</h1>
            {business.location?.city && (
              <p className="text-gray-500 text-sm mb-2">
                {business.location.city.name}
                {business.location.city.country ? `, ${business.location.city.country.name}` : ''}
              </p>
            )}
            {business.isVerified && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                ✓ Doğrulanmış İşletme
              </span>
            )}
          </div>
        </header>

        {business.coverImageUrl && (
          <img
            src={business.coverImageUrl}
            alt={business.name}
            className="w-full h-64 object-cover rounded-xl mb-8"
          />
        )}

        {business.description && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Hakkında</h2>
            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: business.description }} />
          </section>
        )}

        <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {business.phone && (
            <a href={`tel:${business.phone}`} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50">
              <span className="text-blue-600">📞</span>
              <span className="text-sm">{business.phone}</span>
            </a>
          )}
          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
            >
              <span>💬</span>
              <span className="text-sm">WhatsApp</span>
            </a>
          )}
          {business.email && (
            <a href={`mailto:${business.email}`} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50">
              <span>✉️</span>
              <span className="text-sm">{business.email}</span>
            </a>
          )}
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
            >
              <span>🌐</span>
              <span className="text-sm truncate">{business.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </section>

        {business.location?.addressLine1 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Adres</h2>
            <p className="text-gray-700">{business.location.addressLine1}</p>
            {business.location.latitude && business.location.longitude && (
              <a
                href={`https://maps.google.com/?q=${business.location.latitude},${business.location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 text-sm mt-2 hover:underline"
              >
                📍 Haritada Gör
              </a>
            )}
          </section>
        )}

        {business.hours?.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Çalışma Saatleri</h2>
            <div className="border rounded-xl divide-y">
              {business.hours.map((h: any) => (
                <div key={h.id} className="flex justify-between px-4 py-2 text-sm">
                  <span className="font-medium">{h.dayOfWeek}</span>
                  {h.isClosed ? (
                    <span className="text-gray-400">Kapalı</span>
                  ) : (
                    <span>{h.openTime} – {h.closeTime}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
