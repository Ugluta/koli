'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('no-token'); return; }
    fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => setStatus(r.ok ? 'success' : 'error'))
      .catch(() => setStatus('error'));
  }, [token]);

  const resend = async () => {
    setResending(true);
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) { setResending(false); return; }
    await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => {});
    setResending(false);
    setResent(true);
  };

  if (status === 'loading') {
    return (
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Doğrulanıyor...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">E-posta doğrulandı!</h2>
        <p className="text-gray-500 text-sm mb-6">Hesabınız aktif. Panele giderek firmanızı yönetebilirsiniz.</p>
        <Link href="/panel" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          Panele Git
        </Link>
      </div>
    );
  }

  if (status === 'no-token') {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">E-postanızı doğrulayın</h2>
        <p className="text-gray-500 text-sm mb-4">
          Kayıt olduğunuz e-posta adresine bir doğrulama linki gönderdik. Lütfen e-postanızı kontrol edin.
        </p>
        {resent ? (
          <p className="text-green-600 text-sm">Yeni doğrulama linki gönderildi ✓</p>
        ) : (
          <button
            onClick={resend}
            disabled={resending}
            className="text-blue-600 text-sm hover:underline disabled:opacity-50"
          >
            {resending ? 'Gönderiliyor...' : 'Yeniden gönder'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-5xl mb-4">❌</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Doğrulama başarısız</h2>
      <p className="text-gray-500 text-sm mb-4">Link geçersiz veya süresi dolmuş olabilir.</p>
      {resent ? (
        <p className="text-green-600 text-sm">Yeni doğrulama linki gönderildi ✓</p>
      ) : (
        <button
          onClick={resend}
          disabled={resending}
          className="text-blue-600 text-sm hover:underline disabled:opacity-50"
        >
          {resending ? 'Gönderiliyor...' : 'Yeni link talep et'}
        </button>
      )}
      <div className="mt-4">
        <Link href="/panel" className="text-gray-400 text-sm hover:text-gray-600">Panele dön</Link>
      </div>
    </div>
  );
}

export default function EpostaDogrulaPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border p-8 w-full max-w-md">
        <Suspense fallback={<p className="text-center text-gray-400">Yükleniyor...</p>}>
          <VerifyContent />
        </Suspense>
      </div>
    </main>
  );
}
