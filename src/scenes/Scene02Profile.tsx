import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PlayerModel } from '../player/PlayerModel';
import { Sheep } from '../world/mobs';
import { blockMaterials } from '../world/blockMaterials';
import {
  VolumetricLightShaft,
  DustMotes,
  CharacterContactShadow,
  FlickeringLight,
} from '../world/EnvironmentEffects';
import { InstancedGrassField, WindSwayLeaves } from '../world/FoliageMaterial';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

export const Scene02Profile: React.FC = () => {
  const petalsRef = useRef<THREE.Points>(null);

  // 75 Falling Cherry Petals with Wind Flutter
  const { positions, velocities } = useMemo(() => {
    const count = 75;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 8 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;

      vel[i * 3]     = (Math.random() - 0.5) * 0.015;
      vel[i * 3 + 1] = 0.015 + Math.random() * 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame((state) => {
    if (petalsRef.current) {
      const t = state.clock.getElapsedTime();
      const pos = petalsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 75; i++) {
        pos[i * 3 + 1] -= velocities[i * 3 + 1];
        // Swirling flutter
        pos[i * 3]     += Math.sin(t * 1.5 + pos[i * 3 + 1]) * 0.008;
        pos[i * 3 + 2] += Math.cos(t * 1.2 + pos[i * 3 + 1]) * 0.008;

        if (pos[i * 3 + 1] < 0) {
          pos[i * 3 + 1] = 8.5;
          pos[i * 3]     = (Math.random() - 0.5) * 14;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
        }
      }
      petalsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Cinematic Cherry Daylight Lighting */}
      <ambientLight intensity={0.7} color="#FFF2F7" />

      {/* Main Sun Key Light with soft shadows */}
      <directionalLight
        position={[7, 10, 6]}
        intensity={3.0}
        color="#FFF0F5"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Pink Sky Canopy Radiance */}
      <directionalLight position={[-6, 6, -5]} intensity={0.8} color="#FFCCD7" />

      {/* Rim Light for Player and Leaves Silhouette */}
      <directionalLight position={[-3, 4, -4]} intensity={1.4} color="#FFAEC0" />

      {/* Soft Pink Atmospheric Fog */}
      <fog attach="fog" args={['#FFE6EF', 10, 32]} />

      {/* 2. Volumetric God Rays through Cherry Canopy */}
      <VolumetricLightShaft
        position={[2.8, 4.2, -0.5]}
        rotation={[0.35, 0, -0.3]}
        scale={[1.5, 1.3, 1.5]}
        color="#FFF0F5"
        opacity={0.22}
      />
      <DustMotes count={50} area={[10, 6, 10]} color="#FFD1DC" size={0.06} />

      {/* 3. Terrain: PBR Grass Blocks with Normals */}
      <Interactable
        id="scene02_terrain"
        name="Cherry Blossom Grass"
        category="BLOCK"
        materialType="grass"
        hardness={350}
        dropItem="grass_block"
      >
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <boxGeometry args={[22, 1, 22]} />
          <primitive object={blockMaterials.grassTop} attach="material" />
        </mesh>
      </Interactable>

      {/* Instanced Tall Grass with Wildflower Blooms */}
      <InstancedGrassField count={85} area={[15, 15]} baseColor="#5F9638" flowerColor="#F8B4C4" />

      {/* 4. Cherry Blossom Tree on Right */}
      <group position={[3.2, 0, -1]}>
        {/* Dark Oak Trunk */}
        <Interactable
          id="scene02_tree_trunk"
          name="Cherry Wood Trunk"
          category="BLOCK"
          materialType="wood"
          hardness={450}
          dropItem="cherry_log"
        >
          <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 3.6, 0.8]} />
            <meshStandardMaterial color="#4A2E2E" roughness={0.85} />
          </mesh>
        </Interactable>
        {/* Animated Foliage Crown with Wind Sway */}
        <WindSwayLeaves position={[0, 4.2, 0]} size={[3.8, 2.4, 3.8]} color="#F8B4C4" swayAmount={0.05} />
        {/* Accent Leaf Canopy Layers */}
        <Interactable
          id="scene02_leaf_canopy_1"
          name="Cherry Leaves Cluster"
          category="PLANT"
        >
          <mesh position={[-0.8, 3.4, 0.8]} castShadow>
            <boxGeometry args={[1.6, 1.2, 1.6]} />
            <primitive object={blockMaterials.cherryLeaves} attach="material" />
          </mesh>
        </Interactable>
        <Interactable
          id="scene02_leaf_canopy_2"
          name="High Cherry Leaves"
          category="PLANT"
        >
          <mesh position={[0.8, 4.8, -0.6]} castShadow>
            <boxGeometry args={[1.8, 1.0, 1.8]} />
            <primitive object={blockMaterials.cherryLeaves} attach="material" />
          </mesh>
        </Interactable>
      </group>

      {/* Distant Cherry Tree on Left Background */}
      <group position={[-4.5, 0, -3.5]}>
        <Interactable
          id="scene02_distant_trunk"
          name="Distant Cherry Trunk"
          category="STRUCTURE"
          materialType="wood"
        >
          <mesh position={[0, 1.6, 0]} castShadow>
            <boxGeometry args={[0.7, 3.2, 0.7]} />
            <meshStandardMaterial color="#4A2E2E" roughness={0.85} />
          </mesh>
        </Interactable>
        <WindSwayLeaves position={[0, 3.8, 0]} size={[3.4, 2.2, 3.4]} color="#F4A6B8" swayAmount={0.04} />
      </group>

      {/* 5. Traditional Japanese Stone Lantern on Ground */}
      <group position={[-2.4, 0, 1.5]}>
        <Interactable
          id="scene02_stone_lantern"
          name="Stone Garden Lantern"
          category="LIGHT_SOURCE"
          onClick={() => {
            sounds.playClick();
            useStore.getState().recordDiscovery('scene02_stone_lantern', 'LIGHT_SOURCE', 'Cherry Garden Lantern');
          }}
        >
          {/* Stone Base */}
          <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.7, 0.5, 0.7]} />
            <primitive object={blockMaterials.stoneBricks} attach="material" />
          </mesh>
          {/* Glowing Fire Center */}
          <mesh position={[0, 0.65, 0]} castShadow>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial
              color="#FF9E44"
              emissive="#FF8822"
              emissiveIntensity={2.8}
              roughness={0.2}
            />
          </mesh>
          {/* Stone Lantern Roof */}
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[0.85, 0.2, 0.85]} />
            <primitive object={blockMaterials.stoneBricks} attach="material" />
          </mesh>
          <FlickeringLight position={[0, 0.65, 0]} color="#FFAA33" baseIntensity={2.0} distance={6} />
        </Interactable>
        <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.6} scale={1.2} />
      </group>

      {/* 6. Cute Pink Sheep with Ground Contact Shadow */}
      <group position={[-1.2, 0, 0.5]} rotation={[0, 0.6, 0]}>
        <Sheep position={[0, 0, 0]} woolColor="#FFAEC9" />
        <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.65} scale={1.6} />
      </group>

      {/* 7. Falling Cherry Blossom Petals */}
      <Interactable
        id="scene02_falling_petals"
        name="Falling Cherry Petals"
        category="PARTICLE"
        onClick={() => {
          sounds.playParticleBurst();
          useStore.getState().recordDiscovery('scene02_falling_petals', 'PARTICLE', 'Catch Cherry Petal');
        }}
      >
        <points ref={petalsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial size={0.14} color="#FFB6C1" transparent opacity={0.88} />
        </points>
      </Interactable>

      {/* 8. Saksham Player Standing in Cherry Grove */}
      <React.Suspense fallback={null}>
        <group position={[1.8, 0, 0.6]} rotation={[0, -0.35, 0]}>
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
