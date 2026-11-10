import React from 'react';
import { PlayerModel } from '../player/PlayerModel';
import { Enderman } from '../world/mobs';
import { EndCrystal3D } from '../world/interactiveObjects';
import { blockTextures } from '../world/blockTextures';

export const Scene09End: React.FC = () => {
  return (
    <group>
      {/* The End Cosmic Void Background */}
      <color attach="background" args={['#080214']} />

      {/* Dark Cosmic Void Lighting */}
      <ambientLight intensity={0.3} color="#2A0B3D" />
      <directionalLight position={[0, 8, 4]} intensity={0.6} color="#B388FF" />

      {/* The End Purple Void Fog */}
      <fog attach="fog" args={['#0A0512', 6, 24]} />

      {/* Main End Stone Island */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[7, 5, 1.2, 12]} />
        <meshStandardMaterial map={blockTextures.endStone} roughness={0.9} />
      </mesh>

      {/* Floating Distant End Stone Islands */}
      {[
        [-8, 1, -8, 3.5],
        [8, -1, -10, 4.0],
        [-9, -2, 4, 3.0],
      ].map(([ix, iy, iz, irad], idx) => (
        <mesh key={idx} position={[ix, iy, iz]}>
          <coneGeometry args={[irad, 3.5, 8]} />
          <meshStandardMaterial map={blockTextures.endStone} roughness={0.9} />
        </mesh>
      ))}

      {/* Towering Obsidian Pillar with End Crystal and Purple Beacon */}
      <group position={[3.8, 0, -3]}>
        {/* Obsidian Pillar Column */}
        <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 9, 1.8]} />
          <meshStandardMaterial map={blockTextures.obsidian} roughness={0.7} />
        </mesh>
        {/* End Crystal on Top */}
        <EndCrystal3D position={[0, 9, 0]} />
      </group>

      <group position={[-4.5, 0, -4]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 7, 1.6]} />
          <meshStandardMaterial map={blockTextures.obsidian} roughness={0.7} />
        </mesh>
        <EndCrystal3D position={[0, 7, 0]} />
      </group>

      {/* Activated End Portal Ring */}
      <group position={[1.8, 0.05, 1.2]} rotation={[-0.1, -0.4, 0]}>
        {/* End Portal Frame Ring */}
        <mesh receiveShadow>
          <ringGeometry args={[1.2, 2.0, 16]} />
          <meshStandardMaterial color="#0A3C2F" roughness={0.7} />
        </mesh>
        {/* Cosmic Starry Void Portal Center */}
        <mesh position={[0, 0, -0.02]}>
          <circleGeometry args={[1.2, 16]} />
          <meshBasicMaterial color="#020B10" />
        </mesh>
        <pointLight color="#00FFCC" intensity={1.5} distance={5} />
      </group>

      {/* Wandering Endermen */}
      <Enderman position={[-2.8, 0, -1.8]} rotation={[0, 0.4, 0]} />
      <Enderman position={[4.2, 0, 1.5]} rotation={[0, -0.6, 0]} />

      {/* Player standing center, viewed from behind looking towards portal & pillars */}
      <group position={[1.0, 0, 2.8]} rotation={[0, Math.PI - 0.25, 0]}>
        <PlayerModel
          pose="look-back"
          heldItem="ender-pearl"
          scale={0.065}
        />
      </group>
    </group>
  );
};
