// components/VirtualTour.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Fix for OrbitControls import
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Hotspot {
  position: { x: number; y: number; z: number };
  target: number;
  label: string;
}

interface Location {
  name: string;
  image: string;
  hotspots: Hotspot[];
}

export default function VirtualTour() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentLocation, setCurrentLocation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Tour data
  const locations: Location[] = [
    {
      name: "Main Hall",
      image: "/locations/main-hall.jpg",
      hotspots: [
        { position: { x: 2, y: 0, z: 2 }, target: 1, label: "Classroom" }
      ]
    },
    {
      name: "Classroom",
      image: "/locations/classroom.jpg",
      hotspots: [
        { position: { x: -2, y: 0, z: 2 }, target: 0, label: "Main Hall" },
        { position: { x: 0, y: 0, z: -3 }, target: 2, label: "Garden" }
      ]
    },
    {
      name: "Garden",
      image: "/locations/garden.jpg",
      hotspots: [
        { position: { x: 0, y: 0, z: 3 }, target: 1, label: "Classroom" }
      ]
    }
  ];

  useEffect(() => {
    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;
    
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Initial load
    loadLocation(currentLocation);
    
    // Event listeners
    window.addEventListener('resize', handleResize);
    renderer.domElement.addEventListener('click', handleClick);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('click', handleClick);
      }
      controls.dispose();
      renderer.dispose();
      cleanScene(scene);
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current && cameraRef.current) {
      loadLocation(currentLocation);
    }
  }, [currentLocation]);

  const loadLocation = async (index: number) => {
    if (!sceneRef.current) return;
    
    setIsLoading(true);
    const location = locations[index];
    
    // Clean previous scene
    if (sphereRef.current) {
      sceneRef.current.remove(sphereRef.current);
      cleanMaterial(sphereRef.current.material as THREE.Material);
    }
    clearHotspots();
    
    try {
      // Load texture
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        new THREE.TextureLoader().load(
          location.image,
          resolve,
          undefined,
          reject
        );
      });
      
      // Create sphere geometry
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1); // Flip inside out
      
      const material = new THREE.MeshBasicMaterial({ 
        map: texture,
        side: THREE.DoubleSide
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      sceneRef.current.add(sphere);
      sphereRef.current = sphere;
      
      // Add hotspots
      location.hotspots.forEach(hotspot => addHotspot(hotspot));
      
    } catch (error) {
      console.error('Error loading location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addHotspot = (hotspot: Hotspot) => {
    if (!sceneRef.current) return;
    
    // Create hotspot indicator
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xff3366,
      transparent: true,
      opacity: 0.8
    });
    
    const hotspotMesh = new THREE.Mesh(geometry, material);
    hotspotMesh.position.set(
      hotspot.position.x * 50,
      hotspot.position.y * 50,
      hotspot.position.z * 50
    );
    
    // Add label
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = '24px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.fillText(hotspot.label, canvas.width/2, canvas.height/2 + 8);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(0, 1.5, 0);
      sprite.scale.set(4, 1, 1);
      hotspotMesh.add(sprite);
    }
    
    hotspotMesh.userData = { 
      target: hotspot.target,
      label: hotspot.label 
    };
    
    sceneRef.current.add(hotspotMesh);
  };

  const clearHotspots = () => {
    if (!sceneRef.current) return;
    
    sceneRef.current.traverse(child => {
      if (child instanceof THREE.Mesh && child.userData?.target !== undefined) {
        sceneRef.current?.remove(child);
        cleanMaterial(child.material as THREE.Material);
      }
    });
  };

  const handleClick = (event: MouseEvent) => {
    if (!cameraRef.current || !sceneRef.current || !rendererRef.current) return;
    
    // Calculate mouse position
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Raycast
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children);
    
    for (const intersect of intersects) {
      if (intersect.object.userData?.target !== undefined) {
        setCurrentLocation(intersect.object.userData.target);
        break;
      }
    }
  };

  const handleResize = () => {
    if (cameraRef.current && rendererRef.current) {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    }
  };

  const cleanScene = (scene: THREE.Scene) => {
    while(scene.children.length > 0) {
      const object = scene.children[0];
      scene.remove(object);
      disposeObject(object);
    }
  };

  const disposeObject = (object: THREE.Object3D) => {
    if (object instanceof THREE.Mesh) {
      object.geometry?.dispose();
      
      // Handle both single material and material arrays
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      
      materials.forEach(material => cleanMaterial(material));
    }
  };

  const cleanMaterial = (material: THREE.Material) => {
    material.dispose();
    
    // Dispose texture if it exists
    if ('map' in material && material.map instanceof THREE.Texture) {
    material.map.dispose();
  }
  };

  return (
    <div className="relative w-screen h-screen bg-gray-900 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg">Loading {locations[currentLocation].name}...</p>
          </div>
        </div>
      )}
      
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
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-black/70 text-white px-4 py-2 rounded-lg text-center max-w-md">
        <p className="text-sm">Drag to look around • Click locations to navigate</p>
        <p className="text-xs mt-1 text-gray-300">Currently viewing: {locations[currentLocation].name}</p>
      </div>
      
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}