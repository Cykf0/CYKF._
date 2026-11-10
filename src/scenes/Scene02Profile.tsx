import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PlayerModel } from '../player/PlayerModel';
import { Sheep } from '../world/mobs';
import {
  DustMotes,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';
import {
  VoxelBlock,
  VanillaLantern,
  VanillaCrossedPlant,
  VolumetricGodRay,
  VoxelTree,
} from '../world/VoxelStructures';
import {
  StoneArchBridge,
  HunterCabin,
  GiantMushroom,
} from '../world/VoxelArchitecture';
import { RealisticWaterPool } from '../world/WaterShader';
import { WaterfallMesh } from '../world/WaterfallMesh';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';
import {
  createVoxelTerrainGeometry,
  createVanillaBlockGeometry,
} from '../world/VanillaBlockGeometry';
import { vanillaAtlas } from '../world/VanillaTextureAtlas';

export const Scene02Profile: React.FC = () => {
  // 1. Terrain Geometries (Complete, wide, zero-gap layout)
  const bedrockBaseGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 36,
      height: 3,
      depth: 36,
      textures: 'bedrock',
    });
  }, []);

  const foregroundForestBankGeo = useMemo(() => {
    return createVoxelTerrainGeometry(16, 8.5, {
      top: 'moss_block',
      side: 'moss_block',
      bottom: 'dirt',
    }, 1.2);
  }, []);

  const riverBedGeo = useMemo(() => {
    return createVoxelTerrainGeometry(32, 6.0, 'sand', 0.8);
  }, []);

  const farGroveRidgeGeo = useMemo(() => {
    return createVoxelTerrainGeometry(36, 9.0, {
      top: 'grass_block_top',
      side: 'grass_block_side',
      bottom: 'stone',
    }, 3.0, '#88d8b0');
  }, []);

  const waterfallCliffGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 6.0,
      height: 6.5,
      depth: 3.5,
      textures: 'stone',
    });
  }, []);

  return (
    <group>
      {/* 1. ATMOSPHERE & SHADER-PACK LIGHTING */}
      <fog attach="fog" args={['#F7C5D4', 16, 48]} />
      <ambientLight intensity={0.65} color="#FFD1DC" />

      <directionalLight
        position={[-9, 9, -10]}
        intensity={2.8}
        color="#FFAAA6"
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

      <directionalLight position={[6, 10, 8]} intensity={0.65} color="#A8D8EA" />
      <pointLight position={[2.5, 2.4, 0.5]} color="#FFAA33" intensity={2.2} distance={8} decay={2} />
      <pointLight position={[-4.5, 2.5, 3.2]} color="#FFAA33" intensity={2.0} distance={8} decay={2} />

      <VolumetricGodRay
        position={[-3, 6.5, -2]}
        rotation={[0.25, 0.2, -0.1]}
        scale={[2.8, 5.0, 2.8]}
        color="#FFB6C1"
        opacity={0.3}
      />

      {/* Floating Cherry Blossom Petals & Forest Dust */}
      <DustMotes count={85} area={[20, 10, 20]} color="#FFB6C1" size={0.08} />

      {/* 2. SUBTERRANEAN FOUNDATION & GROUNDWORK */}
      <mesh position={[0, -2.5, 0]} geometry={bedrockBaseGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[0, 0.6, 3.5]} geometry={foregroundForestBankGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[0, 1.2, -10.5]} geometry={farGroveRidgeGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />
      <mesh position={[-6.5, 3.2, -8.0]} geometry={waterfallCliffGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

      {/* 3. NATURAL FOREST WATERFALL & RIVER STREAM */}
      <WaterfallMesh
        position={[-6.5, 0.5, -6.5]}
        width={2.2}
        height={6.0}
        depth={0.4}
        color="#52D1B2"
        foamColor="#E8FFF5"
        speed={1.5}
        interactiveId="scene02_waterfall"
        interactiveName="Eternal Forest Waterfall"
      />

      <group position={[0, 0, -3.5]}>
        <mesh position={[0, -0.6, 0]} geometry={riverBedGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
        <RealisticWaterPool
          position={[0, -0.12, 0]}
          size={[32, 0.7, 5.8]}
          biome="forest"
          flowDirection={[1, 0]}
          flowSpeed={0.85}
          interactiveId="scene02_forest_river"
          interactiveName="Eternal Forest River"
        />
        <StoneArchBridge position={[2.5, 0, 0]} length={6.8} width={3.2} />
      </group>

      {/* 4. CHERRY TREES, CABIN & DECORATIVE ARCHITECTURE */}
      <VoxelTree position={[-5.5, 0.6, 3.5]} trunkHeight={6} type="cherry" />
      <VoxelTree position={[6.2, 0.6, 2.5]} trunkHeight={7} type="cherry" />
      <VoxelTree position={[-8.5, 1.2, -10.5]} trunkHeight={8} type="cherry" />
      <VoxelTree position={[7.5, 1.2, -11.0]} trunkHeight={7} type="cherry" />

      <HunterCabin position={[0, 1.2, -12.5]} />

      <GiantMushroom position={[6.5, 0.6, 5.0]} type="red" height={3.8} />
      <GiantMushroom position={[-4.5, 1.2, -9.5]} type="brown" height={4.2} />

      {/* 5. FOLIAGE, FLOWERS & PASSIVE SHEEP (Flush on Moss Bank y=0.6) */}
      <group position={[-2.5, 0.6, 2.2]}>
        <VanillaCrossedPlant position={[0, 0, 0]} type="fern" />
        <VanillaCrossedPlant position={[0.7, 0, 0.4]} type="allium" />
        <VanillaCrossedPlant position={[-0.6, 0, -0.4]} type="short_grass" />
        <VanillaCrossedPlant position={[1.2, 0, -0.6]} type="poppy" />
      </group>

      <Sheep position={[-3.2, 0.6, 3.5]} rotation={[0, 0.5, 0]} woolColor="pink" />
      <Sheep position={[4.5, 0.6, 3.8]} rotation={[0, -0.7, 0]} woolColor="white" />

      {/* 6. PLAYER STANDING BY STREAM (Flush on Moss Bank y=0.6) */}
      <React.Suspense fallback={null}>
        <Interactable
          id="scene02_player_cykf"
          name="Cykf_ (Software Craftsman)"
          category="PLAYER"
          onClick={() => {
            sounds.playClick();
            useStore.getState().recordDiscovery('scene02_player_cykf', 'PLAYER', 'Forest Explorer');
          }}
        >
          <group position={[1.2, 0.6, 2.0]} rotation={[0, -0.2, 0]}>
            <PlayerModel
              pose="idle"
              heldItem="compass"
              scale={0.065}
            />
            <CharacterContactShadow position={[0, 0.005, 0]} opacity={0.7} scale={1.8} />
          </group>
        </Interactable>
      </React.Suspense>
    </group>
  );
};
