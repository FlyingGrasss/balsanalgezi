'use client';

import React, { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import * as THREE from 'three';
import { EXRLoader, RGBELoader } from 'three/examples/jsm/Addons.js';

import { Canvas, useLoader, useFrame } from '@react-three/fiber'; // Added useFrame
import { OrbitControls } from '@react-three/drei';
// Removed OrbitControlsImpl import as it's no longer needed for camera target manipulation

// --- Interfaces ---
interface Hotspot {
  position: { x: number; y: number; z: number };
  label: string; // Label for info hotspots, can be empty for navigation arrows
  target?: number; // For navigation hotspots
  info?: InfoContent; // For info hotspots
  type?: 'arrow' | 'info' | 'animated-arrow'; // Reverted: Type of hotspot (determines rendering)
  direction?: [number, number, number]; // New: Euler rotation for arrows [x, y, z in radians]
}

interface InfoContent {
  title: string;
  description: string;
}

interface Location {
  name: string;
  image: string; // Path to the panoramic image
  hotspots: Hotspot[];
  panoramaRotation?: [number, number, number]; // New: Rotation for the panorama mesh itself
}
// --- End Interfaces ---

const locations: Location[] = [
  {
    name: "Giriş",
    image: "/locations/BALVR/1.jpg",
    panoramaRotation: [0, 0, 0], // No rotation for this panorama
    hotspots: [
      // Navigation arrow to "Girişten sonraki yol" (target: 1), no label displayed, points forward
      { position: { x: -3.5, y: -0.1, z: -0.25 }, label: "", target: 1, type: 'animated-arrow', direction: [0, 0, 0] },
      // Info hotspot example
      { position: { x: -1, y: 0, z: 1.5 }, label: "Konferans Salonu", info: { title: "Konferans Salonu", description: "Okulumuzun Konferans Salonu. Geniş ve ferah!" }, type: 'info' },
    ],
  },
  {
    name: "2",
    image: "/locations/BALVR/2.jpg",
    panoramaRotation: [0, 0, 0], // No rotation for this panorama
    hotspots: [
      // Navigation arrow back to "Giriş" (target: 0), no label displayed, points backward (rotated 180 deg on Y)
      { position: { x: 3, y: -0.1, z: 0.2 }, label: "", target: 0, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      { position: { x: -4.5, y: -0.1, z: -0.4 }, label: "", target: 2, type: 'animated-arrow', direction: [0, 0, 0] },
    ],
  },
  {
    name: "3",
    image: "/locations/BALVR/3.jpg",
    panoramaRotation: [0, Math.PI * 1.1, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: 3, y: -0, z: 0.2 }, label: "", target: 1, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
      { position: { x: 0, y: -0.1, z: -4 }, label: "", target: 3, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      { position: { x: -2.5, y: -0.1, z: -2.5 }, label: "", target: 5, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      { position: { x: -3, y: -0.05, z: -0.2 }, label: "", target: 10, type: 'animated-arrow', direction: [0, Math.PI, 0] },

    ],
  },
  {
    name: "4",
    image: "/locations/BALVR/4.jpg",
    panoramaRotation: [0, Math.PI * 0.8, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: 0, y: -0, z: 4 }, label: "", target: 2, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
      { position: { x: -2.5, y: -0, z: 3.6 }, label: "", target: 5, type: 'animated-arrow', direction: [0, Math.PI, 0] },
    ],
  },
  {
    name: "5",
    image: "/locations/BALVR/5.jpg",
    panoramaRotation: [0, Math.PI * 0.7, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: 0.4, y: -0, z: 3 }, label: "", target: 10, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
    ],
  },
  {
    name: "6",
    image: "/locations/BALVR/6.jpg",
    panoramaRotation: [0, Math.PI * 0.3, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: 2.5, y: -0.1, z: 2.6 }, label: "", target: 2, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
      { position: { x: 2, y: -0.1, z: -3 }, label: "", target: 3, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      { position: { x: 0.5, y: -0.1, z: -2.4 }, label: "", target: 6, type: 'animated-arrow', direction: [0, Math.PI, 0] }, // Changed to 'animated-arrow'
    ],
  },
  {
    name: "7",
    image: "/locations/BALVR/7.jpg",
    panoramaRotation: [0, Math.PI * 1, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: -0.5, y: -0.1, z: 3.2 }, label: "", target: 5, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
      { position: { x: 0.65, y: -0.1, z: -4 }, label: "", target: 7, type: 'animated-arrow', direction: [0, Math.PI, 0] },

    ],
  },
  {
    name: "8",
    image: "/locations/BALVR/8.jpg",
    panoramaRotation: [0, Math.PI * 0.8, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: -0.6, y: -0.1, z: 3.8 }, label: "", target: 6, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
      { position: { x: -2.3, y: -0.1, z: 1 }, label: "", target: 8, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      { position: { x: -0.2, y: -0.1, z: -2.9 }, label: "", target: 9, type: 'animated-arrow', direction: [0, Math.PI, 0] },

    ],
  },
  {
    name: "Matematik ve Bilim Atölyesi",
    image: "/locations/BALVR/9.jpg",
    panoramaRotation: [0, Math.PI * 0.3, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: 2.5, y: -0.1, z: -2.5 }, label: "", target: 7, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
    ],
  },
  {
    name: "FRC",
    image: "/locations/BALVR/10.jpg",
    panoramaRotation: [0, Math.PI * 0.3, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: -2, y: -0.1, z: -2.8 }, label: "", target: 7, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
    ],
  },
  {
    name: "11",
    image: "/locations/BALVR/11.jpg",
    panoramaRotation: [0, Math.PI * 1.55, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: 3.8, y: -0.1, z: 0.3 }, label: "", target: 2, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
      { position: { x: -3.8, y: -0.1, z: -0.3 }, label: "", target: 11, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      { position: { x: -0.5, y: -0, z: -3 }, label: "", target: 4, type: 'animated-arrow', direction: [0, Math.PI, 0] },

    ],
  },
  {
    name: "12",
    image: "/locations/BALVR/12.jpg",
    panoramaRotation: [0, Math.PI * 1.26, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: 3.8, y: -0.1, z: 0.3 }, label: "", target: 10, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
      { position: { x: -2.2, y: -0.1, z: -1.5 }, label: "", target: 12, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      { position: { x: -1.5, y: 0, z: 2.1 }, label: "", target: 15, type: 'animated-arrow', direction: [0, Math.PI, 0] },

    ],
  },
  {
    name: "13",
    image: "/locations/BALVR/14.jpg",
    panoramaRotation: [0, Math.PI * 0.32, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: -0.6, y: -0.1, z: 2 }, label: "", target: 11, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
      { position: { x: -0, y: -0.1, z: -2 }, label: "", target: 13, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      { position: { x: 0.6, y: -0.1, z: -4 }, label: "", target: 14, type: 'animated-arrow', direction: [0, Math.PI, 0] },

    ],
  },
  {
    name: "Bilgisayar Odası",
    image: "/locations/BALVR/15.jpg",
    panoramaRotation: [0, Math.PI * 1.48, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: 2.2, y: -0.1, z: -0.5 }, label: "", target: 12, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
    ],
  },
  {
    name: "Kimya Odası",
    image: "/locations/BALVR/16.jpg",
    panoramaRotation: [0, Math.PI * 1.05, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: 2, y: -0.1, z: 0.4 }, label: "", target: 12, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
    ],
  },
  {
    name: "16",
    image: "/locations/BALVR/17.jpg",
    panoramaRotation: [0, Math.PI * 1.22, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: 2, y: -0.15, z: 2.1 }, label: "", target: 16, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
      { position: { x: 0.2, y: -0.05, z: 3.1 }, label: "", target: 17, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      { position: { x: 2, y: -0.15, z: 2.1 }, label: "", target: 18, type: 'animated-arrow', direction: [0, Math.PI, 0] },

    ],
  },
  {
    name: "Brifing Salonu",
    image: "/locations/BALVR/18.jpg",
    panoramaRotation: [0, Math.PI * 1, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: -2, y: -0.25, z: 0.4 }, label: "", target: 15, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
    ],
  },
  {
    name: "18",
    image: "/locations/BALVR/19.jpg",
    panoramaRotation: [0, Math.PI * 1, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: -2, y: -0.25, z: 0.4 }, label: "", target: 15, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
    ],
  },
  {
    name: "19",
    image: "/locations/BALVR/20.jpg",
    panoramaRotation: [0, Math.PI * 1, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: -2, y: -0.25, z: 0.4 }, label: "", target: 15, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
    ],
  },
  {
    name: "20",
    image: "/locations/BALVR/21.jpg",
    panoramaRotation: [0, Math.PI * 1, 0], // Rotate this panorama 180 degrees around Y to flip X and Z coordinates
    hotspots: [
      // Navigation arrow back to "Girişten sonraki yol" (target: 1)
      { position: { x: -2, y: -0.25, z: 0.4 }, label: "", target: 15, type: 'animated-arrow', direction: [0, Math.PI, 0] },
      // Navigation arrow back to "Giriş" (target: 0)
    ],
  },
];

