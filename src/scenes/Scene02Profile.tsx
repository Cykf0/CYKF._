import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PlayerModel } from '../player/PlayerModel';
import { blockTextures } from '../world/blockTextures';

export const Scene02Profile: React.FC = () => {
  const petalsRef = useRef<THREE.Points>(null);

  // 60 Falling Petals
  const { positions, velocities } = useMemo(() => {
    const count = 60;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 8 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;

      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = 0.015 + Math.random() * 0.02; // falling speed
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    if (petalsRef.current) {
      const pos = petalsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 60; i++) {
        pos[i * 3 + 1] -= velocities[i * 3 + 1];
        pos[i * 3] += Math.sin(pos[i * 3 + 1]) * 0.008;

        if (pos[i * 3 + 1] < 0) {
          pos[i * 3 + 1] = 8;
        }
      }
      petalsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Cherry Blossom Sky Background */}
      <color attach="background" args={['#FFD6E0']} />

      {/* Soft Pink Daylight */}
      <ambientLight intensity={1.2} color="#FFF0F5" />
      <directionalLight
        position={[6, 9, 6]}
        intensity={2.2}
        color="#FFE5EC"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color="#FFCCD5" />

      {/* Cherry Fog */}
      <fog attach="fog" args={['#FFE6EE', 10, 26]} />

      {/* Terrain: Green Grass with Pink Petal Carpet */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[20, 1, 20]} />
        <meshStandardMaterial map={blockTextures.grassTop} roughness={0.9} />
      </mesh>

      {/* Cherry Blossom Trees */}
      <group position={[3.2, 0, -1]}>
        {/* Tree Trunk */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 3.6, 0.8]} />
          <meshStandardMaterial color="#4A2E2E" roughness={0.9} />
        </mesh>
        {/* Pink Leaves Crown */}
        <mesh position={[0, 4.2, 0]} castShadow>
          <boxGeometry args={[3.6, 2.4, 3.6]} />
          <meshStandardMaterial map={blockTextures.cherryLeaves} roughness={0.7} />
        </mesh>
      </group>

      <group position={[-3.5, 0, -3]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[0.8, 3.0, 0.8]} />
          <meshStandardMaterial color="#4A2E2E" roughness={0.9} />
        </mesh>
        <mesh position={[0, 3.8, 0]} castShadow>
          <boxGeometry args={[3.2, 2.2, 3.2]} />
          <meshStandardMaterial map={blockTextures.cherryLeaves} roughness={0.7} />
        </mesh>
      </group>

      {/* Falling Cherry Petals */}
      <points ref={petalsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.12} color="#FFAACC" transparent opacity={0.85} />
      </points>

      {/* Player on Right facing camera */}
      <group position={[1.8, 0, 0]} rotation={[0, -0.15, 0]}>
        <PlayerModel
          pose="idle"
          heldItem="none"
          scale={0.065}
        />
      </group>
    </group>
  );
};
