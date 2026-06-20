import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://koli.app';

export const metadata: Metadata = {
  title: {
    template: '%s | Koli',
    default: 'Koli — Avrupa Firma Rehberi',
  },
  description: 'Avrupa genelinde firmalar, ürünler ve hizmetler için kapsamlı rehber.',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    siteName: 'Koli',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@koliapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