// --- Panorama Component (REVERTED to user's original, with new meshRotation prop) ---
interface PanoramaProps {
  imageUrl: string;
  onTextureLoaded: () => void;
  onTextureError: (error: Error) => void;
  meshRotation: [number, number, number]; // New prop for mesh rotation
}

function Panorama({ imageUrl, onTextureLoaded, onTextureError, meshRotation }: PanoramaProps) {
  let texture: THREE.Texture;
  const fileExtension = imageUrl.split('.').pop()?.toLowerCase();

  try {
    if (fileExtension === 'hdr') {
      texture = useLoader(RGBELoader, imageUrl);
      // Removed texture.mapping and texture.colorSpace as per user's request
    } else if (fileExtension === 'exr') {
      texture = useLoader(EXRLoader, imageUrl);
      // Removed texture.mapping and texture.colorSpace as per user's request
    } else {
      texture = useLoader(THREE.TextureLoader, imageUrl);
      // Removed texture.colorSpace as per user's request
    }
  } catch (error: any) {
    useEffect(() => {
      onTextureError(error);
    }, [error, onTextureError]);
    throw error;
  }

  useEffect(() => {
    if (texture) {
      onTextureLoaded();
    }
  }, [texture, onTextureLoaded]);

  return (
    <mesh scale={[-1, 1, 1]} rotation={meshRotation}> {/* Apply rotation prop here */}
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}
// --- End Panorama Component ---

// SVG content for the arrow (from user's request, with fill/stroke applied)
const ARROW_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 24 24" fill="purple" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-down-icon lucide-arrow-big-down"><path d="M15 6v6h4l-7 7-7-7h4V6h6z"/></svg>`;

// Function to create a texture from SVG string at a higher resolution
const createSvgTexture = (svgString: string, width = 512, height = 512): Promise<THREE.Texture | null> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get 2D context for canvas.");
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
      URL.revokeObjectURL(url); // Clean up the object URL
      resolve(texture);
    };
    img.onerror = (error) => {
      console.error("Error loading SVG into canvas:", error);
      URL.revokeObjectURL(url); // Clean up the object URL
      resolve(null);
    };
    img.src = url;
  });
};


// --- HOTSPOT COMPONENT (UPDATED for arrow type, label conditional rendering, and new arrow SVG) ---
interface HotspotComponentProps {
  hotspot: Hotspot;
  infoIconTexture: THREE.Texture | null;
  arrowIconTexture: THREE.Texture | null; // Now for all arrows
  onHotspotClick: (hotspot: Hotspot) => void;
}

function HotspotComponent({ hotspot, infoIconTexture, arrowIconTexture, onHotspotClick }: HotspotComponentProps) {
  const position = React.useMemo(() => new THREE.Vector3(
    hotspot.position.x * 50,
    hotspot.position.y * 50,
    hotspot.position.z * 50
  ), [hotspot.position]);

  const spriteRef = useRef<THREE.Sprite>(null); // Ref for the sprite to animate

  // Animation logic for animated arrows
  useFrame((state) => {
    if (hotspot.type === 'animated-arrow' && spriteRef.current) {
      const time = state.clock.elapsedTime;
      // Simple bounce animation: oscillate Y position
      spriteRef.current.position.y = position.y + Math.sin(time * 2) * 3; // Adjust 3 for speed, 5 for amplitude
    }
  });

  // Create canvas texture for the hotspot label (only for info hotspots)
  const labelTexture = React.useMemo(() => {
    // Only create texture if it's an 'info' type and has a non-empty label
    if (hotspot.type !== 'info' || !hotspot.label || hotspot.label.trim() === '') {
      return null;
    }

    const canvas = document.createElement('canvas');
    // Reverted resolution to original
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      const radius = 30; // Reverted corner radius
      const x = 0;
      const y = 0;
      const width = canvas.width;
      const height = canvas.height;

      context.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Reverted background color

      // Draw the rounded rectangle path
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
      context.fill(); // Fill the rounded rectangle path

      context.font = '60px Arial'; // Reverted font size
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(hotspot.label, canvas.width / 2, canvas.height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, [hotspot.label, hotspot.type]); // Dependency on hotspot.type for conditional rendering

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    onHotspotClick(hotspot);
  }, [hotspot, onHotspotClick]);

  if (hotspot.type === 'info') { // Info hotspot
    if (!infoIconTexture) return null;

    return (
      <group position={position}>
        {/* Info icon sprite (scale from your original code) */}
        <sprite scale={[4, 4, 1.3]} onClick={handleClick}>
          <spriteMaterial map={infoIconTexture} transparent />
        </sprite>
        {/* Label sprite positioned relative to the icon (scale from your original code) */}
        {labelTexture && ( // Only render label if texture exists
          <sprite position={[0, 3, 0]} scale={[12, 3, 2]}>
            <spriteMaterial map={labelTexture} />
          </sprite>
        )}
      </group>
    );
  } else if (hotspot.type === 'arrow' || hotspot.type === 'animated-arrow') { // Navigation arrow hotspot
    if (!arrowIconTexture) return null; // Ensure arrow texture is loaded

    // The new SVG points downwards. We need to rotate it around X to make it point horizontally.
    const arrowSpriteInternalRotation = new THREE.Euler(-Math.PI / 2, 0, 0); // Rotate 90 degrees up around X
    // Then, hotspot.direction will apply to the group for left/right/forward/backward.
    const arrowGroupRotation = hotspot.direction ? new THREE.Euler().set(...hotspot.direction) : undefined;

    return (
      <group position={position} rotation={arrowGroupRotation}>
        {/* Arrow sprite using the SVG texture, with internal rotation */}
        <sprite ref={spriteRef} scale={[15, 15, 1.5]} onClick={handleClick} rotation={arrowSpriteInternalRotation}>
          <spriteMaterial map={arrowIconTexture} transparent />
        </sprite>
        {/* No label for navigation arrows */}
      </group>
    );
  } else { // Fallback for any other type (e.g., if type is undefined or 'default')
    // Render nothing if not 'info' or 'arrow' to avoid unwanted pink spheres
    return null;
  }
}
// --- END HOTSPOT COMPONENT ---


export default function VirtualTour() {
  const [currentLocation, setCurrentLocation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<InfoContent | null>(null);

  const infoIconTextureRef = useRef<THREE.Texture | null>(null);
  const arrowIconTextureRef = useRef<THREE.Texture | null>(null); // Now for all arrows

  const [panoramaMeshRotation, setPanoramaMeshRotation] = useState<[number, number, number]>([0, 0, 0]); // State for panorama mesh rotation

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    if (hotspot.target !== undefined) {
      setCurrentLocation(hotspot.target);
    } else if (hotspot.info) {
      setModalContent(hotspot.info);
      setShowModal(true);
    }
  }, []);

  useEffect(() => {
    // Load info icon texture
    new THREE.TextureLoader().load('/icons/info.svg', (texture) => {
      infoIconTextureRef.current = texture;
      console.log('Info icon texture loaded.');
    });

    // Load arrow icon texture using the createSvgTexture function for better resolution
    createSvgTexture(ARROW_SVG_CONTENT, 512, 512).then((texture) => {
      arrowIconTextureRef.current = texture;
      console.log('Arrow icon texture loaded from SVG content.');
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);

    // Update panorama mesh rotation based on the current location's setting
    const currentLocData = locations[currentLocation];
    if (currentLocData.panoramaRotation) {
      setPanoramaMeshRotation(currentLocData.panoramaRotation);
    } else {
      setPanoramaMeshRotation([0, 0, 0]); // Default to no rotation if not specified
    }

  }, [currentLocation]); // Depend on currentLocation

  return (
    <div className="relative w-screen h-screen bg-gray-900 overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg">Loading {locations[currentLocation].name}...</p>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showModal && modalContent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modalContent.title}</h3>
            <p className="text-gray-700 text-sm mb-4">{modalContent.description}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
              className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Location Navigation Buttons */}
      <div className="absolute top-4 left-4 z-40 flex flex-wrap gap-2">
        {locations.map((location, index) => (
          <button
            key={index}
            onClick={() => setCurrentLocation(index)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentLocation === index
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/90 text-gray-800 hover:bg-white'
            }`}
          >
            {location.name}
          </button>
        ))}
      </div>

      {/* Instructions and Current Location Display */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-black/70 text-white px-4 py-2 rounded-lg text-center max-w-md">
        <p className="text-sm">Drag to look around • Click locations to navigate</p>
        <p className="text-xs mt-1 text-gray-300">Currently viewing: {locations[currentLocation].name}</p>
      </div>

      {/* THREE.JS CANVAS CONTAINER */}
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 0.1] }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <Panorama
            imageUrl={locations[currentLocation].image}
            onTextureLoaded={() => setIsLoading(false)}
            onTextureError={(error) => {
              console.error("Error loading panorama texture:", error);
              setIsLoading(false);
            }}
            meshRotation={panoramaMeshRotation} // Pass the rotation state to Panorama
          />

          {locations[currentLocation].hotspots.map((hotspot, index) => (
            <HotspotComponent
              key={index}
              hotspot={hotspot}
              infoIconTexture={infoIconTextureRef.current}
              arrowIconTexture={arrowIconTextureRef.current}
              onHotspotClick={handleHotspotClick}
            />
          ))}
        </Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={1000}
          target={[0, 0, 0]} // Keep target at origin, panorama mesh rotates
          enableZoom={false} // THIS LINE DISABLES ZOOM
        />
      </Canvas>
    </div>
  );
}
