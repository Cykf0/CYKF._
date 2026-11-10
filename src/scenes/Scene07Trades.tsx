import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Villager } from '../world/mobs';
import {
  DustMotes,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';
import { PlayerModel } from '../player/PlayerModel';
import {
  VoxelBlock,
  VanillaLantern,
  VanillaSunflower,
  VanillaCrossedPlant,
  VolumetricGodRay,
  VillageCottageHouse,
} from '../world/VoxelStructures';
import { RealisticWaterPool } from '../world/WaterShader';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';
import {
  createVoxelTerrainGeometry,
  createVanillaBlockGeometry,
} from '../world/VanillaBlockGeometry';
import { vanillaAtlas } from '../world/VanillaTextureAtlas';

export const Scene07Trades: React.FC = () => {
  const setActiveGui = useStore((s) => s.setActiveGui);

  // 1. Tiled Grass & Dirt Village Ground (28x28 voxels)
  const floorGeo = useMemo(() => {
    return createVoxelTerrainGeometry(28, 28, {
      top: 'grass_block_top',
      side: 'grass_block_side',
      bottom: 'dirt',
    }, 1.2, '#79C05A');
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

  // 3. Cobblestone & Gravel Village Path
  const pathGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 3.2,
      height: 0.15,
      depth: 16.0,
      textures: 'dirt_path_top',
    });
  }, []);

  // 4. Timber Trading Counter (Clean spruce planks, width 2.8)
  const counterGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 2.8,
      height: 0.95,
      depth: 0.9,
      textures: 'spruce_planks',
    });
  }, []);

  // 4b. Market Stall Canopy Roof (Striped Red & White Village Awning)
  const canopyRoofGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 3.4,
      height: 0.4,
      depth: 2.6,
      textures: {
        top: 'red_wool',
        bottom: 'white_wool',
        north: 'red_wool',
        south: 'red_wool',
        east: 'white_wool',
        west: 'white_wool',
      },
    });
  }, []);

  // 4c. Stall Corner Posts
  const fencePostGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 0.22,
      height: 2.6,
      depth: 0.22,
      textures: 'spruce_log',
    });
  }, []);

  // 5. Farmland Plot Geometry
  const farmlandGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 6.0,
      height: 0.8,
      depth: 5.0,
      textures: 'farmland',
    });
  }, []);

  return (
    <group>
      {/* ----------------------------------------------------------------------- */}
      {/* 1. ATMOSPHERE & SHADER-PACK LIGHTING (Warm Village Afternoon)           */}
      {/* ----------------------------------------------------------------------- */}

      {/* Atmospheric Soft Village Fog */}
      <fog attach="fog" args={['#FDE68A', 16, 48]} />

      <ambientLight intensity={0.6} color="#FFE8CC" />

      {/* Primary Directional Sunlight with Crisp Shadows */}
      <directionalLight
        position={[-7, 10, 5]}
        intensity={2.8}
        color="#FFA834"
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

      <directionalLight position={[6, 8, -4]} intensity={0.65} color="#90CAF9" />

      <pointLight position={[0, 2.5, 0]} color="#FFAA33" intensity={2.4} distance={8} decay={2} />
      <pointLight position={[-4.5, 2.0, 1.8]} color="#48CAE4" intensity={1.8} distance={7} decay={2} />

      <VolumetricGodRay
        position={[-3, 6.0, 1.5]}
        rotation={[0.3, 0.2, 0]}
        scale={[2.5, 5.0, 2.5]}
        color="#FFA834"
        opacity={0.28}
      />

      <DustMotes count={70} area={[18, 8, 18]} color="#FFE082" size={0.07} />

      {/* ----------------------------------------------------------------------- */}
      {/* 2. SUBTERRANEAN FOUNDATION & VILLAGE TERRAIN (Zero Gaps)                */}
      {/* ----------------------------------------------------------------------- */}

      {/* Bedrock Foundation */}
      <mesh position={[0, -2.5, 0]} geometry={bedrockBaseGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* Main Village Ground */}
      <mesh position={[0, 0, 0]} geometry={floorGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* Village Dirt Path */}
      <mesh position={[0, 0.08, 0]} geometry={pathGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* ----------------------------------------------------------------------- */}
      {/* 3. VILLAGE STONE WATER WELL (Flush on Village Ground y=0.0)             */}
      {/* ----------------------------------------------------------------------- */}
      <group position={[-5.0, 0.0, 1.5]}>
        {/* Cobblestone Basin */}
        <mesh
          position={[0, 0.35, 0]}
          geometry={createVanillaBlockGeometry({
            width: 2.8,
            height: 0.7,
            depth: 2.8,
            textures: 'mossy_cobblestone',
          })}
          material={vanillaAtlas.getSolidMaterial()}
        />

        {/* Clear Village Well Water */}
        <RealisticWaterPool
          position={[0, 0.35, 0]}
          size={[2.2, 0.6, 2.2]}
          biome="village"
          interactiveId="scene07_well_water"
          interactiveName="Marketplace Well"
        />

        {/* Oak Fence Posts & Roof */}
        <VoxelBlock position={[-1.1, 1.2, -1.1]} type="spruce_planks" />
        <VoxelBlock position={[1.1, 1.2, -1.1]} type="spruce_planks" />
        <VoxelBlock position={[-1.1, 1.2, 1.1]} type="spruce_planks" />
        <VoxelBlock position={[1.1, 1.2, 1.1]} type="spruce_planks" />

        <mesh
          position={[0, 2.2, 0]}
          geometry={createVanillaBlockGeometry({
            width: 3.0,
            height: 0.35,
            depth: 3.0,
            textures: 'spruce_planks',
          })}
          material={vanillaAtlas.getSolidMaterial()}
        />
        <VanillaLantern position={[0, 1.8, 0]} hanging={true} chainLinks={1} />
      </group>

      {/* ----------------------------------------------------------------------- */}
      {/* 4. VILLAGE CROP FARM & WATER IRRIGATION CHANNEL (Flush at y=0.0)        */}
      {/* ----------------------------------------------------------------------- */}
      <group position={[5.5, 0.0, -4.5]}>
        {/* Farmland Plot */}
        <mesh position={[0, 0.4, 0]} geometry={farmlandGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

        {/* Central Water Irrigation Trench */}
        <RealisticWaterPool
          position={[0, 0.45, 0]}
          size={[1.2, 0.5, 4.8]}
          biome="village"
          interactiveId="scene07_irrigation"
          interactiveName="Farm Water Channel"
        />

        {/* Oak Fence Framing the Farm */}
        <VoxelBlock position={[-3.1, 0.5, 0]} type="oak_planks" />
        <VoxelBlock position={[3.1, 0.5, 0]} type="oak_planks" />
      </group>

      {/* ----------------------------------------------------------------------- */}
      {/* 5. VILLAGE COTTAGES & MARKET TRADING POST (Flush at y=0.0)              */}
      {/* ----------------------------------------------------------------------- */}
      {/* Background Village Cottages */}
      <VillageCottageHouse position={[-6.5, 0.0, -6.5]} rotationY={0.35} width={4.2} depth={5.2} />
      <VillageCottageHouse position={[6.5, 0.0, 4.5]} rotationY={-0.65} width={3.8} depth={4.8} />

      {/* 5. VILLAGE MARKET TRADING STALL WITH CANOPY ROOF & LANTERN */}
      <group position={[0, 0.0, -1.5]}>
        {/* Trading Post Counter (Height 0.95, center at y=0.475 -> bottom flush at y=0.0) */}
        <mesh position={[0, 0.475, 0.5]} geometry={counterGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

        {/* 4 Corner Fence Posts */}
        <mesh position={[-1.4, 1.3, 0.5]} geometry={fencePostGeo} material={vanillaAtlas.getSolidMaterial()} />
        <mesh position={[1.4, 1.3, 0.5]} geometry={fencePostGeo} material={vanillaAtlas.getSolidMaterial()} />
        <mesh position={[-1.4, 1.3, -1.1]} geometry={fencePostGeo} material={vanillaAtlas.getSolidMaterial()} />
        <mesh position={[1.4, 1.3, -1.1]} geometry={fencePostGeo} material={vanillaAtlas.getSolidMaterial()} />

        {/* Market Stall Canopy Awning Roof over Villager's Head (y=2.7) */}
        <mesh position={[0, 2.7, -0.3]} geometry={canopyRoofGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

        {/* Warm Hanging Lantern Suspended from Stall Ceiling */}
        <VanillaLantern position={[0, 2.35, -0.3]} hanging={true} chainLinks={1} />

        {/* Interactive Master Villager behind Counter (Standing flush on ground y=0.0) */}
        <group position={[0, 0.0, -0.6]} rotation={[0, 0, 0]}>
          <Villager
            id="scene07_cleric_trader"
            name="Master Village Merchant"
            tooltip="Click to inspect Trades & In-Stock Services"
            profession="librarian"
            onInteract={() => {
              sounds.playVillagerHmm();
              setActiveGui('villager');
            }}
          />
        </group>
      </group>

      {/* Barrels & Supply Crates (Resting on floor y=0.0) */}
      <group position={[-2.4, 0.0, -1.0]}>
        <VoxelBlock position={[0, 0.5, 0]} type="barrel_side" topType="barrel_top" />
        <VoxelBlock position={[0, 1.5, 0]} type="barrel_side" topType="barrel_top" />
        <VoxelBlock position={[0.9, 0.5, 0]} type="oak_planks" />
      </group>

      <group position={[2.4, 0.0, -1.0]}>
        <VoxelBlock position={[0, 0.5, 0]} type="bookshelf" />
        <VoxelBlock position={[0.9, 0.5, 0]} type="emerald_block" />
      </group>

      {/* ----------------------------------------------------------------------- */}
      {/* 6. VEGETATION & DETAIL (Flush on Village Ground y=0.0)                  */}
      {/* ----------------------------------------------------------------------- */}
      <group position={[-2.5, 0.0, 3.5]}>
        <VanillaSunflower position={[0, 0, 0]} />
        <VanillaCrossedPlant position={[0.8, 0, 0.3]} type="poppy" />
        <VanillaCrossedPlant position={[-0.7, 0, 0.4]} type="allium" />
      </group>

      {/* ----------------------------------------------------------------------- */}
      {/* 7. PLAYER STANDING AT TRADE STALL (Beside Stall, Zero Log Obstruction) */}
      {/* ----------------------------------------------------------------------- */}
      <React.Suspense fallback={null}>
        <Interactable
          id="scene07_player_cykf"
          name="Cykf_ (Master Trader)"
          category="PLAYER"
          onClick={() => {
            sounds.playClick();
            useStore.getState().recordDiscovery('scene07_player_cykf', 'PLAYER', 'Village Merchant');
          }}
        >
          <group position={[1.8, 0.0, 0.6]} rotation={[0, -0.45, 0]}>
            <PlayerModel
              pose="idle"
              heldItem="emerald"
              scale={0.065}
            />
            <CharacterContactShadow position={[0, 0.005, 0]} opacity={0.7} scale={1.8} />
          </group>
        </Interactable>
      </React.Suspense>
    </group>
  );
};
