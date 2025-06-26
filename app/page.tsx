// app/page.tsx
import VirtualTour from '@/components/VirtualTour';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>School Virtual Tour</title>
        <meta name="description" content="Experience our school in 360°" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      
      <main className="fixed inset-0">
        <VirtualTour />
      </main>
    </>
  );
}