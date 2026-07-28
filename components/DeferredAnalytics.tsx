'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Analytics = dynamic(
  () => import('@vercel/analytics/next').then(({ Analytics: AnalyticsComponent }) => AnalyticsComponent),
  { ssr: false },
);

export default function DeferredAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const loadAnalytics = () => setShouldLoad(true);

    if ('requestIdleCallback' in window) {
      const idleCallbackId = window.requestIdleCallback(loadAnalytics, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleCallbackId);
    }

    const timeoutId = setTimeout(loadAnalytics, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  return shouldLoad ? <Analytics /> : null;
}
