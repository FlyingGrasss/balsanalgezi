'use client';

import React, { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import * as THREE from 'three';
import { EXRLoader, RGBELoader } from 'three/examples/jsm/Addons.js';

import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// --- Interfaces (kept as is) ---
interface Hotspot {
  position: { x: number; y: number; z: number };
  label: string;
  target?: number; // For navigation hotspots
  info?: InfoContent; // For info hotspots
}

interface InfoContent {
  title: string;
  description: string;
}

interface Location {
  name: string;
  image: string; // Path to the panoramic image
  hotspots: Hotspot[];
}
// --- End Interfaces ---

const locations: Location[] = [
  {
    name: "Main Hall",
    image: "/locations/main-hall.jpg",
    hotspots: [
      { position: { x: -0.8, y: -0.2, z: 0.5 }, label: "To Office", target: 1 },
      { position: { x: 1.2, y: 0, z: 0.55 }, label: "Info about Hall", info: { title: "Main Hall", description: "This is the main hall of our building. It's spacious and welcoming!" } },
    ],
  },
  {
    name: "Garden",
    image: "/locations/garden.exr",
    hotspots: [
      { position: { x: 0.8, y: -0.2, z: -0.5 }, label: "Back to Hall", target: 0 },
      { position: { x: -0.5, y: 0.3, z: -0.8 }, label: "Info about Desk", info: { title: "Office Desk", description: "This is a typical office desk, equipped with a monitor and keyboard." } },
    ],
  },
  {
    name: "Sunset",
    image: "/locations/sunset.hdr",
    hotspots: [
      { position: { x: 0.8, y: -0.2, z: -0.5 }, label: "Back to Hall", target: 0 },
      { position: { x: -0.5, y: 0.3, z: -0.8 }, label: "Info about Desk", info: { title: "Office Desk", description: "This is a typical office desk, equipped with a monitor and keyboard." } },
    ],
  },
];

// --- Panorama Component (unchanged from last iteration) ---
interface PanoramaProps {
  imageUrl: string;
  onTextureLoaded: () => void;
  onTextureError: (error: Error) => void;
}

function Panorama({ imageUrl, onTextureLoaded, onTextureError }: PanoramaProps) {
  let texture: THREE.Texture;
  const fileExtension = imageUrl.split('.').pop()?.toLowerCase();

  try {
    if (fileExtension === 'hdr') {
      texture = useLoader(RGBELoader, imageUrl);
    } else if (fileExtension === 'exr') {
      texture = useLoader(EXRLoader, imageUrl);
    } else {
      texture = useLoader(THREE.TextureLoader, imageUrl);
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
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}
// --- End Panorama Component ---


// --- HOTSPOT COMPONENT (UPDATED) ---
interface HotspotComponentProps {
  hotspot: Hotspot;
  infoIconTexture: THREE.Texture | null;
  onHotspotClick: (hotspot: Hotspot) => void;
}

function HotspotComponent({ hotspot, infoIconTexture, onHotspotClick }: HotspotComponentProps) {
  const position = React.useMemo(() => new THREE.Vector3(
    hotspot.position.x * 50,
    hotspot.position.y * 50,
    hotspot.position.z * 50
  ), [hotspot.position]);

  // Create canvas texture for the hotspot label (UPDATED RESOLUTION AND FONT)
const labelTexture = React.useMemo(() => {
  const canvas = document.createElement('canvas');
  // Increased resolution for better quality text
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    const radius = 30; // Define the corner radius
    const x = 0;
    const y = 0;
    const width = canvas.width;
    const height = canvas.height;

    context.fillStyle = 'rgba(0, 0, 0, 0.7)';

    // Begin drawing the rounded rectangle path
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

    // Increased font size proportionally
    context.font = '60px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';  
    context.fillText(hotspot.label, canvas.width / 2, canvas.height / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  // Ensure good filtering for the text texture
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}, [hotspot.label]);

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    onHotspotClick(hotspot);
  }, [hotspot, onHotspotClick]);

  if (hotspot.info) {
    if (!infoIconTexture) return null;

    return (
      <group position={position}>
        {/* Info icon sprite (UPDATED SCALE) */}
        <sprite scale={[4, 4, 1.3]} onClick={handleClick}> {/* Reduced from 10 to 3 */}
          <spriteMaterial map={infoIconTexture} transparent />
        </sprite>
        {/* Label sprite positioned relative to the icon (UPDATED SCALE) */}
        <sprite position={[0, 3, 0]} scale={[12, 3, 2]}> {/* Adjusted scale to match new canvas resolution */}
          <spriteMaterial map={labelTexture} />
        </sprite>
      </group>
    );
  } else { // Navigation hotspot
    return (
      <group position={position}>
        <mesh onClick={handleClick}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color={0xff3366} transparent opacity={0.8} />
        </mesh>
        {/* Label sprite positioned relative to the sphere (UPDATED SCALE) */}
        <sprite position={[0, 1.0, 0]} scale={[6, 1.5, 1]}> {/* Adjusted scale to match new canvas resolution */}
          <spriteMaterial map={labelTexture} />
        </sprite>
      </group>
    );
  }
}
// --- END HOTSPOT COMPONENT ---


export default function VirtualTour() {
  const [currentLocation, setCurrentLocation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<InfoContent | null>(null);

  const infoIconTextureRef = useRef<THREE.Texture | null>(null);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    if (hotspot.target !== undefined) {
      setCurrentLocation(hotspot.target);
    } else if (hotspot.info) {
      setModalContent(hotspot.info);
      setShowModal(true);
    }
  }, []);

  useEffect(() => {
    // Make sure your info.svg is in the public directory: /public/icons/info.svg
    new THREE.TextureLoader().load('/icons/info.svg', (texture) => {
      infoIconTextureRef.current = texture;
      console.log('Info icon texture loaded.');
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
  }, [currentLocation]);

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
          />

          {locations[currentLocation].hotspots.map((hotspot, index) => (
              <HotspotComponent
                key={index}
                hotspot={hotspot}
                infoIconTexture={infoIconTextureRef.current}
                onHotspotClick={handleHotspotClick}
              />
          ))}
        </Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={1000}
          target={[0, 0, 0]}
          enableZoom={false} // THIS LINE DISABLES ZOOM
        />
      </Canvas>
    </div>
  );
}