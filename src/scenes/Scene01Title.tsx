import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PlayerModel } from '../player/PlayerModel';
import { Sheep, Villager } from '../world/mobs';
import {
  DustMotes,
  DriftingVoxelClouds,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';
import {
  VoxelBlock,
  VanillaLantern,
  VanillaLampPost,
  VanillaSunflower,
  VanillaCrossedPlant,
  VillageCottageHouse,
  VolumetricGodRay,
} from '../world/VoxelStructures';
import {
  MedievalCastleDistance,
  MedievalWindmill,
  StoneArchBridge,
  ColossalFantasyTree,
} from '../world/VoxelArchitecture';
import { RealisticWaterPool } from '../world/WaterShader';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';
import {
  createVoxelTerrainGeometry,
  createVoxelPathGeometry,
  createVanillaBlockGeometry,
} from '../world/VanillaBlockGeometry';
import { vanillaAtlas } from '../world/VanillaTextureAtlas';

export const Scene01Title: React.FC = () => {
  const isTitleScreen = useStore((s) => s.isTitleScreen);
  const setShowIntroGreeting = useStore((s) => s.setShowIntroGreeting);

  // 1. Terrain Geometries (Complete, wide, zero-gap layout)
  const bedrockBaseGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 36,
      height: 3,
      depth: 36,
      textures: 'bedrock',
    });
  }, []);

  const foregroundTerraceGeo = useMemo(() => {
    return createVoxelTerrainGeometry(16, 9.0, {
      top: 'grass_block_top',
      side: 'grass_block_side',
      bottom: 'dirt',
    }, 1.2, '#79c05a');
  }, []);

  const villagePathGeo = useMemo(() => {
    return createVoxelPathGeometry(2.4, 9.0);
  }, []);

  const windmillHillGeo = useMemo(() => {
    return createVoxelTerrainGeometry(10, 10, {
      top: 'grass_block_top',
      side: 'grass_block_side',
      bottom: 'dirt',
    }, 2.5, '#6eae46');
  }, []);

  const distantRidgeGeo = useMemo(() => {
    return createVoxelTerrainGeometry(36, 10, {
      top: 'grass_block_top',
      side: 'grass_block_side',
      bottom: 'stone',
    }, 4.5, '#5a8e3e');
  }, []);

  const riverBedGeo = useMemo(() => {
    return createVoxelTerrainGeometry(32, 6.5, 'sand', 0.8);
  }, []);

  const sunBillboardRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (sunBillboardRef.current) {
      const t = state.clock.getElapsedTime();
      sunBillboardRef.current.position.y = 8.2 + Math.sin(t * 0.4) * 0.05;
    }
  });

  return (
    <group>
      {/* 1. ATMOSPHERE & SHADER-PACK LIGHTING */}
      <fog attach="fog" args={['#FCA34D', 18, 52]} />
      <ambientLight intensity={0.65} color="#FFE4B5" />

      <directionalLight
        position={[-12, 8, -16]}
        intensity={3.4}
        color="#FFA726"
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

      <directionalLight position={[6, 12, 10]} intensity={0.7} color="#90CAF9" />
      <pointLight position={[-4.5, 2.2, 1.8]} color="#FFAA33" intensity={2.2} distance={8} decay={2} />
      <pointLight position={[3.2, 2.8, -1.2]} color="#FFAA33" intensity={2.0} distance={8} decay={2} />

      <VolumetricGodRay
        position={[-6, 7.5, -12]}
        rotation={[0.3, 0.4, -0.2]}
        scale={[3.5, 6.0, 3.5]}
        color="#FFA726"
        opacity={0.35}
      />

      <DustMotes count={90} area={[22, 10, 22]} color="#FFE082" size={0.075} />
      <DriftingVoxelClouds altitude={14.0} speed={0.4} />

      {/* 2. SUBTERRANEAN FOUNDATION & GROUNDWORK */}
      <mesh position={[0, -2.5, 0]} geometry={bedrockBaseGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[0, 0, 1.5]} geometry={foregroundTerraceGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[0.5, 0.02, 1.5]} geometry={villagePathGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[-10.5, 0.8, -4.5]} geometry={windmillHillGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />
      <mesh position={[0, 2.0, -22.0]} geometry={distantRidgeGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* 3. COLOSSAL MOUNTAIN CASTLE & WINDMILL */}
      <Interactable
        id="scene01_distant_castle"
        name="Highland Royal Stronghold"
        category="STRUCTURE"
        onClick={() => {
          sounds.playChestOpen();
          useStore.getState().recordDiscovery('scene01_distant_castle', 'STRUCTURE', 'Highland Royal Fortress');
        }}
      >
        <group scale={1.3}>
          <MedievalCastleDistance position={[0, 3.2, -18.0]} />
        </group>
      </Interactable>

      <Interactable
        id="scene01_windmill"
        name="Village Windmill"
        category="STRUCTURE"
        materialType="wood"
        onClick={() => {
          sounds.playWobble(400);
          useStore.getState().recordDiscovery('scene01_windmill', 'STRUCTURE', 'Highland Windmill');
        }}
      >
        <MedievalWindmill position={[-10.5, 0.8, -4.5]} />
      </Interactable>

      <ColossalFantasyTree position={[-11.5, 0.0, 3.5]} height={12} />
      <ColossalFantasyTree position={[10.5, 0.0, 2.5]} height={11} />

      {/* 4. VILLAGE WATER WELL & IRRIGATION CANAL (Flush at y=0.0) */}
      <group position={[-4.5, 0.0, 2.0]}>
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
        <RealisticWaterPool
          position={[0, 0.35, 0]}
          size={[2.2, 0.6, 2.2]}
          biome="village"
          interactiveId="scene01_well_water"
          interactiveName="Village Fountain Well"
        />
        <VoxelBlock position={[-1.1, 1.2, -1.1]} type="oak_planks" />
        <VoxelBlock position={[1.1, 1.2, -1.1]} type="oak_planks" />
        <VoxelBlock position={[-1.1, 1.2, 1.1]} type="oak_planks" />
        <VoxelBlock position={[1.1, 1.2, 1.1]} type="oak_planks" />
        <mesh
          position={[0, 2.2, 0]}
          geometry={createVanillaBlockGeometry({
            width: 3.0,
            height: 0.4,
            depth: 3.0,
            textures: 'oak_planks',
          })}
          material={vanillaAtlas.getSolidMaterial()}
        />
        <VanillaLantern position={[0, 1.8, 0]} hanging={true} chainLinks={1} />
      </group>

      {/* 5. WINDING RIVER & STONE ARCH BRIDGE */}
      <group position={[0, 0, -6.5]}>
        <mesh position={[0, -0.6, 0]} geometry={riverBedGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
        <RealisticWaterPool
          position={[0, -0.12, 0]}
          size={[32, 0.7, 6.2]}
          biome="village"
          flowDirection={[1, 0]}
          flowSpeed={0.9}
          interactiveId="scene01_river_water"
          interactiveName="Crystal Village Waters"
        />
        <Interactable
          id="scene01_stone_bridge"
          name="King's Crossing Bridge"
          category="STRUCTURE"
          onClick={() => {
            sounds.playClick();
            useStore.getState().recordDiscovery('scene01_stone_bridge', 'STRUCTURE', 'River Stone Bridge');
          }}
        >
          <StoneArchBridge position={[1.5, 0, 0]} length={7.2} width={3.4} />
        </Interactable>
      </group>

      {/* 6. VILLAGE COTTAGES (Flush on Far Riverbank y=0.0) */}
      <group position={[8.5, 0.0, -7.5]}>
        <Interactable
          id="scene01_village_house"
          name="Village Cottage"
          category="STRUCTURE"
          materialType="wood"
          onClick={() => {
            sounds.playChestOpen();
            useStore.getState().recordDiscovery('scene01_village_house', 'STRUCTURE', 'Riverbank Homestead');
          }}
        >
          <VillageCottageHouse position={[0, 0, 0]} rotationY={-0.35} width={4.2} depth={5.2} />
        </Interactable>

        <group position={[4.2, 0, -4.5]}>
          <VillageCottageHouse position={[0, 0, 0]} rotationY={-0.15} width={3.8} depth={4.5} />
        </group>
      </group>

      {/* 7. VEGETATION (Flush on Ground y=0.0) */}
      <group position={[-2.5, 0.0, 3.5]}>
        <VanillaSunflower position={[0, 0, 0]} />
        <VanillaSunflower position={[0.6, 0, 0.4]} />
        <VanillaSunflower position={[-0.5, 0, 0.3]} />
      </group>
      <group position={[4.0, 0.0, 3.8]}>
        <VanillaSunflower position={[0, 0, 0]} />
        <VanillaSunflower position={[0.7, 0, -0.3]} />
      </group>

      <group position={[-1.2, 0.0, 1.8]}>
        <VanillaCrossedPlant position={[0, 0, 0]} type="poppy" />
        <VanillaCrossedPlant position={[0.6, 0, 0.4]} type="dandelion" />
        <VanillaCrossedPlant position={[-0.5, 0, -0.3]} type="short_grass" />
        <VanillaCrossedPlant position={[1.2, 0, 0.2]} type="fern" />
      </group>

      {/* 8. PASSIVE MOBS (Flush on Ground y=0.0) */}
      <Sheep position={[-2.8, 0.0, 2.5]} rotation={[0, 0.7, 0]} woolColor="white" />
      <Sheep position={[-5.8, 0.0, 0.2]} rotation={[0, -0.5, 0]} woolColor="white" />
      <Villager
        id="scene01_villager_guide"
        name="Village Guide (Cykf's Archive)"
        tooltip="Click to hear Cykf's intro!"
        position={[3.2, 0.0, 0.8]}
        rotation={[0, -0.8, 0]}
        profession="farmer"
        onInteract={() => {
          sounds.playVillagerHmm();
          setShowIntroGreeting(true);
        }}
      />

      {/* 9. THE EXPLORER: Cykf_ (Flush on Ground y=0.0) */}
      <React.Suspense fallback={null}>
        <Interactable
          id="scene01_player_cykf"
          name="Cykf_ (Portfolio Explorer)"
          category="PLAYER"
          tooltip="Click to hear intro!"
          onClick={() => {
            sounds.playClick();
            setShowIntroGreeting(true);
          }}
        >
          <group position={[1.5, 0.0, 1.5]} rotation={[0, -0.25, 0]}>
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
