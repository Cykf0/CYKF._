import React from 'react';
import { PlayerModel } from '../player/PlayerModel';
import { Chest3D } from '../world/interactiveObjects';
import { blockTextures } from '../world/blockTextures';

export const Scene04Chest: React.FC = () => {
  return (
    <group>
      {/* Dark Mineshaft Cave Background */}
      <color attach="background" args={['#120B06']} />

      {/* Dark Cave Lighting */}
      <ambientLight intensity={0.4} color="#2A1B0E" />

      {/* Mineshaft Fog */}
      <fog attach="fog" args={['#140E08', 5, 20]} />

      {/* Stone & Gravel Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[18, 1, 18]} />
        <meshStandardMaterial map={blockTextures.stoneBricks} roughness={0.9} />
      </mesh>

      {/* Back Wall with Embedded Ore Veins */}
      <group position={[0, 0, -3.2]}>
        <mesh position={[0, 2.5, 0]} receiveShadow>
          <boxGeometry args={[16, 5, 1]} />
          <meshStandardMaterial map={blockTextures.stoneBricks} roughness={0.9} />
        </mesh>

        {/* Embedded Ore Blocks */}
        {[
          [-3.5, 2.5, 0.45, '#55FFFF', '#00E5FF'], // Diamond
          [-1.5, 3.2, 0.45, '#FFDD00', '#FFAA00'], // Gold
          [0.8, 2.0, 0.45, '#FF2222', '#CC0000'],  // Redstone
          [3.2, 3.0, 0.45, '#00FF66', '#00DD44'],  // Emerald
          [4.5, 1.5, 0.45, '#55FFFF', '#00E5FF'],  // Diamond
        ].map(([ox, oy, oz, col, glow], i) => (
          <group key={i} position={[ox as number, oy as number, oz as number]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.2, 1.2, 0.2]} />
              <meshStandardMaterial map={blockTextures.getOreTexture(col as string, glow as string)} roughness={0.8} />
            </mesh>
            <pointLight color={glow as string} intensity={0.8} distance={3} />
          </group>
        ))}
      </group>

      {/* Wooden Mineshaft Arch Support Beams */}
      {[-4, 0, 4].map((ax, i) => (
        <group key={i} position={[ax, 0, 0]}>
          {/* Left post */}
          <mesh position={[-2.8, 1.8, 0]} castShadow>
            <boxGeometry args={[0.5, 3.6, 0.5]} />
            <meshStandardMaterial map={blockTextures.oakPlanks} roughness={0.8} />
          </mesh>
          {/* Right post */}
          <mesh position={[2.8, 1.8, 0]} castShadow>
            <boxGeometry args={[0.5, 3.6, 0.5]} />
            <meshStandardMaterial map={blockTextures.oakPlanks} roughness={0.8} />
          </mesh>
          {/* Top beam */}
          <mesh position={[0, 3.6, 0]} castShadow>
            <boxGeometry args={[6.1, 0.5, 0.5]} />
            <meshStandardMaterial map={blockTextures.oakPlanks} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Row of 4 Interactive 3D Chests */}
      <group position={[0, 0, -1.2]}>
        {[-2.2, -0.7, 0.8, 2.3].map((cx, i) => (
          <Chest3D
            key={i}
            position={[cx, 0, 0]}
            initiallyOpen={true}
          />
        ))}
      </group>

      {/* Minecart Rails on Floor */}
      <group position={[-2.5, 0.02, 1.5]} rotation={[0, 0.1, 0]}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <mesh key={idx} position={[0, 0, (idx - 4) * 0.8]} receiveShadow>
            <boxGeometry args={[1.4, 0.04, 0.15]} />
            <meshStandardMaterial color="#553A1B" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Player on Right holding lit torch */}
      <group position={[2.2, 0, 0.5]} rotation={[0, -0.35, 0]}>
        <PlayerModel
          pose="idle"
          heldItem="torch"
          scale={0.065}
        />
      </group>
    </group>
  );
};
