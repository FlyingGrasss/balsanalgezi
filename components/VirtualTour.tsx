'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { X } from 'lucide-react';

import { preloadPanoramaImage } from '@/lib/panorama-preload';
import { markHotspotInteraction } from '@/lib/panorama-interaction';
import {
  GLOBAL_SIDEBAR_LOCATION_INDICES,
  locations,
  type Hotspot,
  type InfoContent,
  type Location,
} from '@/lib/tour-data';
import Panorama from '@/components/panorama/Panorama';
import PanoramaZoom from '@/components/panorama/PanoramaZoom';
import { useProgressivePanorama } from '@/components/panorama/useProgressivePanorama';

type Language = 'tr' | 'en';

interface TourCopy {
  loadingText: string;
  sidebarTitle: string;
  sidebarCloseLabel: string;
  openSidebarLabel: string;
  closeButtonText: string;
  locations: string[];
}

// --- Translations used by the tour shell ---
const translations: Record<Language, TourCopy> = {
  tr: {
    loadingText: "Yükleniyor...",
    sidebarTitle: "Yerler",
    sidebarCloseLabel: "Sidebarı kapat",
    openSidebarLabel: "Sidebarı Aç",
    closeButtonText: "Kapat",
    locations: [
      "Giriş", "2", "3", "Anaokulu Arkası", "B Blok ile C Blok Arası", "B Blok Önü",
      "B Blok Giriş", "B Blok Koridor", "Matematik ve Bilim Atölyesi", "Robotik Odası",
      "Dörtyol", "C Blok Önü", "C Blok", "Bilgisayar Odası", "Fizik Odası",
      "A Blok Öğretmen Girişi", "Brifing Salonu", "Örnek Sınıf", "A Blok Hol",
      "20", "Koru (C Blok Yanı)", "C Blok Yanı", "BALEV Merdiven Önü",
      "BALEV Merdivenleri", "BALEV Yanı", "BALEV Arkası", "Koru (BALEV Arkası)",
      "Koru (Arka Giriş)", "Koru (A Blok Arkası)", "Kantin Yanı", "31",
      "Müzik / Resim Atölyeleri", "Müzik Atölyesi Arkası", "G Blok Arkası",
      "G Blok Önü", "36", "Halı Saha", "G Blok", "Eski Kantin", "A Blok Önü",
      "Spor Sahası", "Spor Salonu Önü", "Tören Alanı", "Konferans Salonu"
    ]
  },
  en: {
    loadingText: "Loading...",
    sidebarTitle: "Locations",
    sidebarCloseLabel: "Close Sidebar",
    openSidebarLabel: "Open Sidebar",
    closeButtonText: "Close",
    locations: [
      "Entrance", "2", "3", "Behind Kindergarten", "Between B Block and C Block", "In front of B Block",
      "B Block Entrance", "B Block Corridor", "Mathematics and Science Workshop", "Robotics Room",
      "Crossroads", "In front of C Block", "C Block", "Computer Room", "Physics Room",
      "A Block Teacher's Entrance", "Briefing Hall", "Sample Classroom", "A Block Hall",
      "20", "Grove (Next to C Block)", "Next to C Block", "BALEV Staircase Front",
      "BALEV Stairs", "Next to BALEV", "Behind BALEV", "Grove (Behind BALEV)",
      "Grove (Back Entrance)", "Grove (Behind A Block)", "Next to Canteen", "31",
      "Music / Art Workshops", "Behind Music Workshop", "Behind G Block",
      "In front of G Block", "36", "Astroturf Pitch", "G Block", "Old Canteen", "In front of A Block",
      "Sports Field", "In front of Sports Hall", "Ceremony Area", "Conference Hall"
    ]
  }
};

const errorMessages: Record<Language, { title: string; retry: string }> = {
  tr: {
    title: "Görüntü yüklenemedi.",
    retry: "Tekrar dene",
  },
  en: {
    title: "The image could not be loaded.",
    retry: "Retry",
  },
};

const DEFAULT_PANORAMA_ROTATION: [number, number, number] = [0, 0, 0];

