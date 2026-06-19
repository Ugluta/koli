const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://koli.app';

export function localBusinessJsonLd(business: {
  name: string;
  slug: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  coverImageUrl?: string | null;
  location?: {
    addressLine1?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    city?: { name: string; country?: { name: string } | null } | null;
  } | null;
}) {
  const address = business.location
    ? {
        '@type': 'PostalAddress',
        streetAddress: business.location.addressLine1 ?? undefined,
        addressLocality: business.location.city?.name,
        addressCountry: business.location.city?.country?.name,
      }
    : undefined;

  const geo =
    business.location?.latitude && business.location?.longitude
      ? { '@type': 'GeoCoordinates', latitude: business.location.latitude, longitude: business.location.longitude }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    url: `${BASE_URL}/firma/${business.slug}`,
    description: business.description ?? undefined,
    telephone: business.phone ?? undefined,
    email: business.email ?? undefined,
    sameAs: business.website ? [business.website] : undefined,
    image: business.coverImageUrl ?? undefined,
    address,
    geo,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export function articleJsonLd(post: {
  title: string;
  slug: string;
  type: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
}) {
  const typeMap: Record<string, string> = {
    news: 'NewsArticle',
    blog: 'BlogPosting',
    event: 'Event',
    announcement: 'Article',
    campaign: 'Article',
  };

  const pathMap: Record<string, string> = {
    news: '/haber',
    blog: '/blog',
    event: '/etkinlik',
    announcement: '/duyuru',
    campaign: '/kampanya',
  };

  return {
    '@context': 'https://schema.org',
    '@type': typeMap[post.type] ?? 'Article',
    headline: post.title,
    url: `${BASE_URL}${pathMap[post.type] ?? '/haber'}/${post.slug}`,
    description: post.excerpt ?? undefined,
    image: post.coverImageUrl ?? undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt ?? undefined,
  };
}

export function cityDirectoryJsonLd(city: { name: string; slug: string; country?: { name: string } | null }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${city.name} İşletme Rehberi`,
    url: `${BASE_URL}/${city.slug}`,
    description: `${city.name} şehrindeki işletmeleri keşfedin`,
    ...(city.country ? { spatialCoverage: { '@type': 'Place', name: city.name, containedInPlace: { '@type': 'Country', name: city.country.name } } } : {}),
  };
}
