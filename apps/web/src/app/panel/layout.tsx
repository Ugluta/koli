'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { label: 'Dashboard', href: '/panel', icon: '📊' },
  { label: 'Firma Bilgileri', href: '/panel/firma', icon: '🏢' },
  { label: 'Ürünler', href: '/panel/urunler', icon: '📦' },
  { label: 'Hizmetler', href: '/panel/hizmetler', icon: '🛠️' },
  { label: 'Galeri', href: '/panel/galeri', icon: '🖼️' },
  { label: 'İstatistikler', href: '/panel/istatistikler', icon: '📈' },
  { label: 'Üyelik', href: '/panel/uyelik', icon: '⭐' },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setUser(j.data))
      .catch(() => { localStorage.clear(); router.push('/login'); });
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg text-blue-600">Koli Panel</h1>
          {user && <p className="text-xs text-gray-400 mt-1 truncate">{user.email}</p>}
        </div>
        <nav className="flex-1 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => { localStorage.clear(); router.push('/login'); }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
