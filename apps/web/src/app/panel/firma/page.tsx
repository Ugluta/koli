'use client';

import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api/client';

// Leaflet is loaded dynamically (SSR safe)
let L: typeof import('leaflet') | null = null;

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const SOCIAL_PLATFORMS = ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'tiktok', 'pinterest'];

interface Business {
  id: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  phone: string | null;
  phoneSecondary: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  location?: {
    addressLine1: string | null;
    cityId: number;
    districtId: number | null;
    postalCode: string | null;
    latitude: number | null;
    longitude: number | null;
    city?: { name: string };
  };
  hours?: Array<{ dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean; is24h: boolean }>;
  socialLinks?: Array<{ platform: string; url: string }>;
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition ${active ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function FirmaPage() {
  const [tab, setTab] = useState<'genel' | 'adres' | 'saatler' | 'sosyal'>('genel');
  const [biz, setBiz] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Genel form state
  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneSecondary, setPhoneSecondary] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  // Address state
  const [addressLine1, setAddressLine1] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Hours state — array indexed by dayOfWeek 0=Mon..6=Sun
  const [hours, setHours] = useState<Array<{ openTime: string; closeTime: string; isClosed: boolean; is24h: boolean }>>(
    Array.from({ length: 7 }, () => ({ openTime: '09:00', closeTime: '18:00', isClosed: false, is24h: false }))
  );

  // Social links
  const [socials, setSocials] = useState<Array<{ platform: string; url: string }>>([]);

  useEffect(() => {
    apiClient.get('/panel/businesses')
      .then(async (res) => {
        const b: Business = res.data?.data?.[0] ?? res.data?.[0];
        if (!b) return;
        setBiz(b);
        setName(b.name ?? '');
        setShortDesc(b.shortDescription ?? '');
        setDesc(b.description ?? '');
        setPhone(b.phone ?? '');
        setPhoneSecondary(b.phoneSecondary ?? '');
        setWhatsapp(b.whatsapp ?? '');
        setEmail(b.email ?? '');
        setWebsite(b.website ?? '');
        setAddressLine1(b.location?.addressLine1 ?? '');
        setPostalCode(b.location?.postalCode ?? '');
        setLat(b.location?.latitude ? Number(b.location.latitude) : null);
        setLng(b.location?.longitude ? Number(b.location.longitude) : null);
        if (b.hours?.length) {
          const h = Array.from({ length: 7 }, () => ({ openTime: '09:00', closeTime: '18:00', isClosed: false, is24h: false }));
          for (const hr of b.hours) {
            const idx = hr.dayOfWeek; // 0=Mon
            h[idx] = { openTime: hr.openTime ?? '09:00', closeTime: hr.closeTime ?? '18:00', isClosed: hr.isClosed, is24h: hr.is24h };
          }
          setHours(h);
        }
        if (b.socialLinks?.length) setSocials(b.socialLinks.map((s) => ({ platform: s.platform, url: s.url })));
      })
      .finally(() => setLoading(false));
  }, []);

  // Init Leaflet map when tab switches to adres
  useEffect(() => {
    if (tab !== 'adres' || !mapRef.current) return;
    if (mapInstanceRef.current) {
      // already initialized — just update marker
      if (lat && lng && markerRef.current) markerRef.current.setLatLng([lat, lng]);
      return;
    }
    import('leaflet').then((leaflet) => {
      L = leaflet.default ?? leaflet;
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      const initLat = lat ?? 41.0082;
      const initLng = lng ?? 28.9784;
      const map = L.map(mapRef.current!, { zoomControl: true }).setView([initLat, initLng], lat ? 15 : 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initLat, initLng], { draggable: true });
      if (lat && lng) marker.addTo(map);
      marker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        setLat(Number(pos.lat.toFixed(7)));
        setLng(Number(pos.lng.toFixed(7)));
      });
      map.on('click', (e: any) => {
        const pos = e.latlng;
        marker.setLatLng(pos).addTo(map);
        setLat(Number(pos.lat.toFixed(7)));
        setLng(Number(pos.lng.toFixed(7)));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    });
  }, [tab]);

