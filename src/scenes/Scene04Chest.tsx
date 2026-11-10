import React from 'react';
import { PlayerModel } from '../player/PlayerModel';
import { Chest3D } from '../world/interactiveObjects';
import { blockMaterials } from '../world/blockMaterials';
import {
  FlickeringLight,
  DustMotes,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

export const Scene04Chest: React.FC = () => {
  return (
    <group>
      {/* 1. Dark Cavern Atmospheric Lighting */}
      <ambientLight intensity={0.25} color="#1E140A" />

      {/* Subtle Blue/Cyan Ambient Cave Bounce */}
      <directionalLight position={[0, -5, 0]} intensity={0.2} color="#103040" />

      {/* Atmospheric Cavern Fog */}
      <fog attach="fog" args={['#100A05', 4, 22]} />

      {/* 2. Floating Subterranean Dust Motes */}
      <DustMotes count={65} area={[14, 6, 12]} color="#FFAA55" size={0.06} />

      {/* 3. Stone Cavern Floor with PBR Normals */}
      <Interactable
        id="scene04_floor"
        name="Deep Mineshaft Stone Floor"
        category="BLOCK"
        materialType="stone"
        hardness={500}
        dropItem="cobblestone"
      >
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <boxGeometry args={[20, 1, 20]} />
          <primitive object={blockMaterials.stoneBricks} attach="material" />
        </mesh>
      </Interactable>

      {/* 4. Cavern Wall with Embedded PBR Ore Veins */}
      <group position={[0, 0, -3.2]}>
        <Interactable
          id="scene04_wall"
          name="Mineshaft Rock Wall"
          category="STRUCTURE"
          materialType="stone"
        >
          <mesh position={[0, 2.5, 0]} receiveShadow>
            <boxGeometry args={[18, 6, 1]} />
            <primitive object={blockMaterials.stoneBricks} attach="material" />
          </mesh>
        </Interactable>

        {/* Embedded Ore Blocks with High Gloss Gems & Emissive Glow */}
        {[
          { name: 'diamond1', x: -3.5, y: 2.5, z: 0.45, col: '#55FFFF', glow: '#00E5FF', label: 'Diamond Ore', item: 'diamond' },
          { name: 'gold', x: -1.5, y: 3.2, z: 0.45, col: '#FFDD00', glow: '#FFAA00', label: 'Gold Ore', item: 'raw_gold' },
          { name: 'redstone', x: 0.8, y: 2.0, z: 0.45, col: '#FF2222', glow: '#CC0000', label: 'Redstone Ore', item: 'redstone' },
          { name: 'emerald', x: 3.2, y: 3.0, z: 0.45, col: '#00FF66', glow: '#00DD44', label: 'Emerald Ore', item: 'emerald' },
          { name: 'diamond2', x: 4.5, y: 1.5, z: 0.45, col: '#55FFFF', glow: '#00E5FF', label: 'Deep Diamond Ore', item: 'diamond' },
        ].map((ore, i) => (
          <Interactable
            key={i}
            id={`scene04_ore_${ore.name}`}
            name={ore.label}
            category="BLOCK"
            materialType="stone"
            hardness={400}
            dropItem={ore.item}
            position={[ore.x, ore.y, ore.z]}
            onClick={() => {
              sounds.playBlockHit('stone');
              useStore.getState().recordDiscovery(`scene04_ore_${ore.name}`, 'BLOCK', `Mine ${ore.label}`);
            }}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.2, 1.2, 0.2]} />
              <primitive
                object={blockMaterials.getOreMaterial(ore.name, ore.col, ore.glow)}
                attach="material"
              />
            </mesh>
            <pointLight color={ore.glow} intensity={1.2} distance={3.5} decay={2} />
          </Interactable>
        ))}
      </group>

      {/* 5. Wooden Mineshaft Support Arch Beams */}
      {[-4, 0, 4].map((ax, i) => (
        <group key={i} position={[ax, 0, 0]}>
          <Interactable
            id={`scene04_support_post_left_${i}`}
            name="Mineshaft Support Post"
            category="STRUCTURE"
            materialType="wood"
          >
            <mesh position={[-2.8, 1.8, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.5, 3.6, 0.5]} />
              <primitive object={blockMaterials.oakPlanks} attach="material" />
            </mesh>
          </Interactable>

          <Interactable
            id={`scene04_support_post_right_${i}`}
            name="Mineshaft Timber Arch"
            category="STRUCTURE"
            materialType="wood"
          >
            <mesh position={[2.8, 1.8, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.5, 3.6, 0.5]} />
              <primitive object={blockMaterials.oakPlanks} attach="material" />
            </mesh>
          </Interactable>

          <Interactable
            id={`scene04_support_beam_top_${i}`}
            name="Overhead Timber Beam"
            category="STRUCTURE"
            materialType="wood"
          >
            <mesh position={[0, 3.6, 0]} castShadow receiveShadow>
              <boxGeometry args={[6.1, 0.5, 0.5]} />
              <primitive object={blockMaterials.oakPlanks} attach="material" />
            </mesh>
          </Interactable>

          {/* Wall Torches */}
          {[-2.5, 2.5].map((tx, idx) => (
            <Interactable
              key={idx}
              id={`scene04_torch_${i}_${idx}`}
              name="Mineshaft Wall Torch"
              category="LIGHT_SOURCE"
              position={[tx, 2.4, 0]}
              onClick={() => {
                sounds.playClick();
                useStore.getState().recordDiscovery(`scene04_torch_${i}_${idx}`, 'LIGHT_SOURCE', 'Mineshaft Torch');
              }}
            >
              <mesh position={[0, -0.15, 0]}>
                <boxGeometry args={[0.1, 0.35, 0.1]} />
                <meshStandardMaterial color="#6B4226" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[0.12, 0.15, 0.12]} />
                <meshStandardMaterial
                  color="#FFA500"
                  emissive="#FF7700"
                  emissiveIntensity={3.2}
                />
              </mesh>
              <FlickeringLight
                position={[0, 0.15, 0.2]}
                color="#FFA533"
                baseIntensity={2.5}
                distance={8}
                castShadow={i === 1}
              />
            </Interactable>
          ))}
        </group>
      ))}

      {/* 6. Interactive 3D Loot Chests with Contact Shadows */}
      <group position={[0, 0, -1.2]}>
        {[-2.2, -0.7, 0.8, 2.3].map((cx, i) => (
          <group key={i} position={[cx, 0, 0]}>
            <Chest3D position={[0, 0, 0]} initiallyOpen={true} />
            <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.7} scale={1.4} />
          </group>
        ))}
      </group>

      {/* 7. Cobwebs in Ceilings */}
      {[
        [-3.8, 3.2, -0.3],
        [3.8, 3.2, 0.2],
        [-0.4, 3.3, 0.2],
      ].map(([wx, wy, wz], i) => (
        <Interactable
          key={i}
          id={`scene04_cobweb_${i}`}
          name="Cave Cobweb"
          category="BLOCK"
          materialType="grass"
          position={[wx, wy, wz]}
          rotation={[0.4, 0.5, 0]}
          onClick={() => {
            sounds.playBlockHit('grass');
            useStore.getState().recordDiscovery(`scene04_cobweb_${i}`, 'BLOCK', 'Clear Sticky Cobweb');
          }}
        >
          <mesh>
            <planeGeometry args={[1.2, 1.2]} />
            <meshStandardMaterial
              color="#EAEAEA"
              transparent
              opacity={0.35}
              roughness={0.9}
              depthWrite={false}
            />
          </mesh>
        </Interactable>
      ))}

      {/* 8. Saksham Player holding lit torch on right */}
      <React.Suspense fallback={null}>
        <group position={[2.2, 0, 0.5]} rotation={[0, -0.35, 0]}>
          <PlayerModel
            pose="idle"
            heldItem="torch"
            scale={0.065}
          />
          <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.7} scale={1.8} />
          <FlickeringLight position={[0.4, 1.1, 0.4]} color="#FFA533" baseIntensity={2.8} distance={7} />
        </group>
      </React.Suspense>
    </group>
  );
};
