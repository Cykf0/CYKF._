import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { interactionRegistry } from './InteractionRegistry';
import { FlyingDrop } from './types';
import { getItemTexture3D } from '../utils/itemIcons';

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
  const groupRef = useRef<THREE.Group>(null);
  const texture = useMemo(() => getItemTexture3D(drop.itemType || 'diamond'), [drop.itemType]);
  const targetPos = useMemo(() => new THREE.Vector3(0, 1.2, 0), []); // Player position

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const elapsed = (Date.now() - drop.startTime) / 1000;
    const progress = Math.min(1, elapsed / 1.1);

    // Initial bobbing then flying towards player
    const startVec = new THREE.Vector3(...drop.startPos);
    const current = new THREE.Vector3().lerpVectors(startVec, targetPos, progress);
    
    // Minecraft bobbing + arc lift
    const bob = Math.sin(clock.getElapsedTime() * 4) * 0.08;
    current.y += Math.sin(progress * Math.PI) * 0.75 + bob;

    groupRef.current.position.copy(current);
    groupRef.current.rotation.y = clock.getElapsedTime() * 3.0;

    // Scale down near player pickup
    const scale = Math.max(0.01, 0.4 * (1 - progress * 0.55));
    groupRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={groupRef} position={drop.startPos}>
      {/* Front/back sprite face */}
      <mesh>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={texture}
          transparent={true}
          alphaTest={0.5}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* Orthogonal cross sprite for 3D Minecraft volume */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={texture}
          transparent={true}
          alphaTest={0.5}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};
