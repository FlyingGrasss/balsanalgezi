'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import { panoramaUrl, type PanoramaTier } from '@/lib/panoramas';

const CACHE_LIMITS: Record<PanoramaTier, number> = {
  preview: 6,
  mid: 2,
  mobile: 1,
  high: 1,
};

const DISPOSE_DELAY_MS = 2000;
const TEXTURE_ANISOTROPY = 8;
const HIGH_QUALITY_QUIET_MS = 1500;
const ZOOMED_QUIET_MS = 500;
const HIGH_QUALITY_RETRY_MS = 300;

interface CachedTexture {
  texture: THREE.Texture;
  lastUsed: number;
}

const textureCache: Record<PanoramaTier, Map<string, CachedTexture>> = {
  preview: new Map(),
  mid: new Map(),
  mobile: new Map(),
  high: new Map(),
};

const pendingDisposals = new Map<THREE.Texture, ReturnType<typeof setTimeout>>();
const displayedByOwner = new Map<object, THREE.Texture>();
const protectedUrlsByOwner = new Map<object, ReadonlySet<string>>();

const textureLoader = new THREE.TextureLoader();

function isTextureDisplayed(texture: THREE.Texture): boolean {
  for (const displayed of displayedByOwner.values()) {
    if (displayed === texture) {
      return true;
    }
  }

  return false;
}

function isTextureCached(texture: THREE.Texture): boolean {
  for (const cache of Object.values(textureCache)) {
    for (const entry of cache.values()) {
      if (entry.texture === texture) {
        return true;
      }
    }
  }

  return false;
}

function isUrlProtected(url: string): boolean {
  for (const protectedUrls of protectedUrlsByOwner.values()) {
    if (protectedUrls.has(url)) {
      return true;
    }
  }

  return false;
}

function cancelPendingDisposal(texture: THREE.Texture): void {
  const timer = pendingDisposals.get(texture);
  if (timer === undefined) {
    return;
  }

  clearTimeout(timer);
  pendingDisposals.delete(texture);
}

function scheduleDisposal(texture: THREE.Texture): void {
  if (pendingDisposals.has(texture)) {
    return;
  }

  const timer = setTimeout(() => {
    pendingDisposals.delete(texture);
    if (isTextureDisplayed(texture) || isTextureCached(texture)) {
      return;
    }

    texture.dispose();
  }, DISPOSE_DELAY_MS);

  pendingDisposals.set(texture, timer);
}

function removeTextureFromCaches(texture: THREE.Texture): void {
  for (const cache of Object.values(textureCache)) {
    for (const [url, entry] of cache) {
      if (entry.texture === texture) {
        cache.delete(url);
      }
    }
  }
}

/**
 * Dispose the texture owned by an unmounting hook. The displayed-texture
 * guard keeps another mounted tour instance safe if it happens to show the
 * same cached texture.
 */
function disposeTextureOnUnmount(texture: THREE.Texture): void {
  if (isTextureDisplayed(texture)) {
    return;
  }

  cancelPendingDisposal(texture);
  removeTextureFromCaches(texture);
  texture.dispose();
}

function trimCache(tier: PanoramaTier): void {
  const cache = textureCache[tier];
  const limit = CACHE_LIMITS[tier];
  if (cache.size <= limit) {
    return;
  }

  const candidates = Array.from(cache.entries())
    .filter(([url, entry]) => !isUrlProtected(url) && !isTextureDisplayed(entry.texture))
    .sort((left, right) => left[1].lastUsed - right[1].lastUsed);

  for (const [url, entry] of candidates) {
    if (cache.size <= limit) {
      break;
    }

    cache.delete(url);
    scheduleDisposal(entry.texture);
  }
}

function trimAllCaches(): void {
  trimCache('preview');
  trimCache('mid');
  trimCache('mobile');
  trimCache('high');
}

function getCachedTexture(tier: PanoramaTier, url: string): THREE.Texture | null {
  const entry = textureCache[tier].get(url);
  if (!entry) {
    return null;
  }

  entry.lastUsed = Date.now();
  cancelPendingDisposal(entry.texture);
  return entry.texture;
}

function cacheTexture(tier: PanoramaTier, url: string, texture: THREE.Texture): THREE.Texture {
  const cache = textureCache[tier];
  const existing = cache.get(url);

  if (existing) {
    if (existing.texture !== texture) {
      texture.dispose();
    }

    existing.lastUsed = Date.now();
    cancelPendingDisposal(existing.texture);
    return existing.texture;
  }

  cache.set(url, { texture, lastUsed: Date.now() });
  cancelPendingDisposal(texture);
  trimCache(tier);
  return texture;
}

