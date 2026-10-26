'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import { panoramaUrl, type PanoramaTier } from '@/lib/panoramas';

const CACHE_LIMITS: Record<PanoramaTier, number> = {
  preview: 6,
  mid: 2,
  high: 1,
};

const DISPOSE_DELAY_MS = 2000;
const TEXTURE_ANISOTROPY = 8;

interface CachedTexture {
  texture: THREE.Texture;
  lastUsed: number;
}

const textureCache: Record<PanoramaTier, Map<string, CachedTexture>> = {
  preview: new Map(),
  mid: new Map(),
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

function canUseHighTier(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  if (!window.matchMedia('(min-width: 900px) and (hover: hover)').matches) {
    return false;
  }

  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;

  if (connection?.saveData) {
    return false;
  }

  if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
    return false;
  }

  const deviceMemory = (
    navigator as Navigator & { deviceMemory?: number }
  ).deviceMemory;

  // The native high tier is a 6080x3040 texture (~74 MB of VRAM). Skip it on
  // devices that report very little memory rather than risking context loss.
  if (deviceMemory !== undefined && deviceMemory < 4) {
    return false;
  }

  return true;
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

export function useProgressivePanorama(panoramaId: number): ProgressivePanorama {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [textureId, setTextureId] = useState<number | null>(null);
  const [tier, setTier] = useState<PanoramaTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const ownerRef = useRef<object>({});
  const runTokenRef = useRef(0);
  const highTierEligibleRef = useRef<boolean | null>(null);

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
    const token = ++runTokenRef.current;
    const owner = ownerRef.current;
    let cancelled = false;
    let cancelIdle: (() => void) | null = null;

    const urls = {
      preview: panoramaUrl(panoramaId, 'preview'),
      mid: panoramaUrl(panoramaId, 'mid'),
      high: panoramaUrl(panoramaId, 'high'),
    };

    protectedUrlsByOwner.set(owner, new Set(Object.values(urls)));
    setError(null);

    if (highTierEligibleRef.current === null) {
      highTierEligibleRef.current = canUseHighTier();
    }

    const isCurrent = () => !cancelled && runTokenRef.current === token;

    const startHighOrFinish = () => {
      if (!isCurrent() || !highTierEligibleRef.current) {
        return;
      }

      cancelIdle = scheduleIdleWork(() => {
        if (!isCurrent()) {
          return;
        }

        void (async () => {
          const cachedHigh = getCachedTexture('high', urls.high);
          if (cachedHigh) {
            if (isCurrent()) {
              applyTexture(cachedHigh, 'high', panoramaId);
            }
            return;
          }

          try {
            const loaded = await loadPanoramaTexture(urls.high);
            if (!isCurrent()) {
              loaded.dispose();
              return;
            }

            applyTexture(cacheTexture('high', urls.high, loaded), 'high', panoramaId);
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
        startHighOrFinish();
        return;
      }

      try {
        const loaded = await loadPanoramaTexture(urls.mid);
        if (!isCurrent()) {
          loaded.dispose();
          return;
        }

        applyTexture(cacheTexture('mid', urls.mid, loaded), 'mid', panoramaId);
        startHighOrFinish();
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
    };
  }, [applyTexture, panoramaId, retryToken]);

  const retry = useCallback(() => {
    setError(null);
    setRetryToken(current => current + 1);
  }, []);

  return { texture, textureId, tier, isLoading, error, retry };
}
