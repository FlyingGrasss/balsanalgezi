// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bornova Anadolu Lisesi (BAL) Sanal Gezi', // Daha açıklayıcı başlık
  description: 'Bornova Anadolu Lisesi kampüsünü 360° sanal tur ile keşfedin. BAL, İzmir\'de üç dilde eğitim veren köklü bir Anadolu Lisesidir.', // Daha açıklayıcı açıklama
  keywords: [
    'Bornova Anadolu Lisesi',
    'BAL',
    'Sanal Tur',
    '360 Tur',
    'İzmir Lisesi',
    'Anadolu Lisesi',
    'Eğitim',
    'Okul',
    'İzmir',
    'Bornova',
    'BAL Sanal Gezi',
    'Okul Gezisi',
    'Geleceğin aydınlık sesi',
  ],
  authors: [{ name: 'Bornova Anadolu Lisesi' }],
  creator: 'Bornova Anadolu Lisesi',
  publisher: 'Bornova Anadolu Lisesi',
  metadataBase: new URL('https://izmirbal.meb.k12.tr'), // Okulun resmi sitesi URL'si
  openGraph: {
    title: 'Bornova Anadolu Lisesi (BAL) Sanal Gezi',
    description: 'Bornova Anadolu Lisesi kampüsünü 360° sanal tur ile keşfedin. BAL, İzmir\'de üç dilde eğitim veren köklü bir Anadolu Lisesidir.',
    url: 'https://izmirbal.meb.k12.tr', // Sanal turun yayınlanacağı URL
    siteName: 'Bornova Anadolu Lisesi Sanal Tur',
    images: [
      {
        url: '/logo.png', // Logo dosyanızın yolu
        width: 512, // Logonuza uygun genişlik
        height: 512, // Logonuza uygun yükseklik
        alt: 'Bornova Anadolu Lisesi Logosu',
      },
    ],
    locale: 'tr_TR', // Türkçe dilini belirtir
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image', // Büyük görsel içeren kart tipi
    title: 'Bornova Anadolu Lisesi (BAL) Sanal Gezi',
    description: 'Bornova Anadolu Lisesi kampüsünü 360° sanal tur ile keşfedin. BAL, İzmir\'de üç dilde eğitim veren köklü bir Anadolu Lisesidir.',
    images: ['/logo.png'], // Twitter kartında kullanılacak görsel
    creator: '@BALresmi', // Eğer okulun resmi bir Twitter hesabı varsa buraya eklenebilir
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Diğer meta etiketleri eklenebilir (örneğin, canonical URL, language alternatifi vb.)
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gray-900`}>
        {children}
      </body>
    </html>
  );
}
