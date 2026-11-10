import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PlayerModel } from '../player/PlayerModel';
import { Campfire3D } from '../world/interactiveObjects';

export const Scene05Crafting: React.FC = () => {
  const snowRef = useRef<THREE.Points>(null);

  // 100 Falling Snow Flakes
  const { positions, velocities } = useMemo(() => {
    const count = 100;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 8 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;

      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = 0.02 + Math.random() * 0.02; // falling speed
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    if (snowRef.current) {
      const pos = snowRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 100; i++) {
        pos[i * 3 + 1] -= velocities[i * 3 + 1];
        if (pos[i * 3 + 1] < 0) {
          pos[i * 3 + 1] = 8;
        }
      }
      snowRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Alpine Sunset Sky Background */}
      <color attach="background" args={['#85B6DF']} />

      {/* Alpine Golden Hour Sunset */}
      <ambientLight intensity={0.9} color="#CCDDEE" />
      <directionalLight
        position={[-10, 5, -8]}
        intensity={2.8}
        color="#FFA544"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[6, 8, 8]} intensity={0.6} color="#70C5FF" />

      {/* Mountain Mist Fog */}
      <fog attach="fog" args={['#B8D4E8', 8, 30]} />

      {/* Snow Covered Cliff Ledge */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[20, 1, 20]} />
        <meshStandardMaterial color="#EBF3F9" roughness={0.8} />
      </mesh>

      {/* Distant Mountain Peaks Silhouette */}
      <group position={[0, -2, -12]}>
        {[-8, -3, 2, 7].map((mx, idx) => (
          <mesh key={idx} position={[mx, 4 + idx * 0.5, 0]} castShadow>
            <coneGeometry args={[4.5, 9, 4]} />
            <meshStandardMaterial color="#88A0B5" roughness={0.9} />
          </mesh>
        ))}
        {/* Snow peak caps */}
        {[-8, -3, 2, 7].map((mx, idx) => (
          <mesh key={idx} position={[mx, 7.5 + idx * 0.5, 0]}>
            <coneGeometry args={[2.0, 3.5, 4]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Pine Trees on Cliff */}
      {[-4.2, 4.0].map((tx, idx) => (
        <group key={idx} position={[tx, 0, -2.5]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 2.4, 6]} />
            <meshStandardMaterial color="#4A2E12" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.2, 0]} castShadow>
            <coneGeometry args={[1.5, 3.2, 6]} />
            <meshStandardMaterial color="#22442A" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Interactive Campfire */}
      <Campfire3D position={[1.8, 0, 0.5]} />

      {/* Falling Snow Particles */}
      <points ref={snowRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#FFFFFF" transparent opacity={0.8} />
      </points>

      {/* Player seen from behind looking out at the vista */}
      <group position={[1.2, 0, 1.6]} rotation={[0, Math.PI - 0.2, 0]}>
        <PlayerModel
          pose="look-back"
          heldItem="compass"
          scale={0.065}
        />
      </group>
    </group>
  );
};
