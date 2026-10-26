export const PANORAMA_VERSION = 'v2' as const;

// Keep in sync with the first entry in lib/tour-data.ts.
export const FIRST_PANORAMA_ID = 1;

export const PANORAMA_TIERS = ['preview', 'mid', 'mobile', 'high'] as const;
export type PanoramaTier = (typeof PANORAMA_TIERS)[number];

export const PANORAMA_TIER_DIMENSIONS: Record<
  PanoramaTier,
  { width: number; height: number }
> = {
  preview: { width: 1024, height: 512 },
  mid: { width: 2560, height: 1280 },
  mobile: { width: 4096, height: 2048 },
  high: { width: 6080, height: 3040 },
};

export function panoramaUrl(id: number, tier: PanoramaTier): string {
  return `/panoramas/${PANORAMA_VERSION}/${tier}/${id}.webp`;
}
