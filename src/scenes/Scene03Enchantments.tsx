import React from 'react';
import { EnchantingTable3D } from '../world/interactiveObjects';
import { blockTextures } from '../world/blockTextures';

export const Scene03Enchantments: React.FC = () => {
  return (
    <group>
      {/* Stronghold Dungeon Background */}
      <color attach="background" args={['#160C24']} />

      {/* Dim Dungeon Lighting */}
      <ambientLight intensity={0.5} color="#2A1B3D" />
      <directionalLight position={[0, 4, 3]} intensity={0.8} color="#A388D4" />

      {/* Stronghold Fog */}
      <fog attach="fog" args={['#11091C', 4, 18]} />

      {/* Stone Brick Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[18, 1, 18]} />
        <meshStandardMaterial map={blockTextures.stoneBricks} roughness={0.9} />
      </mesh>

      {/* Back Wall with Bookshelves */}
      <group position={[0, 0, -3.5]}>
        {/* Stone Brick Backing */}
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[16, 6, 1]} />
          <meshStandardMaterial map={blockTextures.stoneBricks} roughness={0.9} />
        </mesh>
        {/* Double-height Bookshelves */}
        {[-4.5, -1.5, 1.5, 4.5].map((bx, i) => (
          <group key={i} position={[bx, 0, 0.4]}>
            <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.8, 2.4, 0.8]} />
              <meshStandardMaterial map={blockTextures.bookshelf} roughness={0.8} />
            </mesh>
            <mesh position={[0, 3.6, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.8, 2.4, 0.8]} />
              <meshStandardMaterial map={blockTextures.bookshelf} roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Hanging Sea Lanterns on Ceiling */}
      {[-2.5, 2.5].map((lx, i) => (
        <group key={i} position={[lx, 4.2, 0]}>
          {/* Iron Chain */}
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
            <meshStandardMaterial color="#333333" metalness={0.9} />
          </mesh>
          {/* Cyan Sea Lantern Cube */}
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshBasicMaterial color="#55FFFF" />
          </mesh>
          <pointLight color="#00E5FF" intensity={2.5} distance={10} decay={2} />
        </group>
      ))}

      {/* Centerpiece: 3D Enchanting Table */}
      <EnchantingTable3D position={[1.8, 0, 0]} />
    </group>
  );
};
