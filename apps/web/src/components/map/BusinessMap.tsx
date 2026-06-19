'use client';

import { useEffect, useRef } from 'react';

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export function BusinessMap({ lat, lng, name }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!ref.current || initialized.current) return;
    initialized.current = true;

    import('leaflet').then((leaflet) => {
      const L = leaflet.default ?? leaflet;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      const map = L.map(ref.current!, { zoomControl: true, scrollWheelZoom: false }).setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      L.marker([lat, lng]).addTo(map).bindPopup(name).openPopup();
    });
  }, [lat, lng, name]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={ref} className="w-full rounded-xl overflow-hidden border" style={{ height: 300 }} />
    </>
  );
}
