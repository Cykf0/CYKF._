import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  DustMotes,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';
import { PlayerModel } from '../player/PlayerModel';
import {
  VoxelBlock,
  VanillaLantern,
  VolumetricGodRay,
} from '../world/VoxelStructures';
import {
  AncientCityPortalFrame,
  SculkRuinedPillar,
  SoulFireAltar,
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

export const Scene06Advancements: React.FC = () => {
  const soulRef = useRef<THREE.Points>(null);

  // 1. Tiled Ancient City Sculk & Reinforced Deepslate Floor (28x28 voxels)
  const floorGeo = useMemo(() => {
    return createVoxelTerrainGeometry(28, 28, {
      top: 'sculk',
      side: 'deepslate_bricks',
      bottom: 'deepslate',
    }, 1.2);
  }, []);

  // 2. Heavy Subterranean Bedrock Base
  const bedrockBaseGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 32,
      height: 3,
      depth: 32,
      textures: 'bedrock',
    });
  }, []);

  // 3. Fully Enclosed Cavern Walls & Ceiling
  const backWallGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 30,
      height: 12,
      depth: 2.5,
      textures: 'deepslate_bricks',
    });
  }, []);

  const leftWallGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 2.5,
      height: 12,
      depth: 30,
      textures: 'deepslate',
    });
  }, []);

  const rightWallGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 2.5,
      height: 12,
      depth: 30,
      textures: 'deepslate',
    });
  }, []);

  const ceilingGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 30,
      height: 2.0,
      depth: 30,
      textures: 'deepslate',
    });
  }, []);

  // Soul Particles Rising from the Depths
  const { positions, speeds, count } = useMemo(() => {
    const c = 80;
    const pos = new Float32Array(c * 3);
    const spd = new Float32Array(c);
    for (let i = 0; i < c; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = Math.random() * 7.5 + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18;
      spd[i]         = 0.015 + Math.random() * 0.02;
    }
    return { positions: pos, speeds: spd, count: c };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (soulRef.current) {
      const pos = soulRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += speeds[i];
        pos[i * 3]     += Math.sin(t * 1.8 + i) * 0.005;
        pos[i * 3 + 2] += Math.cos(t * 1.5 + i) * 0.005;
        if (pos[i * 3 + 1] > 8.0) {
          pos[i * 3 + 1] = 0.2;
          pos[i * 3]     = (Math.random() - 0.5) * 18;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 18;
        }
      }
      soulRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. ATMOSPHERE & SHADER-PACK LIGHTING */}
      <fog attach="fog" args={['#030914', 8, 30]} />
      <ambientLight intensity={0.28} color="#0B2538" />

      <directionalLight
        position={[-5, 12, 4]}
        intensity={1.8}
        color="#00D2D3"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      />

      <pointLight position={[0, 2.8, 0]} color="#00FFFF" intensity={2.8} distance={10} decay={2} />
      <pointLight position={[-3.5, 2.2, -2.5]} color="#00CED1" intensity={2.2} distance={8} decay={2} />
      <pointLight position={[4.5, 1.8, -3.0]} color="#008080" intensity={2.0} distance={7} decay={2} />

      <VolumetricGodRay
        position={[0, 6.5, 0]}
        rotation={[0.1, 0, 0]}
        scale={[2.5, 5.0, 2.5]}
        color="#00FFFF"
        opacity={0.32}
      />

      <points ref={soulRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color="#00FFFF"
          transparent
          opacity={0.88}
        />
      </points>

      <DustMotes count={60} area={[16, 7, 16]} color="#00CED1" size={0.065} />

      {/* 2. SUBTERRANEAN FOUNDATION & ENCLOSED CAVERN (Zero Z-Fighting) */}
      <mesh position={[0, -2.6, 0]} geometry={bedrockBaseGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[0, 0, 0]} geometry={floorGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[0, 9.5, 0]} geometry={ceilingGeo} material={vanillaAtlas.getSolidMaterial()} />

      <mesh position={[0, 4.5, -9.0]} geometry={backWallGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[-13.5, 4.5, 0]} geometry={leftWallGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[13.5, 4.5, 0]} geometry={rightWallGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* Ancient City Gateway Portal Frame (Flush on Sculk Floor y=0.0) */}
      <AncientCityPortalFrame position={[0, 0, -4.5]} scale={1.0} />

      {/* Sculk Ruined Pillars (Flush on Floor y=0.0) */}
      <SculkRuinedPillar position={[-5.5, 0, -1.5]} height={6} />
      <SculkRuinedPillar position={[5.5, 0, -1.5]} height={5} />

      {/* Soul Fire Altar (Flush on Floor y=0.0) */}
      <SoulFireAltar position={[0, 0, 0.5]} />

      {/* 3. SUBTERRANEAN SCULK WATER POOL (Flush on Floor y=0.0) */}
      <group position={[5.2, 0.0, -3.2]}>
        <mesh
          position={[0, 0.15, 0]}
          geometry={createVanillaBlockGeometry({
            width: 6.8,
            height: 0.4,
            depth: 5.6,
            textures: 'deepslate_bricks',
          })}
          material={vanillaAtlas.getSolidMaterial()}
        />
        <RealisticWaterPool
          position={[0, 0.28, 0]}
          size={[6.0, 0.75, 4.8]}
          biome="sculk"
          interactiveId="scene06_sculk_pool"
          interactiveName="Subterranean Sculk Reservoir"
        />
      </group>

      {/* Soul Lanterns */}
      <group position={[-2.5, 5.5, 0]}>
        <VanillaLantern position={[0, 0, 0]} hanging={true} chainLinks={3} />
      </group>
      <group position={[2.5, 5.5, 0]}>
        <VanillaLantern position={[0, 0, 0]} hanging={true} chainLinks={3} />
      </group>

      {/* 4. PLAYER STANDING BY ANCIENT SHRINE (Flush on Floor y=0.0) */}
      <React.Suspense fallback={null}>
        <Interactable
          id="scene06_player_cykf"
          name="Cykf_ (Warden Delver)"
          category="PLAYER"
          onClick={() => {
            sounds.playClick();
            useStore.getState().recordDiscovery('scene06_player_cykf', 'PLAYER', 'Deep Dark Pathfinder');
          }}
        >
          <group position={[-1.2, 0.0, 1.2]} rotation={[0, 0.35, 0]}>
            <PlayerModel
              pose="idle"
              heldItem="soul-torch"
              scale={0.065}
            />
            <CharacterContactShadow position={[0, 0.005, 0]} opacity={0.7} scale={1.8} />
          </group>
        </Interactable>
      </React.Suspense>
    </group>
  );
};
