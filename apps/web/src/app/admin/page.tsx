'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalBusinesses: number;
  pendingBusinesses: number;
  activeBusinesses: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/admin/stats').then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Toplam Kullanıcı', value: stats?.totalUsers, color: 'bg-blue-50 text-blue-800', icon: '👥', href: '/admin/kullanicilar' },
    { label: 'Toplam Firma', value: stats?.totalBusinesses, color: 'bg-green-50 text-green-800', icon: '🏢', href: '/admin/firmalar' },
    { label: 'Onay Bekleyen', value: stats?.pendingBusinesses, color: 'bg-yellow-50 text-yellow-800', icon: '⏳', href: '/admin/firmalar?status=pending' },
    { label: 'Aktif Firma', value: stats?.activeBusinesses, color: 'bg-purple-50 text-purple-800', icon: '✅', href: '/admin/firmalar?status=active' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={`rounded-xl p-5 ${c.color} hover:opacity-90 transition`}>
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-3xl font-bold">{loading ? '...' : (c.value ?? 0).toLocaleString('tr-TR')}</div>
            <div className="text-xs mt-1 opacity-70">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
