import React from 'react';
import { PlayerModel } from '../player/PlayerModel';
import { Villager } from '../world/mobs';
import { blockMaterials } from '../world/blockMaterials';
import {
  FlickeringLight,
  VolumetricLightShaft,
  DustMotes,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

export const Scene07Trades: React.FC = () => {
  return (
    <group>
      {/* 1. Cozy Warm Tavern Interior Lighting */}
      <ambientLight intensity={0.5} color="#FFE6CC" />

      {/* Sunbeam Light pouring through the window */}
      <directionalLight
        position={[-8, 7, 6]}
        intensity={3.2}
        color="#FFA844"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* Warm Ambient Bounce Light */}
      <directionalLight position={[4, 5, -3]} intensity={0.6} color="#FFD1A4" />

      {/* Atmospheric Interior Haze Fog */}
      <fog attach="fog" args={['#2A180E', 6, 24]} />

      {/* 2. Volumetric Window Sunbeam & Illuminated Dust Motes */}
      <VolumetricLightShaft
        position={[-2.8, 3.6, 0.5]}
        rotation={[0.35, 0, -0.6]}
        scale={[1.5, 1.3, 1.5]}
        color="#FFE099"
        opacity={0.24}
      />
      <DustMotes count={55} area={[11, 5, 11]} color="#FFDCA8" size={0.06} />

      {/* 3. Wood Plank Floor with PBR Normals */}
      <Interactable
        id="scene07_floor"
        name="Oak Tavern Wood Floor"
        category="BLOCK"
        materialType="wood"
        hardness={400}
        dropItem="oak_planks"
      >
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <boxGeometry args={[20, 1, 20]} />
          <primitive object={blockMaterials.oakPlanks} attach="material" />
        </mesh>
      </Interactable>

      {/* 4. Cobblestone & Wood Wall */}
      <group position={[0, 0, -3.2]}>
        <Interactable
          id="scene07_wall"
          name="Interior Stone Wall"
          category="STRUCTURE"
          materialType="stone"
        >
          <mesh position={[0, 2.5, 0]} receiveShadow>
            <boxGeometry args={[18, 6, 1]} />
            <primitive object={blockMaterials.stoneBricks} attach="material" />
          </mesh>
        </Interactable>

        {/* 3 Item Frames on Wall */}
        {[
          { x: -1.5, item: 'emerald', label: 'Item Frame: Shiny Emerald' },
          { x: 0.5, item: 'diamond', label: 'Item Frame: Cut Diamond' },
          { x: 2.5, item: 'enchanted_book', label: 'Item Frame: Ancient Tome' },
        ].map((frame, i) => (
          <Interactable
            key={i}
            id={`scene07_frame_${i}`}
            name={frame.label}
            category="PROP"
            position={[frame.x, 3.2, 0.52]}
            onClick={() => {
              sounds.playItemPop();
              useStore.getState().recordDiscovery(`scene07_frame_${i}`, 'PROP', `Inspect ${frame.label}`);
            }}
          >
            <mesh castShadow>
              <boxGeometry args={[1.2, 1.2, 0.1]} />
              <meshStandardMaterial color="#8B5A2B" roughness={0.75} />
            </mesh>
            <mesh position={[0, 0, 0.08]}>
              <planeGeometry args={[0.8, 0.8]} />
              <meshBasicMaterial transparent opacity={0.0} />
            </mesh>
          </Interactable>
        ))}
      </group>

      {/* 5. Long Wooden Shop Counter */}
      <group position={[1.2, 0, -0.8]}>
        <Interactable
          id="scene07_counter"
          name="Merchant Shop Counter"
          category="PROP"
          materialType="wood"
        >
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.5, 1.2, 1.4]} />
            <primitive object={blockMaterials.oakPlanks} attach="material" />
          </mesh>

          {/* Counter Wooden Trapdoor Paneling */}
          {[-2.0, -0.7, 0.6, 1.9].map((tx, idx) => (
            <mesh key={idx} position={[tx, 0.6, 0.72]} castShadow>
              <boxGeometry args={[1.0, 1.0, 0.06]} />
              <meshStandardMaterial color="#5C3B1E" roughness={0.8} />
            </mesh>
          ))}
        </Interactable>

        {/* Wooden Lectern on Counter */}
        <Interactable
          id="scene07_lectern"
          name="Merchant Ledger Lectern"
          category="PROP"
          position={[-1.2, 1.35, 0]}
          onClick={() => {
            sounds.playChestOpen();
            useStore.getState().recordDiscovery('scene07_lectern', 'PROP', 'Inspect Merchant Ledger');
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.3, 0.9]} />
            <meshStandardMaterial color="#A06935" roughness={0.75} />
          </mesh>
        </Interactable>

        {/* Counter Table Lantern */}
        <Interactable
          id="scene07_counter_lantern"
          name="Counter Oil Lantern"
          category="LIGHT_SOURCE"
          position={[-2.2, 1.4, 0]}
          onClick={() => {
            sounds.playClick();
            useStore.getState().recordDiscovery('scene07_counter_lantern', 'LIGHT_SOURCE', 'Tavern Counter Lantern');
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.45, 0.3]} />
            <meshStandardMaterial
              color="#FFA500"
              emissive="#FF7700"
              emissiveIntensity={2.8}
              roughness={0.2}
            />
          </mesh>
          <FlickeringLight position={[0, 0.1, 0]} color="#FFA533" baseIntensity={2.2} distance={7} />
        </Interactable>

        {/* Open Chest with Glistening Emeralds */}
        <Interactable
          id="scene07_emerald_chest"
          name="Glistening Emerald Vault"
          category="PROP"
          position={[0.8, 1.3, 0]}
          onClick={() => {
            sounds.playItemPop();
            useStore.getState().recordDiscovery('scene07_emerald_chest', 'PROP', 'Touch Glistening Emeralds');
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[1.0, 0.5, 0.8]} />
            <meshStandardMaterial color="#8B5A2B" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.7, 0.2, 0.6]} />
            <meshStandardMaterial
              color="#00FF66"
              emissive="#00DD44"
              emissiveIntensity={2.0}
              roughness={0.15}
            />
          </mesh>
          <pointLight position={[0, 0.35, 0]} color="#00FF66" intensity={1.2} distance={3} />
        </Interactable>
      </group>

      {/* 6. Friendly 3D Villager with Contact Shadow */}
      <group position={[1.2, 0, -2.0]}>
        <Villager position={[0, 0, 0]} />
        <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.7} scale={1.6} />
      </group>

      {/* 7. Saksham Player Standing as Customer */}
      <React.Suspense fallback={null}>
        <group position={[-1.2, 0, 0.6]} rotation={[0, 0.4, 0]}>
          <PlayerModel
            pose="idle"
            heldItem="emerald"
            scale={0.065}
          />
          <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.7} scale={1.8} />
        </group>
      </React.Suspense>
    </group>
  );
};
