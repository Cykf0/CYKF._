import React from 'react';
import { PlayerModel } from '../player/PlayerModel';
import { Sheep } from '../world/mobs';
import { blockMaterials } from '../world/blockMaterials';
import {
  FlickeringLight,
  VolumetricLightShaft,
  DustMotes,
  DriftingVoxelClouds,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';
import { InstancedGrassField } from '../world/FoliageMaterial';

export const Scene01Title: React.FC = () => {
  return (
    <group>
      {/* 1. Physically plausible Morning Dawn Lighting */}
      <ambientLight intensity={0.65} color="#FFF2E2" />

      {/* Sun Key Light: Low Angle Golden Dawn with soft PCF shadows */}
      <directionalLight
        position={[-14, 6, 8]}
        intensity={3.4}
        color="#FF9E3B"
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

      {/* Sky Radiance Fill */}
      <directionalLight position={[6, 12, -6]} intensity={0.75} color="#7EC8F2" />

      {/* Simulated Ground GI Bounce Light */}
      <hemisphereLight
        args={['#7EC8F2', '#649B39', 0.55]}
        position={[0, 10, 0]}
      />

      {/* Atmospheric Dawn Fog */}
      <fog attach="fog" args={['#FFE3C8', 10, 36]} />

      {/* 2. Drifting Voxel Clouds */}
      <DriftingVoxelClouds altitude={16} speed={0.35} color="#FFF8F0" />

      {/* 3. Volumetric Sunbeam Shaft & Illuminated Pollen Dust */}
      <VolumetricLightShaft
        position={[-5, 4.5, 3]}
        rotation={[0.35, 0, -0.65]}
        scale={[1.5, 1.4, 1.5]}
        color="#FFE6A0"
        opacity={0.24}
      />
      <DustMotes count={60} area={[12, 6, 12]} color="#FFE8A3" size={0.06} />

      {/* 4. Terrain: PBR Grass Blocks with Normals & Roughness */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[22, 1, 22]} />
        <primitive object={blockMaterials.grassTop} attach="material" />
      </mesh>

      {/* Instanced Tall Grass with Wind Sway */}
      <InstancedGrassField count={80} area={[16, 16]} baseColor="#5B8E34" />

      {/* 5. Village Cottage */}
      <group position={[-4, 0, -2]}>
        {/* Cobblestone / Stone Bricks Foundation */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 1, 4.5]} />
          <primitive object={blockMaterials.stoneBricks} attach="material" />
        </mesh>
        {/* Oak Plank Walls with Grain Normals */}
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 2, 4.2]} />
          <primitive object={blockMaterials.oakPlanks} attach="material" />
        </mesh>
        {/* Wood Door */}
        <mesh position={[0, 1.4, 2.12]} castShadow>
          <planeGeometry args={[0.9, 1.8]} />
          <meshStandardMaterial color="#4A2E12" roughness={0.7} />
        </mesh>
        {/* Sloped Roof */}
        <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
          <coneGeometry args={[3.4, 1.6, 4]} />
          <meshStandardMaterial color="#5C3B1E" roughness={0.8} />
        </mesh>

        {/* Porch Lantern with Dynamic Flickering Warm Light */}
        <group position={[1.8, 2.2, 1.8]}>
          <mesh castShadow>
            <boxGeometry args={[0.25, 0.35, 0.25]} />
            <meshStandardMaterial
              color="#FFAA33"
              emissive="#FF8800"
              emissiveIntensity={2.5}
              roughness={0.2}
            />
          </mesh>
          <FlickeringLight position={[0, 0, 0]} color="#FFAA33" baseIntensity={2.2} distance={8} />
        </group>
      </group>

      {/* 6. Wheat Farm Garden */}
      <group position={[-2, 0.05, 3]}>
        <mesh receiveShadow>
          <boxGeometry args={[3.5, 0.1, 2.5]} />
          <primitive object={blockMaterials.dirt} attach="material" />
        </mesh>
        {/* Wheat stalks with golden highlights */}
        {[-1.2, -0.4, 0.4, 1.2].map((wx, i) => (
          <mesh key={i} position={[wx, 0.35, 0]} castShadow>
            <boxGeometry args={[0.3, 0.7, 1.8]} />
            <meshStandardMaterial color="#E2B744" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* 7. Wandering Sheep with Soft Ground Contact Shadow */}
      <group position={[-1.5, 0, 1.2]} rotation={[0, 0.8, 0]}>
        <Sheep position={[0, 0, 0]} />
        <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.65} scale={1.6} />
      </group>

      {/* 8. Saksham Player on Right waving with Diamond Pickaxe */}
      <React.Suspense fallback={null}>
        <group position={[2.2, 0, 0.8]} rotation={[0, -0.45, 0]}>
          <PlayerModel
            pose="waving"
            heldItem="diamond-pickaxe"
            scale={0.065}
          />
          <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.7} scale={1.8} />
        </group>
      </React.Suspense>
    </group>
  );
};