// --- Inline SVG Contents ---
const INFO_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
const ARROW_DOWN_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 24 24" fill="purple" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-down-icon lucide-arrow-big-down"><path d="M15 6v6h4l-7 7-7-7h4V6h6z"/></svg>`;
const ARROW_LEFT_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 24 24" fill="purple" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-left"><path d="M18 15h-6v4l-7-7 7-7v4h6v6z"/></svg>`;
const ARROW_RIGHT_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 24 24" fill="purple" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-right"><path d="M6 9h6V5l7 7-7 7v-4H6V9z"/></svg>`;
const ARROW_UP_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 24 24" fill="purple" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-up-icon lucide-arrow-big-up"><path d="M9 18v-6H5l7-7 7 7h-4v6H9z"/></svg>`;
// --- End Inline SVG Contents ---

const createTextureFromSvgString = async (
  svgString: string,
  width = 512,
  height = 512
): Promise<THREE.Texture | null> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }

    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      URL.revokeObjectURL(url);
      resolve(texture);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
};

interface HotspotIconTextures {
  info: THREE.Texture | null;
  arrowDown: THREE.Texture | null;
  arrowLeft: THREE.Texture | null;
  arrowRight: THREE.Texture | null;
  arrowUp: THREE.Texture | null;
}

const EMPTY_ICON_TEXTURES: HotspotIconTextures = {
  info: null,
  arrowDown: null,
  arrowLeft: null,
  arrowRight: null,
  arrowUp: null,
};

// --- Hotspot component ---
interface HotspotComponentProps {
  hotspot: Hotspot;
  infoIconTexture: THREE.Texture | null;
  arrowDownIconTexture: THREE.Texture | null;
  arrowLeftIconTexture: THREE.Texture | null;
  arrowRightIconTexture: THREE.Texture | null;
  arrowUpIconTexture: THREE.Texture | null;
  onHotspotClick: (hotspot: Hotspot) => void;
}

