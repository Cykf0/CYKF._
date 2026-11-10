import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { interactionRegistry } from './InteractionRegistry';
import { XpOrbData } from './types';

export const FlyingXpOrbs: React.FC = () => {
  const [orbs, setOrbs] = useState<XpOrbData[]>([]);

  useEffect(() => {
    return interactionRegistry.subscribeXpOrbs((items) => {
      setOrbs(items);
    });
  }, []);

  return (
    <group>
      {orbs.map((orb) => (
        <SingleOrb key={orb.id} orb={orb} />
      ))}
    </group>
  );
};

const SingleOrb: React.FC<{ orb: XpOrbData }> = ({ orb }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPos = new THREE.Vector3(0, 1.3, 0);

  useFrame((state) => {
    if (!meshRef.current) return;
    const elapsed = (Date.now() - orb.startTime) / 1000;
    const progress = Math.min(1, elapsed / 0.85);

    const startVec = new THREE.Vector3(...orb.startPos);
    const current = new THREE.Vector3().lerpVectors(startVec, targetPos, progress * progress);
    const wobble = Math.sin(state.clock.getElapsedTime() * 18) * 0.15;
    current.x += wobble;
    current.y += Math.sin(progress * Math.PI) * 0.5;

    meshRef.current.position.copy(current);
    meshRef.current.rotation.y += 0.15;
  });

  return (
    <mesh ref={meshRef} position={orb.startPos} scale={0.12}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#77FF33" wireframe={false} />
    </mesh>
  );
};
