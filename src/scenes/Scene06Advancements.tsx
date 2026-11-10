import React from 'react';
import { PlayerModel } from '../player/PlayerModel';
import { blockTextures } from '../world/blockTextures';

export const Scene06Advancements: React.FC = () => {
  return (
    <group>
      {/* Deep Dark Void Background */}
      <color attach="background" args={['#040A10']} />

      {/* Dark Ambient Cave Lighting */}
      <ambientLight intensity={0.25} color="#04121A" />
      <directionalLight position={[0, 5, 2]} intensity={0.4} color="#005B66" />

      {/* Deep Dark Sculk Fog */}
      <fog attach="fog" args={['#04090E', 3, 16]} />

      {/* Deepslate Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[18, 1, 18]} />
        <meshStandardMaterial map={blockTextures.sculk} roughness={0.9} />
      </mesh>

      {/* Ancient City Deepslate Ruins & Pillars */}
      {[-4, -1, 3].map((px, i) => (
        <group key={i} position={[px, 0, -3]}>
          <mesh position={[0, 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 4, 1.6]} />
            <meshStandardMaterial map={blockTextures.sculk} roughness={0.9} />
          </mesh>
          {/* Glowing Sculk Sensor / Vein on top */}
          <mesh position={[0, 4.1, 0]}>
            <boxGeometry args={[1.2, 0.2, 1.2]} />
            <meshBasicMaterial color="#00E5FF" />
          </mesh>
          <pointLight color="#00E5FF" intensity={1.8} distance={6} position={[0, 4.5, 0]} />
        </group>
      ))}

      {/* Hanging Soul Lanterns */}
      {[-2.5, 1.5].map((sx, i) => (
        <group key={i} position={[sx, 3.5, 0]}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
            <meshStandardMaterial color="#222226" metalness={0.9} />
          </mesh>
          {/* Soul Lantern Cube */}
          <mesh>
            <boxGeometry args={[0.6, 0.8, 0.6]} />
            <meshBasicMaterial color="#00E5FF" />
          </mesh>
          <pointLight color="#00E5FF" intensity={2.5} distance={8} decay={2} />
        </group>
      ))}

      {/* Player on Ledge holding soul lantern */}
      <group position={[-1.6, 0, 0.5]} rotation={[0, 0.35, 0]}>
        <PlayerModel
          pose="idle"
          heldItem="soul-lantern"
          scale={0.065}
        />
      </group>
    </group>
  );
};
