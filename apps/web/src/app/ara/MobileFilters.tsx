'use client';

import { useState } from 'react';
import SearchFilters from './SearchFilters';

interface Props {
  countries: any[];
  cities: any[];
  currentCountry: string;
  currentCity: string;
  q: string;
  tab: string;
}

export default function MobileFilters(props: Props) {
  const [open, setOpen] = useState(false);
  const hasFilters = props.currentCountry || props.currentCity;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center gap-2 border rounded-xl px-4 py-2 text-sm text-gray-700 bg-white hover:border-blue-400 transition"
      >
        <span>🔍</span>
        Filtrele
        {hasFilters && <span className="w-2 h-2 rounded-full bg-blue-500 ml-1" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative ml-auto w-72 bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Filtreler</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <SearchFilters {...props} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
