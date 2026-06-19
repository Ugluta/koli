'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface Props {
  countries: any[];
  cities: any[];
  currentCountry: string;
  currentCity: string;
  q: string;
  tab: string;
}

export default function SearchFilters({ countries, cities, currentCountry, currentCity, q, tab }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedCountry, setSelectedCountry] = useState(currentCountry);
  const [selectedCity, setSelectedCity] = useState(currentCity);

  const navigate = (country: string, city: string) => {
    const params = new URLSearchParams({ q, tab, page: '1' });
    if (country) params.set('country', country);
    if (city) params.set('city', city);
    startTransition(() => router.push(`/ara?${params}`));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCountry(val);
    setSelectedCity('');
    navigate(val, '');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCity(val);
    navigate(selectedCountry, val);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">Ülke</label>
        <select
          value={selectedCountry}
          onChange={handleCountryChange}
          className="w-full border rounded-lg px-2.5 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tüm ülkeler</option>
          {countries.map((c: any) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">Şehir</label>
        <select
          value={selectedCity}
          onChange={handleCityChange}
          className="w-full border rounded-lg px-2.5 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tüm şehirler</option>
          {cities.map((c: any) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {(selectedCountry || selectedCity) && (
        <button
          onClick={() => { setSelectedCountry(''); setSelectedCity(''); navigate('', ''); }}
          className="text-xs text-gray-400 hover:text-red-500 transition"
        >
          Filtreleri Temizle
        </button>
      )}
    </div>
  );
}
