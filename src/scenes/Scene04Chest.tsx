import React from 'react';
import { PlayerModel } from '../player/PlayerModel';
import { Chest3D } from '../world/interactiveObjects';
import { blockMaterials } from '../world/blockMaterials';
import {
  FlickeringLight,
  DustMotes,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';

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
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[20, 1, 20]} />
        <primitive object={blockMaterials.stoneBricks} attach="material" />
      </mesh>

      {/* 4. Cavern Wall with Embedded PBR Ore Veins */}
      <group position={[0, 0, -3.2]}>
        <mesh position={[0, 2.5, 0]} receiveShadow>
          <boxGeometry args={[18, 6, 1]} />
          <primitive object={blockMaterials.stoneBricks} attach="material" />
        </mesh>

        {/* Embedded Ore Blocks with High Gloss Gems & Emissive Glow */}
        {[
          { name: 'diamond1', x: -3.5, y: 2.5, z: 0.45, col: '#55FFFF', glow: '#00E5FF' },
          { name: 'gold', x: -1.5, y: 3.2, z: 0.45, col: '#FFDD00', glow: '#FFAA00' },
          { name: 'redstone', x: 0.8, y: 2.0, z: 0.45, col: '#FF2222', glow: '#CC0000' },
          { name: 'emerald', x: 3.2, y: 3.0, z: 0.45, col: '#00FF66', glow: '#00DD44' },
          { name: 'diamond2', x: 4.5, y: 1.5, z: 0.45, col: '#55FFFF', glow: '#00E5FF' },
        ].map((ore, i) => (
          <group key={i} position={[ore.x, ore.y, ore.z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.2, 1.2, 0.2]} />
              <primitive
                object={blockMaterials.getOreMaterial(ore.name, ore.col, ore.glow)}
                attach="material"
              />
            </mesh>
            <pointLight color={ore.glow} intensity={1.2} distance={3.5} decay={2} />
          </group>
        ))}
      </group>

      {/* 5. Wooden Mineshaft Support Arch Beams */}
      {[-4, 0, 4].map((ax, i) => (
        <group key={i} position={[ax, 0, 0]}>
          {/* Left Post */}
          <mesh position={[-2.8, 1.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 3.6, 0.5]} />
            <primitive object={blockMaterials.oakPlanks} attach="material" />
          </mesh>
          {/* Right Post */}
          <mesh position={[2.8, 1.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 3.6, 0.5]} />
            <primitive object={blockMaterials.oakPlanks} attach="material" />
          </mesh>
          {/* Overhead Beam */}
          <mesh position={[0, 3.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[6.1, 0.5, 0.5]} />
            <primitive object={blockMaterials.oakPlanks} attach="material" />
          </mesh>

          {/* Wall Torches with Dynamic Flickering Flame & Contact Shadow */}
          {[-2.5, 2.5].map((tx, idx) => (
            <group key={idx} position={[tx, 2.4, 0]}>
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
            </group>
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
        <mesh key={i} position={[wx, wy, wz]} rotation={[0.4, 0.5, 0]}>
          <planeGeometry args={[1.2, 1.2]} />
          <meshStandardMaterial
            color="#EAEAEA"
            transparent
            opacity={0.35}
            roughness={0.9}
            depthWrite={false}
          />
        </mesh>
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
          {/* Torch Light spilling from held torch */}
          <FlickeringLight position={[0.4, 1.1, 0.4]} color="#FFA533" baseIntensity={2.8} distance={7} />
        </group>
      </React.Suspense>
    </group>
  );
};
