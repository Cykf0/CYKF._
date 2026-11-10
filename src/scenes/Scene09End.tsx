import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PlayerModel } from '../player/PlayerModel';
import { Enderman } from '../world/mobs';
import { EndCrystal3D } from '../world/interactiveObjects';
import { blockMaterials } from '../world/blockMaterials';
import {
  CharacterContactShadow,
  DustMotes,
} from '../world/EnvironmentEffects';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

export const Scene09End: React.FC = () => {
  const voidRef = useRef<THREE.Points>(null);

  // 80 Swirling Purple Void Particles
  const { positions, speeds } = useMemo(() => {
    const count = 80;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
      spd[i]         = 0.015 + Math.random() * 0.02;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame((state) => {
    if (voidRef.current) {
      const t = state.clock.getElapsedTime();
      const pos = voidRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 80; i++) {
        pos[i * 3 + 1] += speeds[i];
        pos[i * 3]     += Math.sin(t * 1.5 + i) * 0.008;
        pos[i * 3 + 2] += Math.cos(t * 1.5 + i) * 0.008;

        if (pos[i * 3 + 1] > 8.5) {
          pos[i * 3 + 1] = 0.1;
          pos[i * 3]     = (Math.random() - 0.5) * 16;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
        }
      }
      voidRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. The End Cosmic Void Atmosphere */}
      <ambientLight intensity={0.25} color="#2A0B3D" />

      {/* Dim Purple Cosmic Fill */}
      <directionalLight position={[0, 8, 4]} intensity={0.8} color="#C084FC" />

      {/* Sharp Purple Rim Light for Enderman and Player Silhouettes */}
      <directionalLight position={[-4, 8, -4]} intensity={2.2} color="#A855F7" />

      {/* Cosmic Void Fog */}
      <fog attach="fog" args={['#080214', 6, 26]} />

      {/* 2. Swirling Purple Void Particles */}
      <Interactable
        id="scene09_void_particles"
        name="Cosmic Void Swirls"
        category="PARTICLE"
        onClick={() => {
          sounds.playParticleBurst();
          useStore.getState().recordDiscovery('scene09_void_particles', 'PARTICLE', 'Catch Cosmic Void Particle');
        }}
      >
        <points ref={voidRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.12}
            color="#D8B4FE"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </Interactable>

      {/* 3. Main End Stone Island with PBR Normals */}
      <Interactable
        id="scene09_end_island"
        name="Central End Stone Island"
        category="BLOCK"
        materialType="stone"
        hardness={500}
        dropItem="end_stone"
      >
        <mesh position={[0, -0.6, 0]} receiveShadow>
          <cylinderGeometry args={[8, 6, 1.4, 16]} />
          <primitive object={blockMaterials.endStone} attach="material" />
        </mesh>
      </Interactable>

      {/* Floating Distant End Stone Asteroid Islands */}
      {[
        [-9, 1, -9, 3.8],
        [9, -1, -11, 4.2],
        [-10, -2, 5, 3.2],
      ].map(([ix, iy, iz, irad], idx) => (
        <Interactable
          key={idx}
          id={`scene09_asteroid_${idx}`}
          name="Floating Void Asteroid"
          category="STRUCTURE"
          materialType="stone"
          position={[ix, iy, iz]}
        >
          <mesh>
            <coneGeometry args={[irad, 4.0, 8]} />
            <primitive object={blockMaterials.endStone} attach="material" />
          </mesh>
        </Interactable>
      ))}

      {/* 4. Towering Obsidian Pillars with End Crystals and Blinding Beams */}
      <group position={[3.8, 0, -3]}>
        <Interactable
          id="scene09_obsidian_pillar_right"
          name="Towering Obsidian Monolith"
          category="BLOCK"
          materialType="stone"
          hardness={1000}
          dropItem="obsidian"
        >
          <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 9, 1.8]} />
            <primitive object={blockMaterials.obsidian} attach="material" />
          </mesh>
        </Interactable>
        <EndCrystal3D position={[0, 9, 0]} />
        <pointLight position={[0, 9.2, 0]} color="#C084FC" intensity={3.5} distance={12} />
      </group>

      <group position={[-4.5, 0, -4]}>
        <Interactable
          id="scene09_obsidian_pillar_left"
          name="Ancient Obsidian Pillar"
          category="BLOCK"
          materialType="stone"
          hardness={1000}
          dropItem="obsidian"
        >
          <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 7, 1.6]} />
            <primitive object={blockMaterials.obsidian} attach="material" />
          </mesh>
        </Interactable>
        <EndCrystal3D position={[0, 7, 0]} />
        <pointLight position={[0, 7.2, 0]} color="#C084FC" intensity={3.5} distance={12} />
      </group>

      {/* 5. Activated End Portal Ring with Cosmic Star Center */}
      <group position={[1.8, 0.05, 1.2]} rotation={[-0.1, -0.4, 0]}>
        <Interactable
          id="scene09_end_portal_frame"
          name="End Portal Frame"
          category="STRUCTURE"
          materialType="stone"
        >
          <mesh receiveShadow>
            <ringGeometry args={[1.2, 2.0, 16]} />
            <meshStandardMaterial color="#0A3C2F" roughness={0.6} />
          </mesh>
        </Interactable>

        <Interactable
          id="scene09_portal_horizon"
          name="End Void Gateway"
          category="PROP"
          onClick={() => {
            sounds.playPortalWarp();
            useStore.getState().recordDiscovery('scene09_portal_warp', 'PROP', 'Enter End Gateway');
          }}
        >
          <mesh position={[0, 0, -0.02]}>
            <circleGeometry args={[1.2, 16]} />
            <meshBasicMaterial color="#010609" />
          </mesh>
        </Interactable>
        <pointLight color="#00FFCC" intensity={2.5} distance={6} />
      </group>

      {/* 6. Wandering Endermen with Soft Contact Shadows */}
      <group position={[-2.8, 0, -1.8]} rotation={[0, 0.4, 0]}>
        <Enderman position={[0, 0, 0]} />
        <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.7} scale={1.4} />
      </group>
      <group position={[4.2, 0, 1.5]} rotation={[0, -0.6, 0]}>
        <Enderman position={[0, 0, 0]} />
        <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.7} scale={1.4} />
      </group>

      {/* 7. Saksham Player Standing at End Portal */}
      <React.Suspense fallback={null}>
        <group position={[1.0, 0, 2.8]} rotation={[0, Math.PI - 0.25, 0]}>
          <PlayerModel
            pose="look-back"
            heldItem="ender-pearl"
            scale={0.065}
          />
          <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.7} scale={1.8} />
        </group>
      </React.Suspense>
    </group>
  );
};
