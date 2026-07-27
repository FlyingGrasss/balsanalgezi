// app/page.tsx
// REMOVE: import Head from 'next/head'; // This import is likely causing the problem

import VirtualTour from '@/components/VirtualTour';

export default function Home() {
  return (
    <>
      {/* REMOVE THE ENTIRE <Head> BLOCK */}
      {/* <Head>
        <title>School Virtual Tour</title>
        <meta name="description" content="Experience our school in 360°" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head> */}
      
      <main className="fixed inset-0">
        <VirtualTour />
      </main>
    </>
  );
}