'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import IntroModal from '@/components/IntroModal';

const VirtualTour = dynamic(() => import('@/components/VirtualTour'), {
  ssr: false,
});

export default function TourExperience() {
  const [isOpen, setIsOpen] = useState(true);
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');

  return isOpen ? (
    <IntroModal
      language={language}
      onStartTour={() => setIsOpen(false)}
      onLanguageToggle={() => setLanguage(previous => previous === 'tr' ? 'en' : 'tr')}
    />
  ) : (
    <VirtualTour language={language} />
  );
}
