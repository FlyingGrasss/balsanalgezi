import { panoramaUrl, type PanoramaTier } from './panoramas';

const inFlight = new Set<HTMLImageElement>();

/**
 * Warm the browser's HTTP cache for a panorama image without pulling the
 * Three.js runtime into the intro bundle. The texture loader can then reuse
 * the cached response when the tour actually starts.
 */
export function preloadPanoramaImage(id: number, tier: PanoramaTier): void {
  if (typeof window === 'undefined') {
    return;
  }

  const image = new Image();
  image.decoding = 'async';
  image.onload = () => inFlight.delete(image);
  image.onerror = () => inFlight.delete(image);
  inFlight.add(image);
  image.src = panoramaUrl(id, tier);
}
