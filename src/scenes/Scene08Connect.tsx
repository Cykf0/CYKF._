import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Axolotl } from '../world/mobs';
import {
  DustMotes,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';
import { PlayerModel } from '../player/PlayerModel';
import {
  VanillaLilyPad,
} from '../world/VoxelStructures';
import {
  AmethystGeodeChamber,
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

export const Scene08Connect: React.FC = () => {
  const dripRef = useRef<THREE.Points>(null);

  // 1. Natural Terraced Moss & Clay Floor (28x28 voxels)
  const mossTerrainGeom = useMemo(() => {
    return createVoxelTerrainGeometry(28, 28, {
      top: 'moss_block',
      side: 'moss_block',
      bottom: 'stone',
    }, 1.2);
  }, []);

  // 2. Heavy Subterranean Bedrock Base
  const bedrockBaseGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 34,
      height: 3,
      depth: 34,
      textures: 'bedrock',
    });
  }, []);

  // 3. Fully Enclosed Cavern Walls & Ceiling
  const backWallGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 32,
      height: 13,
      depth: 2.5,
      textures: 'mossy_stone_bricks',
    });
  }, []);

  const leftWallGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 2.5,
      height: 13,
      depth: 32,
      textures: 'stone',
    });
  }, []);

  const rightWallGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 2.5,
      height: 13,
      depth: 32,
      textures: 'deepslate',
    });
  }, []);

  const ceilingGeom = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 32,
      height: 2.0,
      depth: 32,
      textures: 'deepslate',
    });
  }, []);

  // 4. Raised Mossy Stone Cliff for Waterfall
  const cliffGeom = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 8.5,
      height: 7.5,
      depth: 4.5,
      textures: {
        top: 'moss_block',
        bottom: 'stone',
        north: 'stone',
        south: 'mossy_stone_bricks',
        east: 'moss_block',
        west: 'moss_block',
      },
    });
  }, []);

  // Ceiling Water Droplets falling into the pool
  const { positions, speeds } = useMemo(() => {
    const count = 55;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = 1.5 + (Math.random() - 0.5) * 6.0;
      pos[i * 3 + 1] = 5.0 + Math.random() * 3.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5.0;
      spd[i]         = 0.04 + Math.random() * 0.04;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame(() => {
    if (dripRef.current) {
      const pos = dripRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 55; i++) {
        pos[i * 3 + 1] -= speeds[i];
        if (pos[i * 3 + 1] < 0.1) {
          pos[i * 3 + 1] = 7.0 + Math.random();
          pos[i * 3]     = 1.5 + (Math.random() - 0.5) * 6.0;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 5.0;
        }
      }
      dripRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. ATMOSPHERE & SHADER-PACK LIGHTING */}
      <fog attach="fog" args={['#0A261A', 10, 36]} />
      <ambientLight intensity={0.52} color="#103626" />

      <directionalLight
        position={[4, 13, -3]}
        intensity={2.8}
        color="#F0FFF4"
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

      <directionalLight position={[-6, 7, 5]} intensity={1.4} color="#BF55EC" />
      <pointLight position={[1.5, 1.2, 0.5]} color="#48CAE4" intensity={2.4} distance={8} decay={2} />
      <pointLight position={[-4.5, 4.0, -3.5]} color="#52D1B2" intensity={2.2} distance={9} decay={2} />

      <points ref={dripRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.11}
          color="#99F6E4"
          transparent
          opacity={0.8}
        />
      </points>

      <DustMotes count={70} area={[18, 8, 18]} color="#6EE7B7" size={0.065} />

      {/* 2. SUBTERRANEAN FOUNDATION & ENCLOSED CAVERN (Zero Z-Fighting) */}
      <mesh position={[0, -2.6, 0]} geometry={bedrockBaseGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[0, 0, 0]} geometry={mossTerrainGeom} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[0, 10.0, 0]} geometry={ceilingGeom} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      <mesh position={[0, 4.5, -9.5]} geometry={backWallGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[-14.5, 4.5, 0]} geometry={leftWallGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[14.5, 4.5, 0]} geometry={rightWallGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* 3. CASCADING NATURAL WATERFALL (Flush on Cliff & Ground y=0.0) */}
      <mesh position={[-4.5, 3.5, -5.5]} geometry={cliffGeom} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

      <WaterfallMesh
        position={[-4.5, 0.0, -3.8]}
        width={2.8}
        height={7.2}
        depth={0.5}
        color="#48CAE4"
        foamColor="#E0F7FA"
        speed={1.6}
        interactiveId="scene08_waterfall"
        interactiveName="Lost Paradise Waterfall"
      />

      {/* 4. CRYSTAL CLEAR SUBTERRANEAN LAKE (Flush on Moss Floor y=0.0) */}
      <group position={[1.5, 0.0, 0.5]}>
        <mesh
          position={[0, -0.15, 0]}
          geometry={createVanillaBlockGeometry({
            width: 7.8,
            height: 0.6,
            depth: 6.8,
            textures: 'clay',
          })}
          material={vanillaAtlas.getSolidMaterial()}
          receiveShadow
        />

        <RealisticWaterPool
          position={[0, 0.12, 0]}
          size={[7.2, 0.8, 6.2]}
          biome="lush"
          flowSpeed={0.8}
          interactiveId="scene08_water_pool"
          interactiveName="Lush Cavern Oasis"
        />

        {[
          [-1.8, 0.22, -1.2, 0.4],
          [1.6, 0.22, 1.2, 1.8],
          [-0.8, 0.22, 1.5, -0.6],
        ].map(([lx, ly, lz, rot], i) => (
          <Interactable
            key={i}
            id={`scene08_lilypad_${i}`}
            name="Floating Water Lily Pad"
            category="PLANT"
            position={[lx, ly, lz]}
            onClick={() => {
              sounds.playWaterSplash();
              useStore.getState().recordDiscovery(`scene08_lilypad_${i}`, 'PLANT', 'Touch Water Lily Pad');
            }}
          >
            <VanillaLilyPad position={[0, 0, 0]} rotationY={rot} />
          </Interactable>
        ))}

        <Axolotl position={[-0.8, 0.08, -0.4]} rotation={[0, 0.5, 0]} />
      </group>

      {/* 5. GLOWING AMETHYST GEODE CHAMBER (Flush on Floor y=0.0) */}
      <Interactable
        id="scene08_amethyst_geode"
        name="Luminescent Amethyst Geode"
        category="PROP"
        tooltip="Click to listen to amethyst crystalline resonance"
        onClick={() => {
          sounds.playEnchantChime();
          useStore.getState().recordDiscovery('scene08_amethyst_geode', 'PROP', 'Amethyst Geode Chamber');
        }}
      >
        <AmethystGeodeChamber position={[5.8, 0.0, -2.5]} />
      </Interactable>

      {/* 6. PLAYER STANDING ON MOSS LEDGE (Flush on Moss Floor y=0.0) */}
      <React.Suspense fallback={null}>
        <Interactable
          id="scene08_player_cykf"
          name="Cykf_ (Paradise Discoverer)"
          category="PLAYER"
          onClick={() => {
            sounds.playClick();
            useStore.getState().recordDiscovery('scene08_player_cykf', 'PLAYER', 'Cavern Botanist');
          }}
        >
          <group position={[-1.2, 0.0, 2.0]} rotation={[0, 0.25, 0]}>
            <PlayerModel
              pose="idle"
              heldItem="heart-of-the-sea"
              scale={0.065}
            />
            <CharacterContactShadow position={[0, 0.005, 0]} opacity={0.7} scale={1.8} />
          </group>
        </Interactable>
      </React.Suspense>
    </group>
  );
};
