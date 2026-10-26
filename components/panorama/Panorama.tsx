'use client';

import * as THREE from 'three';

interface PanoramaProps {
  texture: THREE.Texture | null;
  rotation: [number, number, number];
}

/**
 * Texture-driven panorama sphere. Progressive loading and texture lifetime
 * live in useProgressivePanorama; this component only presents the map.
 */
export default function Panorama({ texture, rotation }: PanoramaProps) {
  if (!texture) {
    return null;
  }

  return (
    <mesh scale={[-1, 1, 1]} rotation={rotation}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}
