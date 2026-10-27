'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const DEFAULT_FOV = 75;
const MIN_FOV = 35;
const ZOOMED_FOV = MIN_FOV;
const MAX_FOV = 82;
const ZOOM_DETAIL_THRESHOLD = 55;
const WHEEL_STEP = 4;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_DISTANCE = 24;
const PINCH_GUARD_MS = 400;

interface PanoramaZoomProps {
  onZoomChange?: (zoomedIn: boolean) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * FOV-based zoom for an equirectangular panorama. The camera sits at the
 * sphere center, so dollying is meaningless; narrowing the FOV magnifies the
 * view instead.
 */
export default function PanoramaZoom({ onZoomChange }: PanoramaZoomProps) {
  const { camera, gl } = useThree();
  const animationRef = useRef<number | null>(null);
  const lastZoomedRef = useRef(false);

  useEffect(() => {
    const element = gl.domElement;
    const gestureTarget = element.parentElement ?? element;
    const perspectiveCamera = camera as THREE.PerspectiveCamera;

    if (!perspectiveCamera.isPerspectiveCamera) {
      return;
    }

    const setFov = (value: number) => {
      perspectiveCamera.fov = clamp(value, MIN_FOV, MAX_FOV);
      perspectiveCamera.updateProjectionMatrix();

      const zoomedIn = perspectiveCamera.fov <= ZOOM_DETAIL_THRESHOLD;
      if (zoomedIn !== lastZoomedRef.current) {
        lastZoomedRef.current = zoomedIn;
        onZoomChange?.(zoomedIn);
      }
    };

    const cancelAnimation = () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    const animateFov = (target: number) => {
      cancelAnimation();
      const start = perspectiveCamera.fov;
      const startedAt = performance.now();
      const duration = 220;

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setFov(start + (target - start) * eased);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(tick);
        } else {
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(tick);
    };

    const toggleZoom = () => {
      const isZoomedIn =
        perspectiveCamera.fov <= (DEFAULT_FOV + ZOOMED_FOV) / 2;
      animateFov(isZoomedIn ? DEFAULT_FOV : ZOOMED_FOV);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const direction = Math.sign(event.deltaY);

      if (direction === 0) {
        return;
      }

      cancelAnimation();
      setFov(perspectiveCamera.fov + direction * WHEEL_STEP);
    };

    const onDoubleClick = (event: MouseEvent) => {
      event.preventDefault();
      toggleZoom();
    };

    let lastTapAt = 0;
    let lastTapX = 0;
    let lastTapY = 0;
    let tapStartX = 0;
    let tapStartY = 0;
    let tapMoved = false;
    let pinchActive = false;
    let lastPinchEndAt = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') {
        return;
      }

      tapStartX = event.clientX;
      tapStartY = event.clientY;
      tapMoved = false;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') {
        return;
      }

      if (
        Math.hypot(event.clientX - tapStartX, event.clientY - tapStartY) > 12
      ) {
        tapMoved = true;
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') {
        return;
      }

      if (
        tapMoved ||
        pinchActive ||
        performance.now() - lastPinchEndAt < PINCH_GUARD_MS
      ) {
        lastTapAt = 0;
        return;
      }

      const now = performance.now();
      const isDoubleTap =
        now - lastTapAt < DOUBLE_TAP_MS &&
        Math.hypot(event.clientX - lastTapX, event.clientY - lastTapY) <
          DOUBLE_TAP_DISTANCE;

      if (isDoubleTap) {
        toggleZoom();
        lastTapAt = 0;
        return;
      }

      lastTapAt = now;
      lastTapX = event.clientX;
      lastTapY = event.clientY;
    };

    let pinchStartDistance = 0;
    let pinchStartFov = perspectiveCamera.fov;

    const touchDistance = (touches: TouchList) =>
      Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY,
      );

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) {
        return;
      }

      pinchActive = true;
      pinchStartDistance = touchDistance(event.touches);
      pinchStartFov = perspectiveCamera.fov;
      event.stopPropagation();
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2 || pinchStartDistance <= 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const ratio = touchDistance(event.touches) / pinchStartDistance;
      setFov(pinchStartFov / ratio);
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) {
        pinchActive = false;
        pinchStartDistance = 0;
        lastPinchEndAt = performance.now();
      }
    };

    const hasFinePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)',
    ).matches;

    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove, { passive: true });
    element.addEventListener('pointerup', onPointerUp);
    gestureTarget.addEventListener('touchstart', onTouchStart, {
      passive: true,
      capture: true,
    });
    gestureTarget.addEventListener('touchmove', onTouchMove, {
      passive: false,
      capture: true,
    });
    gestureTarget.addEventListener('touchend', onTouchEnd, {
      passive: true,
      capture: true,
    });
    gestureTarget.addEventListener('touchcancel', onTouchEnd, {
      passive: true,
      capture: true,
    });

    if (hasFinePointer) {
      element.addEventListener('dblclick', onDoubleClick);
    }

    return () => {
      cancelAnimation();
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      gestureTarget.removeEventListener('touchstart', onTouchStart, true);
      gestureTarget.removeEventListener('touchmove', onTouchMove, true);
      gestureTarget.removeEventListener('touchend', onTouchEnd, true);
      gestureTarget.removeEventListener('touchcancel', onTouchEnd, true);
      element.removeEventListener('dblclick', onDoubleClick);
    };
  }, [camera, gl, onZoomChange]);

  return null;
}
