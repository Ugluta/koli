'use client';

import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api/client';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const SOCIAL_PLATFORMS = ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'tiktok', 'pinterest'];

interface HourEntry { openTime: string; closeTime: string; isClosed: boolean; is24h: boolean }

// ── Firma Oluşturma Formu ─────────────────────────────────────────────────────
function CreateBusinessForm({ onCreated }: { onCreated: (b: any) => void }) {
  const [cities, setCities] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [cityId, setCityId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/cities').then((r) => setCities(r.data?.data ?? r.data ?? []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityId) { setError('Şehir seçimi zorunludur'); return; }
    setLoading(true); setError('');
    try {
      const res = await apiClient.post('/panel/businesses', {
        name,
        cityId: Number(cityId),
        phone: phone || undefined,
        email: email || undefined,
        website: website || undefined,
      });
      onCreated(res.data?.data ?? res.data);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? e?.response?.data?.message ?? 'Hata oluştu');
    } finally { setLoading(false); }
  };

  const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Firma Oluştur</h1>
      <p className="text-gray-500 text-sm mb-6">Rehberde görünmesi için firma kaydı oluşturun.</p>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Firma Adı *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} placeholder="Firma adınızı girin" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Şehir *</label>
          <select value={cityId} onChange={(e) => setCityId(e.target.value)} required className={inputCls}>
            <option value="">— Şehir seçin —</option>
            {cities.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}{c.country ? ` (${c.country.name})` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className={inputCls} placeholder="+90 5xx xxx xx xx" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} type="url" className={inputCls} placeholder="https://" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Oluşturuluyor...' : 'Firma Oluştur'}
        </button>
      </form>
    </div>
  );
}

// ── Logo / Kapak Yükleme ──────────────────────────────────────────────────────
function ImageUpload({
  label, currentUrl, businessId, folder, field, onUploaded,
}: {
  label: string;
  currentUrl: string | null;
  businessId: string;
  folder: string;
  field: 'logoUrl' | 'coverUrl';
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { setError('Dosya 5MB\'ı aşamaz'); return; }
    setUploading(true); setError('');
    try {
      const { data } = await apiClient.post(`/panel/businesses/${businessId}/media/presign`, {
        folder,
        filename: file.name,
        mimeType: file.type,
      });
      await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      await apiClient.patch(`/panel/businesses/${businessId}`, { [field]: data.publicUrl });
      onUploaded(data.publicUrl);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? 'Yükleme başarısız');
    } finally { setUploading(false); }
  };

  const aspect = field === 'logoUrl' ? 'aspect-square w-24' : 'aspect-video w-full max-w-xs';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt={label} className={`${aspect} object-cover rounded-xl border mb-2`} />
      )}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-40"
      >
        {uploading ? 'Yükleniyor...' : currentUrl ? 'Değiştir' : 'Yükle'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

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

function SaveBar({ saving, saved, onSave }: { saving: boolean; saved: boolean; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onSave} disabled={saving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
      {saved && <span className="text-sm text-green-600">Kaydedildi ✓</span>}
    </div>
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
      const L = (leaflet.default ?? leaflet) as typeof import('leaflet');
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
  if (!biz) return <CreateBusinessForm onCreated={(b) => { setBiz(b); setName(b.name); }} />;


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
          {/* Logo & Cover */}
          <div className="grid grid-cols-2 gap-6 pb-4 border-b">
            <ImageUpload
              label="Logo"
              currentUrl={biz.logoUrl}
              businessId={biz.id}
              folder="logos"
              field="logoUrl"
              onUploaded={(url) => setBiz((b) => b ? { ...b, logoUrl: url } : b)}
            />
            <ImageUpload
              label="Kapak Fotoğrafı"
              currentUrl={biz.coverUrl}
              businessId={biz.id}
              folder="covers"
              field="coverUrl"
              onUploaded={(url) => setBiz((b) => b ? { ...b, coverUrl: url } : b)}
            />
          </div>
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
          <SaveBar saving={saving} saved={saved} onSave={saveGenel} />
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
          {DAYS.map((day, i) => {
            const h = hours[i] ?? { openTime: '09:00', closeTime: '18:00', isClosed: false, is24h: false };
            const updateHour = (patch: Partial<HourEntry>) =>
              setHours((prev) => prev.map((e, idx) => idx === i ? { ...e, ...patch } : e));
            return (
              <div key={i} className="flex items-center gap-3 flex-wrap">
                <span className="w-24 text-sm text-gray-700">{day}</span>
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input type="checkbox" checked={h.isClosed} onChange={(e) => updateHour({ isClosed: e.target.checked, is24h: false })} />
                  Kapalı
                </label>
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input type="checkbox" checked={h.is24h} onChange={(e) => updateHour({ is24h: e.target.checked, isClosed: false })} />
                  24 Saat
                </label>
                {!h.isClosed && !h.is24h && (
                  <>
                    <input type="time" value={h.openTime} onChange={(e) => updateHour({ openTime: e.target.value })}
                      className="border rounded px-2 py-1 text-sm" />
                    <span className="text-gray-400">–</span>
                    <input type="time" value={h.closeTime} onChange={(e) => updateHour({ closeTime: e.target.value })}
                      className="border rounded px-2 py-1 text-sm" />
                  </>
                )}
              </div>
            );
          })}
          <div className="pt-2"><SaveBar saving={saving} saved={saved} onSave={saveHours} /></div>
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
          <SaveBar saving={saving} saved={saved} onSave={saveSocials} />
        </div>
      )}
    </div>
  );
}
