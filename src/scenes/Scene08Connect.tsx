import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Axolotl } from '../world/mobs';
import { PlayerModel } from '../player/PlayerModel';
import { blockMaterials } from '../world/blockMaterials';
import { RealisticWaterPool } from '../world/WaterShader';
import {
  FlickeringLight,
  VolumetricLightShaft,
  DustMotes,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';

export const Scene08Connect: React.FC = () => {
  const dripRef = useRef<THREE.Points>(null);

  // 40 Ceiling Water Driplets falling into the pool
  const { positions, speeds } = useMemo(() => {
    const count = 40;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = 1.0 + (Math.random() - 0.5) * 4.0;
      pos[i * 3 + 1] = 4.5 + Math.random() * 2.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
      spd[i]         = 0.04 + Math.random() * 0.04;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame(() => {
    if (dripRef.current) {
      const pos = dripRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 40; i++) {
        pos[i * 3 + 1] -= speeds[i];
        if (pos[i * 3 + 1] < 0.1) {
          pos[i * 3 + 1] = 5.5 + Math.random();
          pos[i * 3]     = 1.0 + (Math.random() - 0.5) * 4.0;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
        }
      }
      dripRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Deep Humid Lush Cave Atmosphere */}
      <ambientLight intensity={0.45} color="#1A3828" />

      {/* Sunlight Shaft from Ceiling opening */}
      <directionalLight
        position={[4, 11, -3]}
        intensity={2.8}
        color="#FFFDE8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
      />

      {/* Humid Greenish Fog */}
      <fog attach="fog" args={['#0C2418', 6, 26]} />

      {/* 2. Ceiling Sunbeam Light Shaft & Glowing Spore Motes */}
      <VolumetricLightShaft
        position={[2.4, 4.8, -0.8]}
        rotation={[0.2, 0, -0.15]}
        scale={[1.6, 1.4, 1.6]}
        color="#E8FFE8"
        opacity={0.22}
      />
      <DustMotes count={60} area={[12, 6, 12]} color="#B7E4C7" size={0.06} />

      {/* Falling Water Drips */}
      <points ref={dripRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#74C69D" transparent opacity={0.75} />
      </points>

      {/* 3. Moss & Clay Cave Floor with PBR Normals */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[22, 1, 22]} />
        <primitive object={blockMaterials.grassTop} attach="material" />
      </mesh>

      {/* 4. Realistic Animated Water Pool Basin with Caustics & Waves */}
      <group position={[2.4, 0.02, 0]}>
        <RealisticWaterPool
          position={[0, 0, 0]}
          size={[6.5, 0.15, 5.5]}
          shallowColor="#40916C"
          deepColor="#081C15"
        />

        {/* Floating Lily Pads */}
        {[
          [-1.5, 0.1, -1.0],
          [1.8, 0.1, 1.2],
          [-1.0, 0.1, 1.5],
        ].map(([lx, ly, lz], i) => (
          <mesh key={i} position={[lx, ly, lz]}>
            <cylinderGeometry args={[0.45, 0.45, 0.02, 8]} />
            <meshStandardMaterial color="#2D6A4F" roughness={0.7} />
          </mesh>
        ))}

        {/* Swimming Pink Axolotl with Wake */}
        <Axolotl position={[0, 0.14, 0]} />
      </group>

      {/* 5. Hanging Vines with Glowing Amber Glow Berries */}
      {[-3, 0, 3].map((vx, i) => (
        <group key={i} position={[vx, 4.2, -2.2]}>
          {/* Green Vine Tendril */}
          <mesh position={[0, -1.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 2.4, 6]} />
            <meshStandardMaterial color="#40916C" roughness={0.8} />
          </mesh>

          {/* Glowing Berry Cluster with Dynamic Point Light */}
          <mesh position={[0, -2.2, 0]}>
            <boxGeometry args={[0.35, 0.35, 0.35]} />
            <meshStandardMaterial
              color="#FFB703"
              emissive="#FF9E00"
              emissiveIntensity={3.2}
              roughness={0.2}
            />
          </mesh>
          <FlickeringLight
            position={[0, -2.2, 0]}
            color="#FFB703"
            baseIntensity={2.5}
            distance={7}
            flickerSpeed={6}
          />
        </group>
      ))}

      {/* 6. Saksham Player Standing at Pool Edge */}
      <React.Suspense fallback={null}>
        <group position={[-1.2, 0, 0.8]} rotation={[0, 0.35, 0]}>
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
