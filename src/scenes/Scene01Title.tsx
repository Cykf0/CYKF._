import React from 'react';
import { PlayerModel } from '../player/PlayerModel';
import { Sheep } from '../world/mobs';
import { blockTextures } from '../world/blockTextures';

export const Scene01Title: React.FC = () => {
  return (
    <group>
      {/* Warm Sunrise Lighting */}
      <ambientLight intensity={1.1} color="#FFF0DC" />
      <directionalLight
        position={[-12, 6, 8]}
        intensity={2.8}
        color="#FFA534"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[8, 10, -5]} intensity={0.6} color="#87CEEB" />

      {/* Morning Fog */}
      <fog attach="fog" args={['#FFE4C4', 8, 30]} />

      {/* Terrain: Rolling Grass Blocks */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[20, 1, 20]} />
        <meshStandardMaterial map={blockTextures.grassTop} roughness={0.9} />
      </mesh>

      {/* Village Cottage on Left */}
      <group position={[-4, 0, -2]}>
        {/* Cobblestone Foundation */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 1, 4.5]} />
          <meshStandardMaterial map={blockTextures.stoneBricks} roughness={0.9} />
        </mesh>
        {/* Wood Plank Walls */}
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 2, 4.2]} />
          <meshStandardMaterial map={blockTextures.oakPlanks} roughness={0.8} />
        </mesh>
        {/* Wood Door */}
        <mesh position={[0, 1.4, 2.12]}>
          <planeGeometry args={[0.9, 1.8]} />
          <meshStandardMaterial color="#4A2E12" roughness={0.9} />
        </mesh>
        {/* Sloped Roof */}
        <mesh position={[0, 3.4, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[3.4, 1.6, 4]} />
          <meshStandardMaterial color="#5C3B1E" roughness={0.9} />
        </mesh>
      </group>

      {/* Wheat Farm Garden */}
      <group position={[-2, 0.05, 3]}>
        <mesh receiveShadow>
          <boxGeometry args={[3.5, 0.1, 2.5]} />
          <meshStandardMaterial color="#866043" roughness={0.9} />
        </mesh>
        {/* Wheat stalks */}
        {[-1.2, -0.4, 0.4, 1.2].map((wx, i) => (
          <mesh key={i} position={[wx, 0.35, 0]} castShadow>
            <boxGeometry args={[0.3, 0.7, 1.8]} />
            <meshStandardMaterial color="#D4AF37" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Wildflowers */}
      {[
        [1.2, 0.25, 2.0, '#FF3333'], // Red Poppy
        [2.0, 0.25, 1.5, '#FFEE33'], // Yellow Dandelion
        [0.5, 0.25, 3.2, '#FFEE33'],
        [-0.8, 0.25, 1.2, '#FF3333'],
      ].map(([fx, fy, fz, fcol], idx) => (
        <group key={idx} position={[fx as number, fy as number, fz as number]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.15, 0.4, 0.15]} />
            <meshBasicMaterial color="#339933" />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.3, 0.25, 0.3]} />
            <meshBasicMaterial color={fcol as string} />
          </mesh>
        </group>
      ))}

      {/* Wandering Sheep */}
      <Sheep position={[-1.5, 0, 1.2]} rotation={[0, 0.8, 0]} />

      {/* Saksham Player on Right waving with Diamond Pickaxe */}
      <React.Suspense fallback={null}>
        <group position={[2.2, 0, 0.8]} rotation={[0, -0.45, 0]}>
          <PlayerModel
            pose="waving"
            heldItem="diamond-pickaxe"
            scale={0.065}
          />
        </group>
      </React.Suspense>
    </group>
  );
};
