import React from 'react';
import { Axolotl } from '../world/mobs';
import { blockTextures } from '../world/blockTextures';

export const Scene08Connect: React.FC = () => {
  return (
    <group>
      {/* Lush Cave Deep Moss Background */}
      <color attach="background" args={['#0C2417']} />

      {/* Warm Ambient Lush Lighting */}
      <ambientLight intensity={0.9} color="#D4EDDA" />
      <directionalLight
        position={[2, 10, -2]}
        intensity={2.5}
        color="#FFF9E6"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Lush Cave Fog */}
      <fog attach="fog" args={['#0F2417', 5, 22]} />

      {/* Moss & Clay Cave Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[20, 1, 20]} />
        <meshStandardMaterial map={blockTextures.grassTop} roughness={0.8} />
      </mesh>

      {/* Cave Sunbeam Shafts streaming through ceiling */}
      <mesh position={[2.2, 5, -1]} rotation={[0.2, 0, -0.15]}>
        <cylinderGeometry args={[0.8, 2.5, 12, 16]} />
        <meshBasicMaterial color="#FFFEEA" transparent opacity={0.15} depthWrite={false} />
      </mesh>

      {/* Underground Water Pond on Right */}
      <group position={[2.4, 0.05, 0]}>
        {/* Water Pool Basin */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[6.5, 0.1, 5.5]} />
          <meshStandardMaterial
            color="#00A896"
            roughness={0.1}
            metalness={0.6}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Lily Pads */}
        {[
          [-1.5, 0.08, -1.0],
          [1.8, 0.08, 1.2],
          [-1.0, 0.08, 1.5],
        ].map(([lx, ly, lz], i) => (
          <mesh key={i} position={[lx, ly, lz]}>
            <cylinderGeometry args={[0.45, 0.45, 0.02, 8]} />
            <meshStandardMaterial color="#2D6A4F" roughness={0.8} />
          </mesh>
        ))}

        {/* Swimming Pink Axolotl */}
        <Axolotl position={[0, 0.12, 0]} />
      </group>

      {/* Hanging Vines with Glow Berries */}
      {[-3, 0, 3].map((vx, i) => (
        <group key={i} position={[vx, 4.0, -2.5]}>
          <mesh position={[0, -1.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 2.4, 6]} />
            <meshStandardMaterial color="#40916C" roughness={0.9} />
          </mesh>
          {/* Glowing Berries */}
          <mesh position={[0, -2.2, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshBasicMaterial color="#FFB703" />
          </mesh>
          <pointLight color="#FFB703" intensity={1.5} distance={5} position={[0, -2.2, 0]} />
        </group>
      ))}
    </group>
  );
};
