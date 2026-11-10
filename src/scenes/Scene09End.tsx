import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Enderman } from '../world/mobs';
import {
  DustMotes,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';
import { PlayerModel } from '../player/PlayerModel';
import {
  ObsidianPillarWithCrystal,
  EndExitPortalFountain,
  EndCityTowerStructure,
  ChorusPlantTree,
} from '../world/VoxelArchitecture';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';
import {
  createVoxelTerrainGeometry,
  createVanillaBlockGeometry,
} from '../world/VanillaBlockGeometry';
import { vanillaAtlas } from '../world/VanillaTextureAtlas';

export const Scene09End: React.FC = () => {
  const voidRef = useRef<THREE.Points>(null);

  // 1. End Stone Floating Island Ground (28x28 voxels)
  const endIslandGeom = useMemo(() => {
    return createVoxelTerrainGeometry(28, 28, {
      top: 'end_stone',
      side: 'end_stone',
      bottom: 'end_stone',
    }, 2.5);
  }, []);

  // 2. Geological Underside Stalactites (Tapering downward to y=-6.0)
  const undersideCenterGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 18,
      height: 4.5,
      depth: 18,
      textures: 'end_stone',
    });
  }, []);

  const undersideTipGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 8,
      height: 3.5,
      depth: 8,
      textures: 'end_stone',
    });
  }, []);

  // 3. Swirling Cosmic Void Particles (Dragon Breath)
  const { positions, speeds, count } = useMemo(() => {
    const c = 95;
    const pos = new Float32Array(c * 3);
    const spd = new Float32Array(c);
    for (let i = 0; i < c; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = Math.random() * 9.5 + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 22;
      spd[i]         = 0.018 + Math.random() * 0.022;
    }
    return { positions: pos, speeds: spd, count: c };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (voidRef.current) {
      const pos = voidRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += speeds[i];
        pos[i * 3]     += Math.sin(t * 1.5 + i) * 0.008;
        pos[i * 3 + 2] += Math.cos(t * 1.5 + i) * 0.008;

        if (pos[i * 3 + 1] > 10.0) {
          pos[i * 3 + 1] = 0.2;
          pos[i * 3]     = (Math.random() - 0.5) * 22;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 22;
        }
      }
      voidRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. ATMOSPHERE & SHADER-PACK LIGHTING */}
      <fog attach="fog" args={['#0F051D', 14, 48]} />
      <ambientLight intensity={0.4} color="#2A0B3D" />

      <directionalLight
        position={[-6, 12, 4]}
        intensity={1.4}
        color="#C084FC"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-camera-near={0.5}
        shadow-camera-far={42}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={12}
        shadow-camera-bottom={-8}
      />

      <directionalLight position={[5, -4, -6]} intensity={0.7} color="#4C1D95" />
      <pointLight position={[0, 4.5, 0]} color="#D946EF" intensity={3.5} distance={12} decay={2} />
      <pointLight position={[0, 1.0, 0]} color="#8B5CF6" intensity={2.6} distance={8} decay={2} />

      <points ref={voidRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color="#E879F9"
          transparent
          opacity={0.85}
        />
      </points>

      <DustMotes count={70} area={[18, 9, 18]} color="#C084FC" size={0.07} />

      {/* 2. FLOATING END ISLAND 3D GEOLOGY */}
      <mesh position={[0, 0, 0]} geometry={endIslandGeom} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[0, -2.5, 0]} geometry={undersideCenterGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[0, -5.5, 0]} geometry={undersideTipGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* 3. CENTRAL EXIT PORTAL FOUNTAIN & BASIN (Flush at y=0.0) */}
      <EndExitPortalFountain position={[0, 0.0, 0]} />

      {/* 4. OBSIDIAN PILLARS & END CRYSTALS (Flush on End Stone y=0.0) */}
      <ObsidianPillarWithCrystal position={[-6.0, 0, -5.0]} height={9} />
      <ObsidianPillarWithCrystal position={[6.0, 0, -5.0]} height={7.5} />
      <ObsidianPillarWithCrystal position={[-6.0, 0, 5.0]} height={8} />

      <EndCityTowerStructure position={[7.5, 0, 6.0]} />

      {/* Chorus Plant Trees (Flush on End Stone y=0.0) */}
      <ChorusPlantTree position={[-3.5, 0.0, 3.5]} height={5} />
      <ChorusPlantTree position={[3.8, 0.0, 3.5]} height={6} />

      {/* Interactive Enderman (Feet resting flush on End Stone y=0.0) */}
      <Enderman position={[-2.2, 0.0, -1.8]} rotation={[0, 0.5, 0]} />

      {/* 5. PLAYER STANDING AT THE END GATEWAY (Flush on End Stone y=0.0) */}
      <React.Suspense fallback={null}>
        <Interactable
          id="scene09_player_cykf"
          name="Cykf_ (Void Conqueror)"
          category="PLAYER"
          onClick={() => {
            sounds.playClick();
            useStore.getState().recordDiscovery('scene09_player_cykf', 'PLAYER', 'End Void Conqueror');
          }}
        >
          <group position={[3.2, 0.0, 1.4]} rotation={[0, -0.45, 0]}>
            <PlayerModel
              pose="idle"
              heldItem="ender-pearl"
              scale={0.065}
            />
            <CharacterContactShadow position={[0, 0.005, 0]} opacity={0.7} scale={1.8} />
          </group>
        </Interactable>
      </React.Suspense>
    </group>
  );
};
