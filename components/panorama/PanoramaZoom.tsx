'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const DEFAULT_FOV = 75;
const MIN_FOV = 35;
const ZOOMED_FOV = MIN_FOV;
const MAX_FOV = 82;
const ZOOM_DETAIL_THRESHOLD = 55;
const WHEEL_STEP = 4;
const DOUBLE_TAP_MS = 500;
const DOUBLE_TAP_DISTANCE = 30;
const TAP_MAX_MS = 350;
const TAP_MOVE_DISTANCE = 30;
const PINCH_GUARD_MS = 400;

interface PanoramaZoomProps {
  onZoomChange?: (zoomedIn: boolean) => void;
  onPinchChange?: (pinching: boolean) => void;
  controlsRef?: RefObject<OrbitControlsImpl | null>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

/**
 * FOV-based zoom for an equirectangular panorama. The camera sits at the
 * sphere center, so dollying is meaningless; narrowing the FOV magnifies the
 * view instead. Pinching also compensates the camera orientation so the point
 * under the pinch midpoint stays put.
 */
export default function PanoramaZoom({
  onZoomChange,
  onPinchChange,
  controlsRef,
}: PanoramaZoomProps) {
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

    const getControls = () => controlsRef?.current ?? null;

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
    let tapStartedAt = 0;
    let tapStartX = 0;
    let tapStartY = 0;
    let tapMoved = false;
    let pinchActive = false;
    let lastPinchEndAt = 0;
    let pinchStartDistance = 0;
    let pinchStartFov = perspectiveCamera.fov;
    let pinchStartAzimuth = 0;
    let pinchStartPolar = 0;
    let pinchNdcX = 0;
    let pinchNdcY = 0;

    const touchDistance = (touches: TouchList) =>
      Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY,
      );

    const pinchNdc = (touches: TouchList) => {
      const rect = element.getBoundingClientRect();
      const midX = (touches[0].clientX + touches[1].clientX) / 2;
      const midY = (touches[0].clientY + touches[1].clientY) / 2;

      return {
        x: ((midX - rect.left) / rect.width) * 2 - 1,
        y: -((midY - rect.top) / rect.height) * 2 + 1,
      };
    };

    const updatePinchOrientation = (
      nextFov: number,
      startFov: number,
      ndcX: number,
      ndcY: number,
      startAzimuth: number,
      startPolar: number,
    ) => {
      const controls = getControls();
      if (!controls) {
        return;
      }

      const aspect = perspectiveCamera.aspect || 1;
      const startTan = Math.tan(toRadians(startFov) / 2);
      const nextTan = Math.tan(toRadians(nextFov) / 2);
      const startAngleX = Math.atan(ndcX * startTan * aspect);
      const nextAngleX = Math.atan(ndcX * nextTan * aspect);
      const startAngleY = Math.atan(ndcY * startTan);
      const nextAngleY = Math.atan(ndcY * nextTan);

      controls.setAzimuthalAngle(
        startAzimuth - (startAngleX - nextAngleX),
      );
      controls.setPolarAngle(startPolar + (startAngleY - nextAngleY));
    };

    const endPinch = () => {
      if (!pinchActive) {
        return;
      }

      pinchActive = false;
      pinchStartDistance = 0;
      lastPinchEndAt = performance.now();

      const controls = getControls();
      if (controls) {
        controls.enabled = true;
      }
      onPinchChange?.(false);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        tapStartedAt = performance.now();
        tapStartX = touch.clientX;
        tapStartY = touch.clientY;
        tapMoved = false;
        return;
      }

      if (event.touches.length !== 2) {
        return;
      }

      pinchActive = true;
      pinchStartDistance = touchDistance(event.touches);
      pinchStartFov = perspectiveCamera.fov;

      const controls = getControls();
      pinchStartAzimuth = controls?.getAzimuthalAngle() ?? 0;
      pinchStartPolar = controls?.getPolarAngle() ?? Math.PI / 2;
      const ndc = pinchNdc(event.touches);
      pinchNdcX = ndc.x;
      pinchNdcY = ndc.y;

      if (controls) {
        controls.enabled = false;
      }
      onPinchChange?.(true);
      event.stopPropagation();
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        if (
          Math.hypot(touch.clientX - tapStartX, touch.clientY - tapStartY) >
          TAP_MOVE_DISTANCE
        ) {
          tapMoved = true;
        }
        return;
      }

      if (event.touches.length !== 2 || pinchStartDistance <= 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const ratio = touchDistance(event.touches) / pinchStartDistance;
      const nextFov = clamp(pinchStartFov / ratio, MIN_FOV, MAX_FOV);

      updatePinchOrientation(
        nextFov,
        pinchStartFov,
        pinchNdcX,
        pinchNdcY,
        pinchStartAzimuth,
        pinchStartPolar,
      );
      setFov(nextFov);
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        if (event.touches.length < 2) {
          endPinch();
        }
        return;
      }

      const now = performance.now();
      const wasPinch = pinchActive || now - lastPinchEndAt < PINCH_GUARD_MS;

      if (pinchActive) {
        endPinch();
      }

      const touch = event.changedTouches[0];
      if (
        wasPinch ||
        tapMoved ||
        !touch ||
        now - tapStartedAt > TAP_MAX_MS
      ) {
        lastTapAt = 0;
        return;
      }

      const isDoubleTap =
        now - lastTapAt < DOUBLE_TAP_MS &&
        Math.hypot(touch.clientX - lastTapX, touch.clientY - lastTapY) <
          DOUBLE_TAP_DISTANCE;

      if (isDoubleTap) {
        toggleZoom();
        lastTapAt = 0;
        return;
      }

      lastTapAt = now;
      lastTapX = touch.clientX;
      lastTapY = touch.clientY;
    };

    const onTouchCancel = () => {
      if (pinchActive) {
        endPinch();
      }
      lastTapAt = 0;
      tapMoved = true;
    };

    const hasFinePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)',
    ).matches;

    element.addEventListener('wheel', onWheel, { passive: false });
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
    gestureTarget.addEventListener('touchcancel', onTouchCancel, {
      passive: true,
      capture: true,
    });

    if (hasFinePointer) {
      element.addEventListener('dblclick', onDoubleClick);
    }

    return () => {
      cancelAnimation();
      element.removeEventListener('wheel', onWheel);
      gestureTarget.removeEventListener('touchstart', onTouchStart, true);
      gestureTarget.removeEventListener('touchmove', onTouchMove, true);
      gestureTarget.removeEventListener('touchend', onTouchEnd, true);
      gestureTarget.removeEventListener('touchcancel', onTouchCancel, true);
      element.removeEventListener('dblclick', onDoubleClick);

      const controls = getControls();
      if (controls) {
        controls.enabled = true;
      }
    };
  }, [camera, controlsRef, gl, onPinchChange, onZoomChange]);

  return null;
}
