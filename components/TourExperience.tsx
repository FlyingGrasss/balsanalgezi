'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

import IntroModal from '@/components/IntroModal';
import { FIRST_PANORAMA_ID } from '@/lib/panoramas';
import { preloadPanoramaImage } from '@/lib/panorama-preload';

function TourBootScreen() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Yükleniyor...</span>
      <span
        className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

const VirtualTour = dynamic(() => import('@/components/VirtualTour'), {
  ssr: false,
  loading: TourBootScreen,
});

export default function TourExperience() {
  const [isOpen, setIsOpen] = useState(true);
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const hasPreloadedRef = useRef(false);

  const preloadTour = useCallback(() => {
    if (hasPreloadedRef.current) {
      return;
    }

    hasPreloadedRef.current = true;

    // The first preview is already preloaded by the document <head>. Warm the
    // much larger Three.js chunk as soon as hydration finishes so a click does
    // not have to wait for it. Only warm the mid tier after that chunk settles,
    // so the image never competes with the critical JS download.
    void import('@/components/VirtualTour')
      .then(() => {
        const connection = (
          navigator as Navigator & { connection?: { saveData?: boolean } }
        ).connection;

        if (!connection?.saveData) {
          preloadPanoramaImage(FIRST_PANORAMA_ID, 'mid');
        }
      })
      .catch(() => {
        // The real dynamic import will surface a useful error when the tour starts.
      });
  }, []);

  useEffect(() => {
    preloadTour();
  }, [preloadTour]);

  return isOpen ? (
    <IntroModal
      language={language}
      onStartTour={() => setIsOpen(false)}
      onStartIntent={preloadTour}
      onLanguageToggle={() => setLanguage(previous => previous === 'tr' ? 'en' : 'tr')}
    />
  ) : (
    <VirtualTour language={language} />
  );
}
