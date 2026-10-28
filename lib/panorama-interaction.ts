const HOTSPOT_GUARD_MS = 600;

let lastHotspotInteractionAt = 0;

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

export function markHotspotInteraction(): void {
  lastHotspotInteractionAt = now();
}

export function isHotspotInteractionRecent(): boolean {
  return now() - lastHotspotInteractionAt < HOTSPOT_GUARD_MS;
}
