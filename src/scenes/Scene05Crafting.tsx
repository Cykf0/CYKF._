import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Campfire3D, CraftingTable3D } from '../world/interactiveObjects';
import {
  DustMotes,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';
import { PlayerModel } from '../player/PlayerModel';
import {
  VoxelBlock,
  TallSpruceTree,
} from '../world/VoxelStructures';
import {
  AlpineMountainCabin,
} from '../world/VoxelArchitecture';
import { RealisticWaterPool } from '../world/WaterShader';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';
import {
  createVoxelTerrainGeometry,
  createVanillaBlockGeometry,
} from '../world/VanillaBlockGeometry';
import { vanillaAtlas } from '../world/VanillaTextureAtlas';

export const Scene05Crafting: React.FC = () => {
  const setActiveGui = useStore((s) => s.setActiveGui);
  const snowRef = useRef<THREE.Points>(null);

  // 1. Mountain Snow Plateau (Extra wide 32x28 to seal gaps)
  const snowPlateauGeo = useMemo(() => {
    return createVoxelTerrainGeometry(32, 28, {
      top: 'snow',
      side: 'snow',
      bottom: 'stone',
    }, 1.2);
  }, []);

  // 2. Heavy Subterranean Bedrock Base
  const bedrockBaseGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 36,
      height: 3,
      depth: 34,
      textures: 'bedrock',
    });
  }, []);

  // 3. Distant Alpine Mountain Peaks
  const distantPeaksGeo = useMemo(() => {
    return createVoxelTerrainGeometry(36, 8.5, {
      top: 'snow',
      side: 'stone',
      bottom: 'stone',
    }, 7.5);
  }, []);

  // Blizzard Falling Snow Particles
  const snowCount = 140;
  const snowPositions = useMemo(() => {
    const pos = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = Math.random() * 11 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (snowRef.current) {
      const pos = snowRef.current.geometry.attributes.position.array as Float32Array;
      const t = state.clock.getElapsedTime();
      for (let i = 0; i < snowCount; i++) {
        pos[i * 3 + 1] -= 0.055;
        pos[i * 3] += Math.sin(t * 1.2 + i) * 0.02 - 0.015;
        if (pos[i * 3 + 1] < 0.2) {
          pos[i * 3 + 1] = 11.5;
          pos[i * 3] = (Math.random() - 0.5) * 26;
        }
      }
      snowRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. ATMOSPHERE & SHADER-PACK LIGHTING */}
      <fog attach="fog" args={['#8EB4D8', 14, 45]} />
      <ambientLight intensity={0.48} color="#C4E0FA" />

      <directionalLight
        position={[-8, 10, -12]}
        intensity={2.4}
        color="#FFA566"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={12}
        shadow-camera-bottom={-8}
      />

      <directionalLight position={[6, 10, 8]} intensity={0.7} color="#90CAF9" />
      <pointLight position={[0.5, 1.4, 0.8]} color="#FF7700" intensity={3.2} distance={8} decay={2} />
      <pointLight position={[-4.5, 1.2, -2.5]} color="#90E0EF" intensity={1.8} distance={7} decay={2} />

      <points ref={snowRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[snowPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#FFFFFF"
          transparent
          opacity={0.85}
        />
      </points>

      <DustMotes count={60} area={[18, 8, 18]} color="#E0F2FE" size={0.06} />

      {/* 2. SUBTERRANEAN FOUNDATION & ALPINE GEOMETRY (Zero Z-Fighting) */}
      <mesh position={[0, -2.6, 0]} geometry={bedrockBaseGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[0, 0, 0]} geometry={snowPlateauGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[0, 2.5, -12.5]} geometry={distantPeaksGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

      {/* 3. PARTIALLY FROZEN MOUNTAIN LAKE & ICE FLOES */}
      <group position={[-5.5, 0.0, -2.5]}>
        <mesh
          position={[0, 0.15, 0]}
          geometry={createVanillaBlockGeometry({
            width: 7.8,
            height: 0.4,
            depth: 5.6,
            textures: 'packed_ice',
          })}
          material={vanillaAtlas.getSolidMaterial()}
        />

        <RealisticWaterPool
          position={[0, 0.28, 0]}
          size={[7.0, 0.75, 4.8]}
          biome="frozen"
          interactiveId="scene05_frozen_lake"
          interactiveName="Frozen Mountain Lake"
        />

        <mesh position={[-1.8, 0.32, -1.0]}>
          <boxGeometry args={[2.2, 0.12, 1.8]} />
          <meshStandardMaterial color="#A0D8EF" roughness={0.1} transparent opacity={0.88} />
        </mesh>
        <mesh position={[1.8, 0.32, 1.0]}>
          <boxGeometry args={[1.8, 0.12, 1.4]} />
          <meshStandardMaterial color="#A0D8EF" roughness={0.1} transparent opacity={0.88} />
        </mesh>
      </group>

      {/* 4. ALPINE LOG CABIN & SNOWY SPRUCE TREES (Flush on Snow Floor y=0.0) */}
      <AlpineMountainCabin position={[5.2, 0.0, -4.5]} rotationY={-0.35} />

      <TallSpruceTree position={[-7.5, 0.0, 4.5]} trunkHeight={9} />
      <TallSpruceTree position={[-8.5, 0.0, -6.5]} trunkHeight={11} />
      <TallSpruceTree position={[8.5, 0.0, 3.5]} trunkHeight={9} />
      <TallSpruceTree position={[2.5, 2.5, -11.5]} trunkHeight={12} />

      {/* 5. WARM CAMPFIRE & CRAFTING BENCH (Flush on Snow Floor y=0.0) */}
      <group position={[0.5, 0.0, 0.8]}>
        <Campfire3D position={[0, 0, 0]} />
      </group>

      <Interactable
        id="scene05_crafting_table"
        name="Artisan's Crafting Table"
        category="PROP"
        tooltip="Click to open 3x3 Crafting GUI"
        onClick={() => {
          sounds.playCraft();
          setActiveGui('crafting');
          useStore.getState().recordDiscovery('scene05_crafting_table', 'PROP', 'Master Crafting Grid');
        }}
      >
        <group position={[-1.2, 0.0, -0.5]}>
          <CraftingTable3D position={[0, 0, 0]} />
        </group>
      </Interactable>

      {/* 6. PLAYER STANDING BY CAMPFIRE (Flush on Ground) */}
      <React.Suspense fallback={null}>
        <Interactable
          id="scene05_player_cykf"
          name="Cykf_ (Mountain Explorer)"
          category="PLAYER"
          onClick={() => {
            sounds.playClick();
            useStore.getState().recordDiscovery('scene05_player_cykf', 'PLAYER', 'Alpine Mountaineer');
          }}
        >
          <group position={[-0.8, 0.0, 1.5]} rotation={[0, 0.35, 0]}>
            <PlayerModel
              pose="idle"
              heldItem="spyglass"
              scale={0.065}
            />
            <CharacterContactShadow position={[0, 0.005, 0]} opacity={0.7} scale={1.8} />
          </group>
        </Interactable>
      </React.Suspense>
    </group>
  );
};
