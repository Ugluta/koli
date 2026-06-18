import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Koli Şehir Rehberi',
    default: 'Koli Şehir Rehberi',
  },
  description: 'Şehirinizdeki firma, ürün ve hizmetleri keşfedin.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
