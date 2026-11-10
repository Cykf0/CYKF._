import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { interactionRegistry } from './InteractionRegistry';
import { FlyingDrop } from './types';

export const FloatingItemDrops: React.FC = () => {
  const [drops, setDrops] = useState<FlyingDrop[]>([]);

  useEffect(() => {
    return interactionRegistry.subscribeDrops((items) => {
      setDrops(items);
    });
  }, []);

  return (
    <group>
      {drops.map((drop) => (
        <SingleDrop key={drop.id} drop={drop} />
      ))}
    </group>
  );
};

const SingleDrop: React.FC<{ drop: FlyingDrop }> = ({ drop }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPos = new THREE.Vector3(0, 1.2, 0); // Player position

  useFrame(() => {
    if (!meshRef.current) return;
    const elapsed = (Date.now() - drop.startTime) / 1000;
    const progress = Math.min(1, elapsed / 1.0);

    // Initial bobbing then flying towards player
    const startVec = new THREE.Vector3(...drop.startPos);
    // Arc path towards player
    const current = new THREE.Vector3().lerpVectors(startVec, targetPos, progress);
    current.y += Math.sin(progress * Math.PI) * 0.8; // arc lift

    meshRef.current.position.copy(current);
    meshRef.current.rotation.y += 0.08;
    meshRef.current.rotation.x += 0.04;

    // Scale down near end
    const scale = Math.max(0.01, 0.25 * (1 - progress * 0.5));
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={meshRef} position={drop.startPos}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#88AA55" roughness={0.6} />
    </mesh>
  );
};