  const geocodeAddress = async () => {
    if (!addressLine1) return;
    setGeocoding(true);
    try {
      const query = encodeURIComponent(addressLine1);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
        headers: { 'Accept-Language': 'tr', 'User-Agent': 'koli-directory/1.0' },
      });
      const data = await res.json();
      if (data[0]) {
        const newLat = Number(parseFloat(data[0].lat).toFixed(7));
        const newLng = Number(parseFloat(data[0].lon).toFixed(7));
        setLat(newLat);
        setLng(newLng);
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 15);
          markerRef.current.setLatLng([newLat, newLng]).addTo(mapInstanceRef.current);
        }
      }
    } finally {
      setGeocoding(false);
    }
  };

  const saveGenel = async () => {
    if (!biz) return;
    setSaving(true); setSaved(false); setError('');
    try {
      await apiClient.patch(`/panel/businesses/${biz.id}`, { name, shortDescription: shortDesc, description: desc, phone, phoneSecondary, whatsapp, email, website });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setError(e?.response?.data?.error?.message ?? 'Hata oluştu'); }
    finally { setSaving(false); }
  };

  const saveAddress = async () => {
    if (!biz) return;
    setSaving(true); setSaved(false); setError('');
    try {
      await apiClient.patch(`/panel/businesses/${biz.id}`, { addressLine1, postalCode, latitude: lat ?? undefined, longitude: lng ?? undefined });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setError(e?.response?.data?.error?.message ?? 'Hata oluştu'); }
    finally { setSaving(false); }
  };

  const saveHours = async () => {
    if (!biz) return;
    setSaving(true); setSaved(false); setError('');
    try {
      const payload = hours.map((h, i) => ({ dayOfWeek: i, openTime: h.isClosed || h.is24h ? undefined : h.openTime, closeTime: h.isClosed || h.is24h ? undefined : h.closeTime, isClosed: h.isClosed, is24h: h.is24h }));
      await apiClient.patch(`/panel/businesses/${biz.id}/hours`, { hours: payload });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setError(e?.response?.data?.error?.message ?? 'Hata oluştu'); }
    finally { setSaving(false); }
  };

  const saveSocials = async () => {
    if (!biz) return;
    setSaving(true); setSaved(false); setError('');
    try {
      await apiClient.patch(`/panel/businesses/${biz.id}/social-links`, { links: socials.filter((s) => s.url) });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setError(e?.response?.data?.error?.message ?? 'Hata oluştu'); }
    finally { setSaving(false); }
  };

  if (loading) return <p className="text-gray-400">Yükleniyor...</p>;
  if (!biz) return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Firma Oluştur</h1>
      <p className="text-gray-500 text-sm">Henüz firma kaydınız yok. Aşağıdan yeni firma oluşturabilirsiniz.</p>
      {/* TODO: create form */}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Firma Bilgileri</h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {([['genel', 'Genel'], ['adres', 'Adres & Harita'], ['saatler', 'Çalışma Saatleri'], ['sosyal', 'Sosyal Medya']] as const).map(([key, label]) => (
          <TabButton key={key} active={tab === key} onClick={() => setTab(key)}>{label}</TabButton>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {saved && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">Kaydedildi ✓</div>}

      {/* Genel Bilgiler */}
      {tab === 'genel' && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <Field label="Firma Adı *"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
          <Field label="Kısa Açıklama"><input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} maxLength={300} className={inputCls} /></Field>
          <Field label="Detaylı Açıklama"><textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefon"><input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className={inputCls} /></Field>
            <Field label="İkinci Telefon"><input value={phoneSecondary} onChange={(e) => setPhoneSecondary(e.target.value)} type="tel" className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="WhatsApp"><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} type="tel" className={inputCls} /></Field>
            <Field label="E-posta"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputCls} /></Field>
          </div>
          <Field label="Web Sitesi"><input value={website} onChange={(e) => setWebsite(e.target.value)} type="url" className={inputCls} placeholder="https://..." /></Field>
          <button onClick={saveGenel} disabled={saving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      )}

      {/* Adres & Harita */}
      {tab === 'adres' && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <Field label="Adres">
            <div className="flex gap-2">
              <input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className={`${inputCls} flex-1`} placeholder="Mahalle, cadde, sokak, no..." />
              <button
                type="button"
                onClick={geocodeAddress}
                disabled={geocoding || !addressLine1}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded-lg disabled:opacity-40 whitespace-nowrap"
                title="Adrese göre konumu bul"
              >
                {geocoding ? '⏳' : '📍 Bul'}
              </button>
            </div>
          </Field>
          <Field label="Posta Kodu"><input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputCls} maxLength={10} /></Field>

          {/* Coordinates display */}
          {lat && lng && (
            <p className="text-xs text-gray-400">Koordinat: {lat}, {lng}</p>
          )}

          {/* Leaflet Map */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Haritada Konum Seç</p>
            <p className="text-xs text-gray-400 mb-2">Haritaya tıklayın veya işaretçiyi sürükleyin.</p>
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <div ref={mapRef} className="w-full rounded-xl overflow-hidden border" style={{ height: 380 }} />
          </div>

          <button onClick={saveAddress} disabled={saving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : 'Adresi Kaydet'}
          </button>
        </div>
      )}

      {/* Çalışma Saatleri */}
      {tab === 'saatler' && (
        <div className="bg-white rounded-xl border p-6 space-y-3">
          {DAYS.map((day, i) => (
            <div key={i} className="flex items-center gap-3 flex-wrap">
              <span className="w-24 text-sm text-gray-700">{day}</span>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={hours[i].isClosed} onChange={(e) => setHours((h) => { const n=[...h]; n[i]={...n[i],isClosed:e.target.checked,is24h:false}; return n; })} />
                Kapalı
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={hours[i].is24h} onChange={(e) => setHours((h) => { const n=[...h]; n[i]={...n[i],is24h:e.target.checked,isClosed:false}; return n; })} />
                24 Saat
              </label>
              {!hours[i].isClosed && !hours[i].is24h && (
                <>
                  <input type="time" value={hours[i].openTime} onChange={(e) => setHours((h) => { const n=[...h]; n[i]={...n[i],openTime:e.target.value}; return n; })}
                    className="border rounded px-2 py-1 text-sm" />
                  <span className="text-gray-400">–</span>
                  <input type="time" value={hours[i].closeTime} onChange={(e) => setHours((h) => { const n=[...h]; n[i]={...n[i],closeTime:e.target.value}; return n; })}
                    className="border rounded px-2 py-1 text-sm" />
                </>
              )}
            </div>
          ))}
          <button onClick={saveHours} disabled={saving} className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : 'Saatleri Kaydet'}
          </button>
        </div>
      )}

      {/* Sosyal Medya */}
      {tab === 'sosyal' && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          {SOCIAL_PLATFORMS.map((platform) => {
            const existing = socials.find((s) => s.platform === platform);
            return (
              <Field key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                <input
                  value={existing?.url ?? ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    setSocials((prev) => {
                      const filtered = prev.filter((s) => s.platform !== platform);
                      return url ? [...filtered, { platform, url }] : filtered;
                    });
                  }}
                  type="url"
                  className={inputCls}
                  placeholder={`https://${platform}.com/...`}
                />
              </Field>
            );
          })}
          <button onClick={saveSocials} disabled={saving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      )}
    </div>
  );
}
