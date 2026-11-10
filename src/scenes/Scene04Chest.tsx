import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Chest3D } from '../world/interactiveObjects';
import {
  DustMotes,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';
import { PlayerModel } from '../player/PlayerModel';
import { VoxelBlock, VoxelTorch, VolumetricGodRay } from '../world/VoxelStructures';
import {
  MineshaftSupportArch,
  MinecartOnRails,
} from '../world/VoxelArchitecture';
import { RealisticLavaPool, LavaWaterfall } from '../world/LavaShader';
import { RealisticWaterPool } from '../world/WaterShader';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';
import {
  createVoxelTerrainGeometry,
  createVanillaBlockGeometry,
} from '../world/VanillaBlockGeometry';
import { vanillaAtlas } from '../world/VanillaTextureAtlas';

export const Scene04Chest: React.FC = () => {
  const setActiveGui = useStore((s) => s.setActiveGui);

  // 1. Mineshaft Deepslate & Stone Cavern Floor (Extra Wide 32x28 to eliminate any void gaps)
  const floorGeo = useMemo(() => {
    return createVoxelTerrainGeometry(32, 28, {
      top: 'deepslate_bricks',
      side: 'deepslate',
      bottom: 'bedrock',
    }, 2.5);
  }, []);

  // 2. Heavy Subterranean Bedrock Base
  const bedrockBaseGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 34,
      height: 3,
      depth: 30,
      textures: 'bedrock',
    });
  }, []);

  // 3. Fully Enclosed Cavern Walls & Ceilings
  const backWallGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 32,
      height: 12,
      depth: 3,
      textures: 'deepslate',
    });
  }, []);

  const leftWallGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 3,
      height: 12,
      depth: 28,
      textures: 'deepslate_bricks',
    });
  }, []);

  const rightWallGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 3,
      height: 12,
      depth: 28,
      textures: 'stone',
    });
  }, []);

  const ceilingGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 32,
      height: 2.5,
      depth: 28,
      textures: 'deepslate',
    });
  }, []);

  // Lava footbridge crossing magma pool
  const bridgeGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 1.6,
      height: 0.35,
      depth: 6.2,
      textures: 'dark_oak_planks',
    });
  }, []);

  return (
    <group>
      {/* ----------------------------------------------------------------------- */}
      {/* 1. ATMOSPHERE & SHADER-PACK LIGHTING (Deep Cavern Torch & Lava Glow)    */}
      {/* ----------------------------------------------------------------------- */}

      {/* Heavy Dusty Cavern Fog */}
      <fog attach="fog" args={['#0F0804', 8, 28]} />

      {/* Ambient Cave Fill: Cool Deepslate Slate */}
      <ambientLight intensity={0.32} color="#35283D" />

      {/* Directional Shaft Light */}
      <directionalLight
        position={[-4, 10, 4]}
        intensity={1.1}
        color="#FFAA55"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      />

      {/* Warm Torchlight Point Lights */}
      <pointLight position={[-2.5, 3.2, 0.5]} color="#FFA533" intensity={2.8} distance={10} decay={2} />
      <pointLight position={[3.2, 3.2, -2.0]} color="#FFA533" intensity={2.6} distance={10} decay={2} />
      <pointLight position={[-4.5, 2.5, -3.0]} color="#48CAE4" intensity={1.2} distance={7} decay={2} />

      {/* Volumetric Dust Shaft */}
      <VolumetricGodRay
        position={[-1.5, 6.0, -1.0]}
        rotation={[0.2, -0.15, 0.1]}
        scale={[2.5, 4.5, 2.5]}
        color="#FFCC88"
        opacity={0.25}
      />

      {/* Floating Orange Embers & Heavy Dust Motes */}
      <DustMotes count={80} area={[18, 9, 16]} color="#FFA533" size={0.07} />

      {/* ----------------------------------------------------------------------- */}
      {/* 2. CAVERN STRUCTURE & ENCLOSED WALLS (Zero Gaps / Full Enclosure)       */}
      {/* ----------------------------------------------------------------------- */}

      {/* Solid Bedrock Foundation (Under y=0, Zero Z-Fighting) */}
      <mesh position={[0, -2.6, 0]} geometry={bedrockBaseGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* Main Floor (Surface flush at y=0.0) */}
      <mesh position={[0, 0, 0]} geometry={floorGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* Back Cavern Wall (Base embedded at y=0.0) */}
      <mesh position={[0, 4.5, -8.0]} geometry={backWallGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* Left Cavern Wall */}
      <mesh position={[-14.0, 4.5, 0]} geometry={leftWallGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* Right Cavern Wall */}
      <mesh position={[14.0, 4.5, 0]} geometry={rightWallGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* Cave Ceiling with Stalactites */}
      <mesh position={[0, 9.5, 0]} geometry={ceilingGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* Stalactites & Hanging Ceiling Rock Formations */}
      <group position={[-2.0, 9.5, -2.0]}>
        <VoxelBlock position={[0, 0, 0]} type="deepslate" />
        <VoxelBlock position={[0, -1, 0]} type="cobblestone" />
        <VoxelBlock position={[0, -2, 0]} type="stone" />
      </group>
      <group position={[4.0, 9.5, 1.0]}>
        <VoxelBlock position={[0, 0, 0]} type="dripstone_block" />
        <VoxelBlock position={[0, -1, 0]} type="dripstone_block" />
      </group>

      {/* Exposed Rich Ore Veins in Wall */}
      <group position={[-3.5, 2.5, -6.4]}>
        <VoxelBlock position={[0, 0, 0]} type="diamond_ore" />
        <VoxelBlock position={[1, 0, 0]} type="diamond_ore" />
        <VoxelBlock position={[0, 1, 0]} type="diamond_ore" />
        <VoxelBlock position={[1, 1, 0]} type="deepslate" />
      </group>

      <group position={[3.0, 3.5, -6.4]}>
        <VoxelBlock position={[0, 0, 0]} type="gold_ore" />
        <VoxelBlock position={[-1, 0, 0]} type="gold_ore" />
        <VoxelBlock position={[0, -1, 0]} type="iron_ore" />
        <VoxelBlock position={[1, -1, 0]} type="emerald_ore" />
      </group>

      <group position={[-7.5, 1.5, -4.0]}>
        <VoxelBlock position={[0, 0, 0]} type="redstone_ore" />
        <VoxelBlock position={[0, 1, 0]} type="redstone_ore" />
        <VoxelBlock position={[1, 0, 0]} type="diamond_ore" />
      </group>

      {/* ----------------------------------------------------------------------- */}
      {/* 3. WOODEN MINESHAFT SUPPORT ARCHES & RAILWAY                            */}
      {/* ----------------------------------------------------------------------- */}
      <group position={[-2.5, 0.0, 1.5]}>
        <MineshaftSupportArch width={3.6} height={3.8} />
      </group>
      <group position={[-2.5, 0.0, -2.5]}>
        <MineshaftSupportArch width={3.6} height={3.8} />
      </group>
      <group position={[-2.5, 0.0, -6.5]}>
        <MineshaftSupportArch width={3.6} height={3.8} />
      </group>

      {/* Wall Torches on Support Beams */}
      <group position={[-4.1, 2.3, 1.5]}>
        <VoxelTorch position={[0, 0, 0]} />
      </group>
      <group position={[-0.9, 2.3, -2.5]}>
        <VoxelTorch position={[0, 0, 0]} />
      </group>
      <group position={[-4.1, 2.3, -6.5]}>
        <VoxelTorch position={[0, 0, 0]} />
      </group>

      {/* Minecart with Loot on Railway (Grounded flush on floor y=0.0) */}
      <group position={[-2.5, 0.0, -0.5]}>
        <MinecartOnRails rotationY={0} />
      </group>

      {/* ----------------------------------------------------------------------- */}
      {/* 4. COMPLETE MOLTEN LAVA SYSTEM: POOL, WATERFALL, BASALT & BRIDGE        */}
      {/* ----------------------------------------------------------------------- */}
      {/* Continuous Cascading Lava Waterfall from ceiling to pool */}
      <LavaWaterfall
        position={[6.2, 0.0, -5.2]}
        width={2.2}
        height={8.5}
        depth={0.6}
        interactiveId="scene04_lava_fall"
        interactiveName="Deep Magma Cascade"
      />

      {/* Dynamic Animated Magma Reservoir with Basalt/Obsidian Rim & Embers */}
      <RealisticLavaPool
        position={[5.5, 0.0, -2.2]}
        size={[5.4, 0.875, 6.4]}
        withBasin={true}
        interactiveId="scene04_lava"
        interactiveName="Deep Molten Lava Pool"
      />

      {/* Wooden Plank Footbridge crossing the Lava Reservoir */}
      <group position={[2.8, 0.15, -2.2]}>
        <mesh geometry={bridgeGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />
        {/* Wooden Railing Fences */}
        <VoxelBlock position={[-0.6, 0.6, -2.5]} type="dark_oak_planks" />
        <VoxelBlock position={[-0.6, 0.6, 0]} type="dark_oak_planks" />
        <VoxelBlock position={[-0.6, 0.6, 2.5]} type="dark_oak_planks" />
      </group>

      {/* ----------------------------------------------------------------------- */}
      {/* 5. CAVE GROUNDWATER STREAM & DRIPPING POOL                              */}
      {/* ----------------------------------------------------------------------- */}
      <group position={[-6.8, 0.0, -3.5]}>
        <RealisticWaterPool
          size={[4.2, 0.85, 4.2]}
          biome="mines"
          flowSpeed={0.6}
          interactiveId="scene04_cave_water"
          interactiveName="Subterranean Spring"
        />
        {/* Retaining Cobblestone Rim */}
        <mesh
          position={[0, 0.05, 0]}
          geometry={createVanillaBlockGeometry({
            width: 4.8,
            height: 0.35,
            depth: 4.8,
            textures: 'mossy_cobblestone',
          })}
          material={vanillaAtlas.getSolidMaterial()}
        />
      </group>

      {/* ----------------------------------------------------------------------- */}
      {/* 6. ABANDONED LOOT CHEST (Opens 27-Slot Minecraft Chest GUI!)            */}
      {/* ----------------------------------------------------------------------- */}
      <Interactable
        id="scene04_chest"
        name="Miner's Lost Treasure Chest"
        category="PROP"
        tooltip="Click to open 27-slot Loot GUI"
        onClick={() => {
          sounds.playChestOpen();
          setActiveGui('chest');
          useStore.getState().recordDiscovery('scene04_chest', 'PROP', 'Abandoned Mineshaft Loot');
        }}
      >
        <group position={[0.5, 0.0, 1.2]} rotation={[0, -0.25, 0]}>
          <Chest3D position={[0, 0, 0]} />
        </group>
      </Interactable>

      {/* ----------------------------------------------------------------------- */}
      {/* 7. PLAYER STANDING BY MINECART WITH DIAMOND PICKAXE                     */}
      {/* ----------------------------------------------------------------------- */}
      <React.Suspense fallback={null}>
        <Interactable
          id="scene04_player_cykf"
          name="Cykf_ (Master Miner)"
          category="PLAYER"
          onClick={() => {
            sounds.playClick();
            useStore.getState().recordDiscovery('scene04_player_cykf', 'PLAYER', 'Deep Cavern Delver');
          }}
        >
          <group position={[-0.8, 0.0, 1.2]} rotation={[0, 0.35, 0]}>
            <PlayerModel
              pose="idle"
              heldItem="diamond-pickaxe"
              scale={0.065}
            />
            <CharacterContactShadow position={[0, 0.005, 0]} opacity={0.7} scale={1.8} />
          </group>
        </Interactable>
      </React.Suspense>
    </group>
  );
};