function HotspotComponent({
  hotspot,
  infoIconTexture,
  arrowDownIconTexture,
  arrowLeftIconTexture,
  arrowRightIconTexture,
  arrowUpIconTexture,
  onHotspotClick
}: HotspotComponentProps) {
  const position = useMemo(() => new THREE.Vector3(
    hotspot.position.x * 50,
    hotspot.position.y * 50,
    hotspot.position.z * 50
  ), [hotspot.position]);

  const spriteRef = useRef<THREE.Sprite>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame((state) => {
    if (groupRef.current) {
      // Keep hotspots roughly the same size on screen while the FOV zooms.
      const fov = (camera as THREE.PerspectiveCamera).fov ?? 75;
      groupRef.current.scale.setScalar(fov / 75);
    }

    if (hotspot.type && hotspot.type.startsWith('animated-arrow') && spriteRef.current) {
      const time = state.clock.elapsedTime;
      spriteRef.current.position.y = (hotspot.position.y * 50) + Math.sin(time * 2) * 3;
    }
  });

  const labelTexture = useMemo(() => {
    if (hotspot.type !== 'info' || !hotspot.label || hotspot.label.trim() === '') {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      const radius = 30;
      const x = 0;
      const y = 0;
      const width = canvas.width;
      const height = canvas.height;

      context.fillStyle = 'rgba(0, 0, 0, 0.7)';

      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.arcTo(x + width, y, x + width, y + radius, radius);
      context.lineTo(x + width, y + height - radius);
      context.arcTo(x + width, y + height, x + width - radius, y + height, radius);
      context.lineTo(x + radius, y + height);
      context.arcTo(x, y + height, x, y + height - radius, radius);
      context.lineTo(x, y + radius);
      context.arcTo(x, y, x + radius, y, radius);
      context.closePath();
      context.fill();

      context.font = '60px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(hotspot.label, canvas.width / 2, canvas.height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, [hotspot.label, hotspot.type]);

  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onHotspotClick(hotspot);
  }, [hotspot, onHotspotClick]);

  if (hotspot.type === 'info') {
    if (!infoIconTexture) return null;

    return (
      <group ref={groupRef} position={position}>
        <sprite scale={[4, 4, 1.3]} onClick={handleClick}>
          <spriteMaterial map={infoIconTexture} transparent />
        </sprite>
        {labelTexture && (
          <sprite position={[0, 3, 0]} scale={[12, 3, 2]}>
            <spriteMaterial map={labelTexture} />
          </sprite>
        )}
      </group>
    );
  }

  if (hotspot.type && hotspot.type.startsWith('animated-arrow')) {
    let currentArrowTexture: THREE.Texture | null = null;

    switch (hotspot.type) {
      case 'animated-arrow-down':
        currentArrowTexture = arrowDownIconTexture;
        break;
      case 'animated-arrow-left':
        currentArrowTexture = arrowLeftIconTexture;
        break;
      case 'animated-arrow-right':
        currentArrowTexture = arrowRightIconTexture;
        break;
      case 'animated-arrow-up':
        currentArrowTexture = arrowUpIconTexture;
        break;
      default:
        currentArrowTexture = null;
    }

    if (!currentArrowTexture) return null;

    const spriteRotation = new THREE.Euler(-Math.PI / 2, 0, 0);

    return (
      <group ref={groupRef} position={position}>
        <sprite ref={spriteRef} scale={[15, 15, 1.5]} onClick={handleClick} rotation={spriteRotation}>
          <spriteMaterial map={currentArrowTexture} transparent />
        </sprite>
      </group>
    );
  }

  return null;
}
// --- End hotspot component ---

// --- Sidebar component ---
interface SidebarProps {
  locations: Location[];
  currentLocation: number;
  setCurrentLocation: (index: number) => void;
  isOpen: boolean;
  onClose: () => void;
  locale: Language;
}

function Sidebar({ locations, currentLocation, setCurrentLocation, isOpen, onClose, locale }: SidebarProps) {
  const t = translations[locale];

  const handleLocationClick = (index: number) => {
    setCurrentLocation(index);
    onClose();
  };

  const displayedLocations = useMemo(() => {
    const validLocations: { originalIndex: number; name: string }[] = [];
    if (GLOBAL_SIDEBAR_LOCATION_INDICES && GLOBAL_SIDEBAR_LOCATION_INDICES.length > 0) {
      GLOBAL_SIDEBAR_LOCATION_INDICES.forEach(index => {
        if (locations[index]) {
          validLocations.push({
            originalIndex: index,
            name: t.locations[index] || locations[index].name
          });
        }
      });
    } else {
      locations.forEach((loc, index) => {
        validLocations.push({
          originalIndex: index,
          name: t.locations[index] || loc.name
        });
      });
    }
    return validLocations;
  }, [locations, t.locations]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}

      <div
        id="tour-locations-sidebar"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed top-0 right-0 h-full w-64 bg-white/95 backdrop-blur-sm shadow-lg z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-xl font-bold select-none text-gray-800">{t.sidebarTitle}</h2>
          <button
            onClick={onClose}
            className="p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
            aria-label={t.sidebarCloseLabel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 bg-gray-200 space-y-2 overflow-y-auto max-h-[calc(100%-8rem)]">
          {displayedLocations.map((location) => (
            <button
              key={location.originalIndex}
              onClick={() => handleLocationClick(location.originalIndex)}
              className={`block w-full cursor-pointer select-none text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentLocation === location.originalIndex
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-800 hover:bg-blue-50'
                }`}
            >
              {location.name}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
// --- End sidebar component ---

interface VirtualTourProps {
  language: Language;
}

export default function VirtualTour({ language }: VirtualTourProps) {
  const [currentLocation, setCurrentLocation] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<InfoContent | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCredit, setShowCredit] = useState(true);
  const [dismissedError, setDismissedError] = useState<Error | null>(null);
  const [iconTextures, setIconTextures] = useState<HotspotIconTextures>(EMPTY_ICON_TEXTURES);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [isPinching, setIsPinching] = useState(false);

  const t = translations[language];
  const copy = errorMessages[language];
  const activeLocation = locations[currentLocation];
  const { texture, textureId, isLoading, error, retry } = useProgressivePanorama(
    activeLocation.panoramaId,
    { zoomedIn: isZoomedIn }
  );
  const hasTexture = texture !== null;

  const displayedLocation = useMemo(() => {
    if (textureId === null) {
      return null;
    }

    return locations.find(location => location.panoramaId === textureId) ?? null;
  }, [textureId]);

  const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);
  const iconTexturesRef = useRef<THREE.Texture[]>([]);

  const handlePinchChange = useCallback((pinching: boolean) => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = !pinching;
    }
    setIsPinching(pinching);
  }, []);

  const goToLocation = useCallback((index: number) => {
    if (index < 0 || index >= locations.length) {
      return;
    }

    setDismissedError(null);
    setCurrentLocation(index);
  }, []);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    markHotspotInteraction();

    if (hotspot.target !== undefined) {
      goToLocation(hotspot.target);
    } else if (hotspot.info) {
      setModalContent(hotspot.info);
      setShowModal(true);
    }
  }, [goToLocation]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(previous => !previous);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleRetry = useCallback(() => {
    setDismissedError(null);
    retry();
  }, [retry]);

  useEffect(() => {
    let cancelled = false;

    const loadIconTextures = async () => {
      const [info, arrowDown, arrowLeft, arrowRight, arrowUp] = await Promise.all([
        createTextureFromSvgString(INFO_SVG_CONTENT, 64, 64),
        createTextureFromSvgString(ARROW_DOWN_SVG_CONTENT, 512, 512),
        createTextureFromSvgString(ARROW_LEFT_SVG_CONTENT, 512, 512),
        createTextureFromSvgString(ARROW_RIGHT_SVG_CONTENT, 512, 512),
        createTextureFromSvgString(ARROW_UP_SVG_CONTENT, 512, 512),
      ]);

      const loadedTextures = [info, arrowDown, arrowLeft, arrowRight, arrowUp];
      if (cancelled) {
        loadedTextures.forEach(texture => texture?.dispose());
        return;
      }

      iconTexturesRef.current = loadedTextures.filter(
        (texture): texture is THREE.Texture => texture !== null
      );
      setIconTextures({ info, arrowDown, arrowLeft, arrowRight, arrowUp });
    };

    void loadIconTextures();

    return () => {
      cancelled = true;
      iconTexturesRef.current.forEach(texture => texture.dispose());
      iconTexturesRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!displayedLocation?.initialCameraTarget || !orbitControlsRef.current) {
      return;
    }

    orbitControlsRef.current.target.set(...displayedLocation.initialCameraTarget);
    orbitControlsRef.current.update();
  }, [displayedLocation]);

  useEffect(() => {
    if (
      !hasTexture ||
      isLoading ||
      displayedLocation?.panoramaId !== activeLocation.panoramaId
    ) {
      return;
    }

    const nearbyPanoramaIds = Array.from(new Set(
      activeLocation.hotspots
        .map(hotspot => hotspot.target)
        .filter((target): target is number => target !== undefined && locations[target] !== undefined)
        .map(target => locations[target].panoramaId)
    ));

    if (nearbyPanoramaIds.length === 0) {
      return;
    }

    const prefetchNearbyPreviews = () => {
      nearbyPanoramaIds.forEach(panoramaId => preloadPanoramaImage(panoramaId, 'preview'));
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(prefetchNearbyPreviews, { timeout: 3000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(prefetchNearbyPreviews, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [activeLocation, displayedLocation, hasTexture, isLoading]);

  const panoramaRotation = displayedLocation?.panoramaRotation ?? DEFAULT_PANORAMA_ROTATION;
  const initialCameraTarget = useMemo(
    () => new THREE.Vector3(...(displayedLocation?.initialCameraTarget ?? DEFAULT_PANORAMA_ROTATION)),
    [displayedLocation]
  );
  const cameraConfig = useMemo(
    () => ({
      fov: 75,
      near: 0.1,
      far: 1000,
      position: [0, 0, 0.1] as [number, number, number],
    }),
    []
  );

  return (
    <div className="relative w-screen h-screen bg-gray-900 overflow-hidden font-inter">
      {/* THREE.JS CANVAS CONTAINER */}
      <div className="absolute inset-0 z-0 touch-none">
        <Canvas
          dpr={[1, 2]}
          camera={cameraConfig}
          className="h-full w-full"
          gl={{ alpha: false, antialias: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x111827, 1);
          }}
        >
          <Panorama texture={texture} rotation={panoramaRotation} />
          <PanoramaZoom
            controlsRef={orbitControlsRef}
            onPinchChange={handlePinchChange}
            onZoomChange={setIsZoomedIn}
          />

          {displayedLocation && displayedLocation.hotspots.map((hotspot, index) => (
            <HotspotComponent
              key={`${displayedLocation.panoramaId}-${index}`}
              hotspot={hotspot}
              infoIconTexture={iconTextures.info}
              arrowDownIconTexture={iconTextures.arrowDown}
              arrowLeftIconTexture={iconTextures.arrowLeft}
              arrowRightIconTexture={iconTextures.arrowRight}
              arrowUpIconTexture={iconTextures.arrowUp}
              onHotspotClick={handleHotspotClick}
            />
          ))}

          <OrbitControls
            ref={orbitControlsRef}
            enabled={!isPinching}
            enableDamping
            dampingFactor={0.05}
            minDistance={1}
            maxDistance={1000}
            target={initialCameraTarget}
            enableZoom={false}
            enablePan={false}
            rotateSpeed={isZoomedIn ? -0.38 : -0.7}
          />
        </Canvas>
      </div>

      {/* First-load overlay: only before any panorama texture exists. */}
      {!hasTexture && isLoading && !error && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg">{t.loadingText}</p>
          </div>
        </div>
      )}

      {/* Initial-load error with no panorama to fall back to. */}
      {!hasTexture && error && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900 px-4" role="alert">
          <div className="w-full max-w-sm rounded-xl bg-gray-800 p-6 text-center text-white shadow-xl">
            <p className="text-base font-medium">{copy.title}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {copy.retry}
            </button>
          </div>
        </div>
      )}

      {/* Recoverable error: keep the previous panorama visible. */}
      {hasTexture && error && error !== dismissedError && (
        <div className="absolute left-1/2 top-4 z-30 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-red-800 bg-red-950/90 px-3 py-2 text-white shadow-lg backdrop-blur-sm" role="alert">
          <span className="truncate text-sm">{copy.title}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-white/25"
          >
            {copy.retry}
          </button>
          <button
            type="button"
            onClick={() => setDismissedError(error)}
            className="shrink-0 rounded-full p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            aria-label={t.closeButtonText}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Info Modal */}
      {showModal && modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-xl font-bold text-gray-900">{modalContent.title}</h3>
            <p className="mb-4 text-sm text-gray-700">{modalContent.description}</p>
            <button
              onClick={(event) => { event.stopPropagation(); setShowModal(false); }}
              className="absolute top-2 right-2 rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              aria-label={t.closeButtonText}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Hamburger menu button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 right-4 z-40 cursor-pointer rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-white"
        aria-label={t.openSidebarLabel}
        aria-expanded={isSidebarOpen}
        aria-controls="tour-locations-sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Sidebar
        locations={locations}
        currentLocation={currentLocation}
        setCurrentLocation={goToLocation}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        locale={language}
      />

      {showCredit && (
        <div className="fixed bottom-4 left-1/2 z-40 max-sm:w-[calc(100vw-1.5rem)] w-[calc(100vw-1rem)] -translate-x-1/2 rounded-full bg-white/90 shadow-md sm:w-fit sm:px-1 max-sm:bottom-2">
          <p className="block max-w-full transition-colors hover:bg-white rounded-full select-none break-words p-2 text-center text-[10px] sm:text-sm">
            {language === 'tr' ? (
              <>
                Bu website <a href="https://www.instagram.com/emre.bozqurt" target="_blank" rel="noopener noreferrer" className="underline cursor-pointer">Emre Bozkurt&apos;28</a> &amp; <a href="https://www.instagram.com/basar.muslu" target="_blank" rel="noopener noreferrer" className="underline cursor-pointer">Ali Başar Muslu&apos;28</a> tarafından yapılmıştır.
              </>
            ) : (
              <>
                This website was made by <a href="https://www.instagram.com/emre.bozqurt" target="_blank" rel="noopener noreferrer" className="underline cursor-pointer">Emre Bozkurt&apos;28</a> &amp; <a href="https://www.instagram.com/basar.muslu" target="_blank" rel="noopener noreferrer" className="underline cursor-pointer">Ali Başar Muslu&apos;28</a>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => setShowCredit(false)}
            className="absolute -right-3 -top-3 max-sm:-top-2.5 max-sm:-right-2.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 p-0 text-gray-600 shadow-md hover:bg-white hover:text-gray-900"
            aria-label={t.closeButtonText}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
