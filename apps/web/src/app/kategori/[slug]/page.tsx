import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${API_URL}/categories/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch { return null; }
}

async function getBusinesses(categorySlug: string, cursor?: string) {
  try {
    const url = `${API_URL}/businesses?category=${categorySlug}&limit=18${cursor ? `&cursor=${cursor}` : ''}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    const json = await res.json();
    return json.data ?? { data: [], meta: {} };
  } catch { return { data: [], meta: {} }; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cat = await getCategory(params.slug);
  if (!cat) return { title: 'Kategori Bulunamadı' };
  return {
    title: cat.seoTitle ?? `${cat.name} — Firma Rehberi`,
    description: cat.seoDescription ?? `${cat.name} kategorisindeki firmalar, ürünler ve hizmetler.`,
    alternates: { canonical: `/kategori/${params.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: { slug: string }; searchParams: { cursor?: string } }) {
  const [cat, result] = await Promise.all([
    getCategory(params.slug),
    getBusinesses(params.slug, searchParams.cursor),
  ]);
  if (!cat) notFound();

  const businesses: any[] = result.data ?? [];
  const nextCursor: string | null = result.meta?.nextCursor ?? null;
  const ancestors: any[] = cat.ancestors ?? [];

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Ana Sayfa', url: '/' },
    ...ancestors.map((a: any) => ({ name: a.name, url: `/kategori/${a.slug}` })),
    { name: cat.name, url: `/kategori/${params.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-400 mb-4 flex flex-wrap gap-1">
            <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
            {ancestors.map((a: any) => (
              <span key={a.id} className="flex items-center gap-1">
                <span>/</span>
                <Link href={`/kategori/${a.slug}`} className="hover:text-blue-600">{a.name}</Link>
              </span>
            ))}
            <span>/</span>
            <span className="text-gray-700">{cat.name}</span>
          </nav>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{cat.name}</h1>
            {cat.description && <p className="text-gray-500 mt-2">{cat.description}</p>}
          </div>

          {/* Subcategories */}
          {cat.children?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-base font-semibold text-gray-700 mb-3">Alt Kategoriler</h2>
              <div className="flex flex-wrap gap-2">
                {cat.children.map((child: any) => (
                  <Link
                    key={child.id}
                    href={`/kategori/${child.slug}`}
                    className="bg-white border rounded-lg px-3 py-1.5 text-sm hover:border-blue-400 hover:text-blue-600 transition"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Businesses */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {businesses.length > 0 ? `${cat.name} Firmaları` : 'Firma Bulunamadı'}
            </h2>
            {businesses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {businesses.map((b: any) => (
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
                          {b.location?.city && <p className="text-xs text-gray-400">{b.location.city.name}</p>}
                        </div>
                      </div>
                      {b.shortDescription && <p className="text-sm text-gray-600 line-clamp-2">{b.shortDescription}</p>}
                    </Link>
                  ))}
                </div>
                {nextCursor && (
                  <div className="mt-6 text-center">
                    <Link
                      href={`/kategori/${params.slug}?cursor=${nextCursor}`}
                      className="inline-block bg-white border rounded-xl px-6 py-2.5 text-sm font-medium hover:shadow-md transition"
                    >
                      Daha Fazla Göster →
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm">Bu kategoride henüz firma kaydı bulunmuyor.</p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
