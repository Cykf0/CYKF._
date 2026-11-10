import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PlayerModel } from '../player/PlayerModel';
import { Campfire3D } from '../world/interactiveObjects';
import {
  FlickeringLight,
  CharacterContactShadow,
  DriftingVoxelClouds,
} from '../world/EnvironmentEffects';

export const Scene05Crafting: React.FC = () => {
  const snowRef = useRef<THREE.Points>(null);

  // 120 Drifting Alpine Snow Flakes
  const { positions, velocities } = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = Math.random() * 9 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18;

      vel[i * 3]     = (Math.random() - 0.5) * 0.015;
      vel[i * 3 + 1] = 0.02 + Math.random() * 0.025;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame((state) => {
    if (snowRef.current) {
      const t = state.clock.getElapsedTime();
      const pos = snowRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 120; i++) {
        pos[i * 3 + 1] -= velocities[i * 3 + 1];
        pos[i * 3]     += Math.sin(t * 1.2 + pos[i * 3 + 1]) * 0.006;
        if (pos[i * 3 + 1] < 0) {
          pos[i * 3 + 1] = 9;
          pos[i * 3]     = (Math.random() - 0.5) * 18;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 18;
        }
      }
      snowRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Alpine Sunset Lighting */}
      <ambientLight intensity={0.5} color="#BBD6EE" />

      {/* Warm Golden Sunset Sun Key Light with soft shadows */}
      <directionalLight
        position={[-12, 5, -8]}
        intensity={3.4}
        color="#FFA64D"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />

      {/* Sky Radiance Cool Blue */}
      <directionalLight position={[6, 9, 8]} intensity={0.7} color="#7EC8F2" />

      {/* Cool Mountain Mist Fog */}
      <fog attach="fog" args={['#B8D4E8', 8, 32]} />

      {/* Drifting Clouds below/above peak */}
      <DriftingVoxelClouds altitude={12} speed={0.2} color="#E8F2FA" />

      {/* 2. Snow Covered Cliff Ledge */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[22, 1, 22]} />
        <meshStandardMaterial
          color="#F2F7FA"
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      {/* Distant Mountain Peaks Silhouette */}
      <group position={[0, -2, -12]}>
        {[-8, -3, 2, 7].map((mx, idx) => (
          <mesh key={idx} position={[mx, 4 + idx * 0.5, 0]} castShadow>
            <coneGeometry args={[4.5, 9, 4]} />
            <meshStandardMaterial color="#7D98AE" roughness={0.9} />
          </mesh>
        ))}
        {/* Snow Peak Caps */}
        {[-8, -3, 2, 7].map((mx, idx) => (
          <mesh key={idx} position={[mx, 7.5 + idx * 0.5, 0]}>
            <coneGeometry args={[2.0, 3.5, 4]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Pine Trees with Snowy Boughs */}
      {[-4.2, 4.0].map((tx, idx) => (
        <group key={idx} position={[tx, 0, -2.5]}>
          <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.2, 2.4, 6]} />
            <meshStandardMaterial color="#3A220F" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
            <coneGeometry args={[1.6, 3.4, 6]} />
            <meshStandardMaterial color="#1E3E26" roughness={0.8} />
          </mesh>
          {/* Snow Layer on Tree */}
          <mesh position={[0, 3.4, 0]} castShadow>
            <coneGeometry args={[1.7, 1.8, 6]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
          </mesh>
          <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.6} scale={2.2} />
        </group>
      ))}

      {/* 3. Interactive Campfire with Dynamic Flickering Light */}
      <group position={[1.8, 0, 0.5]}>
        <Campfire3D position={[0, 0, 0]} />
        <FlickeringLight
          position={[0, 0.5, 0]}
          color="#FF9933"
          baseIntensity={3.2}
          distance={10}
          flickerSpeed={12}
        />
        <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.8} scale={2.0} />
      </group>

      {/* 4. Drifting Snow Particles */}
      <points ref={snowRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.12} color="#FFFFFF" transparent opacity={0.9} />
      </points>

      {/* 5. Saksham Player Resting near Campfire on Mountain Peak */}
      <React.Suspense fallback={null}>
        <group position={[-1.2, 0, 0.6]} rotation={[0, 0.4, 0]}>
          <PlayerModel
            pose="idle"
            scale={0.065}
          />
          <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.7} scale={1.8} />
        </group>
      </React.Suspense>
    </group>
  );
};
