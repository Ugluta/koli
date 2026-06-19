'use client';

import { useEffect, useState } from 'react';

interface AdData {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  ctaUrl: string;
  placement: string;
}

interface Props {
  placement: string;
  cityId?: string;
  className?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function AdSlot({ placement, cityId, className = '' }: Props) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ placement });
    if (cityId) params.set('cityId', cityId);

    fetch(`${API_URL}/ads/serve?${params}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setAd(data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [placement, cityId]);

  useEffect(() => {
    if (!ad) return;
    // fire impression
    const params = cityId ? `?cityId=${cityId}` : '';
    fetch(`${API_URL}/ads/impression/${ad.id}${params}`, { method: 'POST' }).catch(() => {});
  }, [ad, cityId]);

  if (!loaded || !ad) return null;

  return (
    <div className={`relative border border-gray-200 rounded-xl overflow-hidden bg-white ${className}`}>
      <span className="absolute top-1 left-1 text-[10px] text-gray-400 bg-white/80 px-1 rounded z-10">
        Reklam
      </span>
      <a
        href={`${API_URL}/ads/click/${ad.id}`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block group"
      >
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt={ad.title ?? 'Reklam'}
            className="w-full object-cover"
            style={{ maxHeight: placement.includes('banner') ? '120px' : '200px' }}
          />
        )}
        {(ad.title || ad.description) && (
          <div className="p-3">
            {ad.title && (
              <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                {ad.title}
              </p>
            )}
            {ad.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ad.description}</p>
            )}
          </div>
        )}
      </a>
    </div>
  );
}
