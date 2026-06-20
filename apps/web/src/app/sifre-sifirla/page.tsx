'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-600 font-medium">Geçersiz bağlantı.</p>
        <Link href="/sifremi-unuttum" className="text-blue-600 text-sm mt-3 inline-block hover:underline">
          Yeni link talep et →
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Şifreler eşleşmiyor.'); return; }
    if (password.length < 8) { setError('Şifre en az 8 karakter olmalıdır.'); return; }
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.message ?? 'Bir hata oluştu.');
      }
      setStatus('success');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">✅</div>
        <p className="font-semibold text-gray-900 mb-2">Şifreniz güncellendi!</p>
        <p className="text-gray-500 text-sm mb-6">Yeni şifrenizle giriş yapabilirsiniz.</p>
        <Link href="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="En az 8 karakter"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Şifre Tekrar</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Şifreyi tekrar girin"
        />
      </div>
      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
      >
        {status === 'loading' ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
      </button>
    </form>
  );
}

export default function SifreSifirlaPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Şifre Sıfırlama</h1>
          <p className="text-gray-500 text-sm mt-2">Yeni şifrenizi belirleyin</p>
        </div>
        <Suspense fallback={<p className="text-center text-gray-400">Yükleniyor...</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
