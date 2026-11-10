import React from 'react';
import { PlayerModel } from '../player/PlayerModel';
import { Villager } from '../world/mobs';
import { blockTextures } from '../world/blockTextures';

export const Scene07Trades: React.FC = () => {
  return (
    <group>
      {/* Warm Tavern Shop Background */}
      <color attach="background" args={['#26180C']} />

      {/* Warm Tavern Shop Lighting */}
      <ambientLight intensity={0.9} color="#FFE6CC" />
      <directionalLight
        position={[-6, 6, 6]}
        intensity={2.0}
        color="#FFAA44"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Village Fog */}
      <fog attach="fog" args={['#FFEACC', 8, 24]} />

      {/* Wood Plank Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[18, 1, 18]} />
        <meshStandardMaterial map={blockTextures.oakPlanks} roughness={0.8} />
      </mesh>

      {/* Cobblestone & Wood Back Wall */}
      <group position={[0, 0, -3.2]}>
        <mesh position={[0, 2.5, 0]} receiveShadow>
          <boxGeometry args={[16, 5, 1]} />
          <meshStandardMaterial map={blockTextures.stoneBricks} roughness={0.9} />
        </mesh>

        {/* 3 Item Frames on Wall */}
        {[-1.5, 0.5, 2.5].map((fx, i) => (
          <group key={i} position={[fx, 3.2, 0.52]}>
            {/* Wooden Frame */}
            <mesh>
              <boxGeometry args={[1.2, 1.2, 0.1]} />
              <meshStandardMaterial color="#8B5A2B" roughness={0.8} />
            </mesh>
            {/* Displayed Item (Emerald / Diamond / Book) */}
            <mesh position={[0, 0, 0.1]}>
              <boxGeometry args={[0.6, 0.6, 0.1]} />
              <meshStandardMaterial
                color={i === 0 ? '#00FF66' : i === 1 ? '#55FFFF' : '#AA00AA'}
                emissive={i === 0 ? '#009933' : i === 1 ? '#008888' : '#550055'}
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Long Wooden Shop Counter */}
      <group position={[1.2, 0, -0.8]}>
        {/* Main Counter Table */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.5, 1.2, 1.4]} />
          <meshStandardMaterial map={blockTextures.oakPlanks} roughness={0.8} />
        </mesh>

        {/* Counter Wooden Trapdoor Paneling */}
        {[-2.0, -0.7, 0.6, 1.9].map((tx, idx) => (
          <mesh key={idx} position={[tx, 0.6, 0.72]}>
            <boxGeometry args={[1.0, 1.0, 0.06]} />
            <meshStandardMaterial color="#5C3B1E" roughness={0.9} />
          </mesh>
        ))}

        {/* Wooden Lectern / Cashbox on Counter */}
        <mesh position={[-1.2, 1.35, 0]} castShadow>
          <boxGeometry args={[0.9, 0.3, 0.9]} />
          <meshStandardMaterial color="#A06935" roughness={0.8} />
        </mesh>

        {/* Open Chest with Emeralds on Counter */}
        <group position={[0.8, 1.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.0, 0.5, 0.8]} />
            <meshStandardMaterial color="#8B5A2B" roughness={0.8} />
          </mesh>
          {/* Emerald Voxels inside */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.7, 0.2, 0.6]} />
            <meshStandardMaterial color="#00FF66" emissive="#00CC44" emissiveIntensity={0.4} />
          </mesh>
        </group>

        {/* Potted Sapling */}
        <group position={[2.1, 1.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#B85D38" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.4, 0.5, 0.4]} />
            <meshStandardMaterial color="#339933" />
          </mesh>
        </group>
      </group>

      {/* Hanging Warm Lantern */}
      <group position={[2.0, 3.8, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1, 6]} />
          <meshStandardMaterial color="#222222" metalness={0.9} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.5, 0.7, 0.5]} />
          <meshBasicMaterial color="#FFAA33" />
        </mesh>
        <pointLight color="#FFAA33" intensity={3.0} distance={10} decay={2} />
      </group>

      {/* 3D Villager NPC behind counter */}
      <Villager position={[1.4, 0, -1.8]} rotation={[0, -0.2, 0]} />

      {/* Player standing across the counter */}
      <group position={[-1.2, 0, 0.6]} rotation={[0, 0.6, 0]}>
        <PlayerModel
          pose="idle"
          heldItem="emerald"
          scale={0.065}
        />
      </group>
    </group>
  );
};
