'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

const ROLES = ['viewer', 'city_admin', 'super_admin'];
const ROLE_LABELS: Record<string, string> = {
  viewer: 'Kullanıcı', city_admin: 'Şehir Admin', super_admin: 'Süper Admin',
};
const ROLE_COLORS: Record<string, string> = {
  viewer: 'bg-gray-100 text-gray-600',
  city_admin: 'bg-blue-100 text-blue-700',
  super_admin: 'bg-red-100 text-red-700',
};

export default function KullanicilarPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/admin/users?limit=50').then((r) => {
      setUsers(r.data?.data ?? []);
      setTotal(r.data?.meta?.total ?? 0);
    }).finally(() => setLoading(false));
  }, []);

  const updateRole = async (id: string, role: string) => {
    setUpdating(id);
    try {
      await apiClient.patch(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
    } finally { setUpdating(null); }
  };

  const deleteUser = async (id: string, email: string) => {
    if (!confirm(`"${email}" kullanıcısını silmek istediğinizden emin misiniz?`)) return;
    setUpdating(id);
    try {
      await apiClient.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setTotal((t) => t - 1);
    } finally { setUpdating(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcılar</h1>
        <span className="text-sm text-gray-400">{total} kullanıcı</span>
      </div>

      {loading ? <p className="text-gray-400">Yükleniyor...</p> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">E-posta</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kayıt Tarihi</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{u.email}</p>
                      <p className="text-xs text-gray-400">{u.id.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      disabled={updating === u.id}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${ROLE_COLORS[u.role] ?? 'bg-gray-100'}`}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('tr-TR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteUser(u.id, u.email)} disabled={updating === u.id}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-40">
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
