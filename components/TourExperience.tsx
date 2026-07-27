'use client';

import dynamic from 'next/dynamic';
import type { MouseEvent, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

const INTRO_FADE_DURATION = 200;

const VirtualTour = dynamic(() => import('./VirtualTour'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-900" aria-hidden="true" />,
});

interface TourExperienceProps {
  introModal: ReactNode;
}

export default function TourExperience({ introModal }: TourExperienceProps) {
  const [isIntroOpen, setIsIntroOpen] = useState(true);
  const [isIntroMounted, setIsIntroMounted] = useState(true);
  const dismissTimerRef = useRef<number | null>(null);

  const startTour = useCallback(() => {
    if (!isIntroOpen) return;

    setIsIntroOpen(false);
    dismissTimerRef.current = window.setTimeout(() => {
      setIsIntroMounted(false);
    }, INTRO_FADE_DURATION);
  }, [isIntroOpen]);

  const handleIntroClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest('[data-intro-action="start"]')) {
        startTour();
      }
    },
    [startTour],
  );

  useEffect(() => {
    if (!isIntroOpen) return;

    const focusTimer = window.setTimeout(() => {
      document.getElementById('intro-modal-start')?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [isIntroOpen]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-900">
      <div
        className={`relative h-full w-full ${isIntroOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}
        aria-hidden={isIntroOpen}
      >
        {!isIntroOpen && <VirtualTour isActive />}
      </div>

      {isIntroMounted && (
        <div
          className={`fixed inset-0 z-[100] transition-opacity duration-200 ease-out ${
            isIntroOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={!isIntroOpen}
          onClick={handleIntroClick}
        >
          {introModal}
        </div>
      )}
    </div>
  );
}
