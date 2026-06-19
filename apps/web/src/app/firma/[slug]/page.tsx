import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { localBusinessJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld';

const BusinessMap = dynamic(() => import('@/components/map/BusinessMap').then(m => m.BusinessMap), { ssr: false });

interface Props { params: { slug: string } }

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://koli.app';
const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

async function getBusiness(slug: string) {
  const res = await fetch(`${API_URL}/businesses/${slug}`, { next: { revalidate: 600 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch business');
  const json = await res.json();
  return json.data ?? json;
}

async function getProducts(businessId: string) {
  try {
    const res = await fetch(`${API_URL}/panel/businesses/${businessId}/products?limit=12`, { next: { revalidate: 300 } });
    const json = await res.json();
    return json.data?.data ?? json.data ?? [];
  } catch { return []; }
}

async function getServices(businessId: string) {
  try {
    const res = await fetch(`${API_URL}/panel/businesses/${businessId}/services?limit=12`, { next: { revalidate: 300 } });
    const json = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

async function getGallery(businessId: string) {
  try {
    const res = await fetch(`${API_URL}/panel/businesses/${businessId}/gallery`, { next: { revalidate: 300 } });
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch { return []; }
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
      images: business.coverUrl ? [{ url: business.coverUrl }] : [],
      type: 'website',
      url: `${SITE_URL}/firma/${params.slug}`,
    },
  };
}

export default async function FirmaDetailPage({ params }: Props) {
  const business = await getBusiness(params.slug);
  if (!business) notFound();

  const [products, services, gallery] = await Promise.all([
    getProducts(business.id),
    getServices(business.id),
    getGallery(business.id),
  ]);

  const jsonLd = localBusinessJsonLd(business);
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Ana Sayfa', url: '/' },
    ...(business.location?.city
      ? [{ name: business.location.city.name, url: `/${business.location.city.slug}` }]
      : []),
    { name: business.name, url: `/firma/${params.slug}` },
  ]);

  const socialIcons: Record<string, string> = {
    facebook: '🔵', instagram: '📸', twitter: '🐦', youtube: '▶️',
    linkedin: '💼', tiktok: '🎵', pinterest: '📌',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex flex-wrap gap-1">
          <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
          {business.location?.city && (
            <>
              <span>/</span>
              <Link href={`/${business.location.city.slug}`} className="hover:text-blue-600">{business.location.city.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-700">{business.name}</span>
        </nav>

        {/* Cover */}
        {business.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.coverUrl} alt={business.name} className="w-full h-56 object-cover rounded-xl mb-6" />
        )}

        {/* Header */}
        <header className="mb-8 flex items-start gap-5">
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logoUrl} alt={business.name} className="w-20 h-20 rounded-xl object-cover border shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl border shrink-0">
              {business.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{business.name}</h1>
            {business.location?.city && (
              <p className="text-gray-500 text-sm mb-2">
                📍 {business.location.city.name}
                {business.location.city.country ? `, ${business.location.city.country.name}` : ''}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {business.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  ✓ Doğrulanmış
                </span>
              )}
              {business.isFeatured && (
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                  ⭐ Öne Çıkan
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Contact buttons */}
        <section className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {business.phone && (
            <a href={`tel:${business.phone}`} className="flex items-center gap-2 p-3 border rounded-xl hover:bg-gray-50 transition">
              <span>📞</span><span className="text-sm truncate">{business.phone}</span>
            </a>
          )}
          {business.whatsapp && (
            <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 border rounded-xl hover:bg-gray-50 transition">
              <span>💬</span><span className="text-sm">WhatsApp</span>
            </a>
          )}
          {business.email && (
            <a href={`mailto:${business.email}`} className="flex items-center gap-2 p-3 border rounded-xl hover:bg-gray-50 transition">
              <span>✉️</span><span className="text-sm truncate">{business.email}</span>
            </a>
          )}
          {business.website && (
            <a href={business.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 border rounded-xl hover:bg-gray-50 transition">
              <span>🌐</span><span className="text-sm truncate">{business.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </section>

        {/* Social links */}
        {business.socialLinks?.length > 0 && (
          <section className="mb-8 flex flex-wrap gap-2">
            {business.socialLinks.map((s: any) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 text-sm transition capitalize">
                <span>{socialIcons[s.platform] ?? '🔗'}</span>{s.platform}
              </a>
            ))}
          </section>
        )}

        {/* Description */}
        {(business.description || business.shortDescription) && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Hakkında</h2>
            <div className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: business.description ?? business.shortDescription }} />
          </section>
        )}

        {/* Products */}
        {products.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Ürünler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((p: any) => (
                <div key={p.id} className="bg-white border rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    {p.shortDescription && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.shortDescription}</p>}
                  </div>
                  {p.price && (
                    <p className="text-sm font-semibold text-blue-700 ml-3 shrink-0">
                      {Number(p.price).toLocaleString('tr-TR')} ₺
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {services.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Hizmetler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((s: any) => (
                <div key={s.id} className="bg-white border rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-900">{s.name}</p>
                    {(s.priceMin || s.priceMax) && (
                      <p className="text-sm text-blue-700 ml-3 shrink-0">
                        {s.priceMin && s.priceMax
                          ? `${Number(s.priceMin).toLocaleString('tr-TR')} – ${Number(s.priceMax).toLocaleString('tr-TR')} ₺`
                          : `${Number(s.priceMin ?? s.priceMax).toLocaleString('tr-TR')} ₺`}
                        {s.priceUnit && <span className="text-gray-400">/{s.priceUnit}</span>}
                      </p>
                    )}
                  </div>
                  {s.durationMinutes && <p className="text-xs text-gray-400 mt-1">⏱ {s.durationMinutes} dakika</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Galeri</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((item: any) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={item.id} src={item.url} alt={item.altText ?? business.name}
                  className="w-full aspect-square object-cover rounded-xl border" />
              ))}
            </div>
          </section>
        )}

        {/* Address + Map */}
        {business.location?.addressLine1 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Adres</h2>
            <p className="text-gray-700 mb-2">{business.location.addressLine1}</p>
            {business.location.postalCode && <p className="text-sm text-gray-400">{business.location.postalCode}</p>}
            {business.location.latitude && business.location.longitude && (
              <>
                <a href={`https://maps.google.com/?q=${business.location.latitude},${business.location.longitude}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 text-sm mt-2 mb-4 hover:underline">
                  📍 Google Harita'da Aç
                </a>
                <BusinessMap
                  lat={Number(business.location.latitude)}
                  lng={Number(business.location.longitude)}
                  name={business.name}
                />
              </>
            )}
          </section>
        )}

        {/* Working hours */}
        {business.hours?.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Çalışma Saatleri</h2>
            <div className="bg-white border rounded-xl divide-y">
              {business.hours.map((h: any) => (
                <div key={h.id ?? h.dayOfWeek} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="font-medium text-gray-700">{DAYS[h.dayOfWeek] ?? h.dayOfWeek}</span>
                  {h.isClosed ? (
                    <span className="text-gray-400">Kapalı</span>
                  ) : h.is24h ? (
                    <span className="text-green-600">24 Saat Açık</span>
                  ) : (
                    <span className="text-gray-700">{h.openTime?.slice(0, 5)} – {h.closeTime?.slice(0, 5)}</span>
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
