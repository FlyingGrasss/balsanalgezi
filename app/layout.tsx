// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bornova Anadolu Lisesi (BAL) Sanal Gezi', // Daha açıklayıcı başlık
  description: 'Bornova Anadolu Lisesi kampüsünü 360° sanal tur ile keşfedin.', // Daha açıklayıcı açıklama
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
  metadataBase: new URL('https://www.balsanalgezi.com'), // Okulun resmi sitesi URL'si
  openGraph: {
    title: 'Bornova Anadolu Lisesi (BAL) Sanal Gezi',
    description: 'Bornova Anadolu Lisesi kampüsünü 360° sanal tur ile keşfedin.',
    url: 'https://www.balsanalgezi.com', // Sanal turun yayınlanacağı URL
    siteName: 'Bornova Anadolu Lisesi Sanal Tur',
    images: [
      {
        url: '/opengraph-image.jpg', // Logo dosyanızın yolu
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
    description: 'Bornova Anadolu Lisesi kampüsünü 360° sanal tur ile keşfedin.',
    images: ['/twitter-image.jpg'], // Twitter kartında kullanılacak görsel
    creator: '@izmirbornovaanadolulisesi', // Eğer okulun resmi bir Twitter hesabı varsa buraya eklenebilir
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
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} bg-gray-900`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
