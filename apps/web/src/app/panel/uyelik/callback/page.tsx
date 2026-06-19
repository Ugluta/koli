'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// iyzico posts token to POST /billing/callback/iyzico which redirects here
// This page just handles the query params passed from the backend redirect
export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (success) {
        router.replace('/panel/uyelik?success=1');
      } else {
        router.replace('/panel/uyelik?error=payment_failed');
      }
    }, 1500);
    return () => clearTimeout(timeout);
  }, [success, error, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        {success ? (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-700 mb-2">Ödeme Başarılı</h2>
            <p className="text-gray-500">Yönlendiriliyorsunuz...</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-700 mb-2">Ödeme Başarısız</h2>
            <p className="text-gray-500">Yönlendiriliyorsunuz...</p>
          </>
        )}
      </div>
    </div>
  );
}
