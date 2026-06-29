'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { clearAuth, getToken } from '@/lib/auth';
import { apiClient } from '@/lib/api/client';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Firmalar', href: '/admin/firmalar', icon: '🏢' },
  { label: 'Kullanıcılar', href: '/admin/kullanicilar', icon: '👥' },
  { label: 'Faturalar', href: '/admin/faturalar', icon: '🧾' },
  { label: 'Scraper', href: '/admin/scraper', icon: '🤖' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { clearAuth(); router.push('/login?redirect=/admin'); return; }
    apiClient
      .get('/auth/me')
      .then((r) => {
        const u = r.data.data ?? r.data;
        if (u?.role !== 'super_admin') { setAuthError(true); return; }
        setUser(u);
      })
      .catch(() => { clearAuth(); router.push('/login'); });
  }, [router]);

  if (authError) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-2xl mb-2">🚫</p>
        <p className="text-gray-700 font-medium">Erişim Reddedildi</p>
        <p className="text-gray-400 text-sm mt-1">Bu sayfa yalnızca süper adminlere açıktır.</p>
        <a href="/panel" className="text-blue-600 text-sm mt-4 inline-block hover:underline">Panele Dön</a>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg text-red-600">Koli Admin</h1>
          {user && <p className="text-xs text-gray-400 mt-1 truncate">{user.email}</p>}
        </div>
        <nav className="flex-1 py-4">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                pathname === item.href ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <a href="/panel" className="text-xs text-gray-400 hover:text-blue-600 block mb-2">← Panele Dön</a>
          <button onClick={() => { clearAuth(); router.push('/login'); }}
            className="text-xs text-gray-400 hover:text-red-500">Çıkış Yap</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