function getPremiumTier(): 'high' | 'mobile' | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null;
  }

  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;

  if (connection?.saveData) {
    return null;
  }

  if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
    return null;
  }

  const deviceMemory = (
    navigator as Navigator & { deviceMemory?: number }
  ).deviceMemory;

  if (deviceMemory !== undefined && deviceMemory < 4) {
    return null;
  }

  // Desktop gets the native 6080x3040 texture (~74 MB VRAM); touch devices
  // get a 4096x2048 tier (~33 MB VRAM) instead.
  const canUseNative =
    window.matchMedia('(min-width: 900px) and (hover: hover)').matches &&
    navigator.maxTouchPoints === 0;

  return canUseNative ? 'high' : 'mobile';
}

function scheduleIdleWork(callback: () => void): () => void {
  if (window.requestIdleCallback) {
    const idleId = window.requestIdleCallback(callback, { timeout: 2500 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(callback, 800);
  return () => window.clearTimeout(timeoutId);
}

async function loadPanoramaTexture(url: string): Promise<THREE.Texture> {
  const texture = await textureLoader.loadAsync(url);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.anisotropy = TEXTURE_ANISOTROPY;

  const image = texture.image as { decode?: () => Promise<void> } | undefined;
  if (image && typeof image.decode === 'function') {
    try {
      await image.decode();
    } catch {
      // The image already loaded; decoding is best-effort before it is shown.
    }
  }

  return texture;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Panorama image could not be loaded.');
}

export interface ProgressivePanorama {
  texture: THREE.Texture | null;
  textureId: number | null;
  tier: PanoramaTier | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

export function useProgressivePanorama(
  panoramaId: number,
  options: { zoomedIn?: boolean } = {},
): ProgressivePanorama {
  const zoomedIn = options.zoomedIn ?? false;
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [textureId, setTextureId] = useState<number | null>(null);
  const [tier, setTier] = useState<PanoramaTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const ownerRef = useRef<object>({});
  const runTokenRef = useRef(0);
  const premiumTierRef = useRef<'high' | 'mobile' | null | undefined>(undefined);
  const pointerDownRef = useRef(false);
  const lastInteractionRef = useRef(0);
  const zoomedInRef = useRef(false);

  const applyTexture = useCallback((
    nextTexture: THREE.Texture,
    nextTier: PanoramaTier,
    nextPanoramaId: number
  ) => {
    displayedByOwner.set(ownerRef.current, nextTexture);
    setTexture(nextTexture);
    setTextureId(nextPanoramaId);
    setTier(nextTier);
    trimAllCaches();
  }, []);

  useEffect(() => {
    const owner = ownerRef.current;

    return () => {
      const displayedTexture = displayedByOwner.get(owner) ?? null;
      displayedByOwner.delete(owner);
      protectedUrlsByOwner.delete(owner);

      if (displayedTexture) {
        disposeTextureOnUnmount(displayedTexture);
      }
    };
  }, []);

  useEffect(() => {
    zoomedInRef.current = zoomedIn;
  }, [zoomedIn]);

  useEffect(() => {
    const markInteraction = () => {
      lastInteractionRef.current = Date.now();
    };
    const handlePointerDown = () => {
      pointerDownRef.current = true;
      markInteraction();
    };
    const handlePointerUp = () => {
      pointerDownRef.current = false;
      markInteraction();
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerUp, { passive: true });
    window.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchend', handlePointerUp, { passive: true });
    window.addEventListener('touchcancel', handlePointerUp, { passive: true });
    window.addEventListener('blur', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('touchcancel', handlePointerUp);
      window.removeEventListener('blur', handlePointerUp);
    };
  }, []);

  useEffect(() => {
    const token = ++runTokenRef.current;
    const owner = ownerRef.current;
    let cancelled = false;
    let cancelIdle: (() => void) | null = null;

    const urls = {
      preview: panoramaUrl(panoramaId, 'preview'),
      mid: panoramaUrl(panoramaId, 'mid'),
      mobile: panoramaUrl(panoramaId, 'mobile'),
      high: panoramaUrl(panoramaId, 'high'),
    };

    protectedUrlsByOwner.set(owner, new Set(Object.values(urls)));
    setError(null);

    if (premiumTierRef.current === undefined) {
      premiumTierRef.current = getPremiumTier();
    }
    const premiumTier = premiumTierRef.current;

    const isCurrent = () => !cancelled && runTokenRef.current === token;

    // Anchor the quiet window to the room change itself so the native high
    // texture does not start uploading while the user is beginning to drag.
    lastInteractionRef.current = Date.now();

    let quietTimer: ReturnType<typeof setTimeout> | null = null;
    let applyTimer: ReturnType<typeof setTimeout> | null = null;

    const isHighQuiet = () => {
      if (pointerDownRef.current) {
        return false;
      }

      const quietMs = zoomedInRef.current
        ? ZOOMED_QUIET_MS
        : HIGH_QUALITY_QUIET_MS;

      return Date.now() - lastInteractionRef.current >= quietMs;
    };

    const applyHighWhenQuiet = (
      highTexture: THREE.Texture,
      tier: 'high' | 'mobile',
    ) => {
      if (!isCurrent()) {
        return;
      }

      if (!isHighQuiet()) {
        applyTimer = setTimeout(
          () => applyHighWhenQuiet(highTexture, tier),
          HIGH_QUALITY_RETRY_MS,
        );
        return;
      }

      applyTexture(highTexture, tier, panoramaId);
    };

    const scheduleHigh = () => {
      if (!isCurrent() || !premiumTier) {
        return;
      }

      // The native tier is a ~74 MB GPU upload. Never start it while the user
      // is dragging; wait until the pointer has been quiet for a moment.
      if (!isHighQuiet()) {
        quietTimer = setTimeout(scheduleHigh, HIGH_QUALITY_RETRY_MS);
        return;
      }

      cancelIdle = scheduleIdleWork(() => {
        if (!isCurrent()) {
          return;
        }

        if (!isHighQuiet()) {
          scheduleHigh();
          return;
        }

        void (async () => {
          const cachedHigh = getCachedTexture(premiumTier, urls[premiumTier]);
          if (cachedHigh) {
            applyHighWhenQuiet(cachedHigh, premiumTier);
            return;
          }

          try {
            const loaded = await loadPanoramaTexture(urls[premiumTier]);
            if (!isCurrent()) {
              loaded.dispose();
              return;
            }

            applyHighWhenQuiet(
              cacheTexture(premiumTier, urls[premiumTier], loaded),
              premiumTier,
            );
          } catch {
            // High quality is an enhancement; keep the last usable texture.
          }
        })();
      });
    };

    const startMid = async () => {
      if (!isCurrent()) {
        return;
      }

      const cachedMid = getCachedTexture('mid', urls.mid);
      if (cachedMid) {
        applyTexture(cachedMid, 'mid', panoramaId);
        scheduleHigh();
        return;
      }

      try {
        const loaded = await loadPanoramaTexture(urls.mid);
        if (!isCurrent()) {
          loaded.dispose();
          return;
        }

        applyTexture(cacheTexture('mid', urls.mid, loaded), 'mid', panoramaId);
        scheduleHigh();
      } catch {
        // Mid is an enhancement; the preview remains visible.
      }
    };

    const showPreview = (previewTexture: THREE.Texture) => {
      if (!isCurrent()) {
        return;
      }

      applyTexture(previewTexture, 'preview', panoramaId);
      setIsLoading(false);
      void startMid();
    };

    const cachedPreview = getCachedTexture('preview', urls.preview);
    if (cachedPreview) {
      showPreview(cachedPreview);
    } else {
      setIsLoading(true);

      void (async () => {
        try {
          const loaded = await loadPanoramaTexture(urls.preview);
          if (!isCurrent()) {
            loaded.dispose();
            return;
          }

          showPreview(cacheTexture('preview', urls.preview, loaded));
        } catch (loadError) {
          if (!isCurrent()) {
            return;
          }

          setIsLoading(false);
          setError(toError(loadError));
        }
      })();
    }

    return () => {
      cancelled = true;
      cancelIdle?.();
      if (quietTimer) {
        clearTimeout(quietTimer);
      }
      if (applyTimer) {
        clearTimeout(applyTimer);
      }
    };
  }, [applyTexture, panoramaId, retryToken]);

  const retry = useCallback(() => {
    setError(null);
    setRetryToken(current => current + 1);
  }, []);

  return { texture, textureId, tier, isLoading, error, retry };
}
