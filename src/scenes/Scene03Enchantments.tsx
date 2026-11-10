import React from 'react';
import { EnchantingTable3D } from '../world/interactiveObjects';
import { blockMaterials } from '../world/blockMaterials';
import {
  FlickeringLight,
  DustMotes,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';

export const Scene03Enchantments: React.FC = () => {
  return (
    <group>
      {/* 1. Deep Mysterious Dungeon Ambience */}
      <ambientLight intensity={0.4} color="#1E1430" />

      {/* Cool Dungeon Directional Light with soft shadows */}
      <directionalLight
        position={[-4, 8, 5]}
        intensity={1.2}
        color="#A78BFA"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* Moody Purple Dungeon Fog */}
      <fog attach="fog" args={['#10081C', 5, 20]} />

      {/* 2. Floating Magical Dust Motes */}
      <DustMotes count={60} area={[12, 6, 10]} color="#C4B5FD" size={0.06} />

      {/* 3. Stone Brick Floor with PBR Normals & Mortar Depth */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[20, 1, 20]} />
        <primitive object={blockMaterials.stoneBricks} attach="material" />
      </mesh>

      {/* 4. Stronghold Library Back Wall & Shelves */}
      <group position={[0, 0, -3.5]}>
        {/* Stone Brick Wall */}
        <mesh position={[0, 3, 0]} receiveShadow>
          <boxGeometry args={[18, 6, 1]} />
          <primitive object={blockMaterials.stoneBricks} attach="material" />
        </mesh>

        {/* Double-height Bookshelves */}
        {[-4.5, -1.5, 1.5, 4.5].map((bx, i) => (
          <group key={i} position={[bx, 0, 0.4]}>
            <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.8, 2.4, 0.8]} />
              <primitive object={blockMaterials.bookshelf} attach="material" />
            </mesh>
            <mesh position={[0, 3.6, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.8, 2.4, 0.8]} />
              <primitive object={blockMaterials.bookshelf} attach="material" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 5. Stone Pillars Framing the Room */}
      {[-3.8, 3.8].map((px, i) => (
        <group key={i} position={[px, 0, 0.5]}>
          <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.0, 5.0, 1.0]} />
            <primitive object={blockMaterials.stoneBricks} attach="material" />
          </mesh>
          {/* Torch mounted on pillar */}
          <group position={[i === 0 ? 0.55 : -0.55, 2.6, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.1, 0.4, 0.1]} />
              <meshStandardMaterial color="#8B5A2B" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <boxGeometry args={[0.12, 0.15, 0.12]} />
              <meshStandardMaterial
                color="#FFA500"
                emissive="#FF8800"
                emissiveIntensity={3.0}
              />
            </mesh>
            <FlickeringLight position={[0, 0.22, 0]} color="#FFAA33" baseIntensity={2.4} distance={8} />
          </group>
        </group>
      ))}

      {/* 6. Centerpiece: Interactive 3D Enchanting Table */}
      <group position={[1.8, 0, 0]}>
        <EnchantingTable3D position={[0, 0, 0]} />
        {/* Arcane Purple Emissive Glow radiating from the Table & Book */}
        <pointLight
          position={[0, 1.1, 0]}
          color="#A855F7"
          intensity={3.2}
          distance={7}
          decay={2}
        />
        <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.8} scale={2.4} />
      </group>
    </group>
  );
};
