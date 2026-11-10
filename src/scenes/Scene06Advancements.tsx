import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PlayerModel } from '../player/PlayerModel';
import { blockMaterials } from '../world/blockMaterials';
import {
  FlickeringLight,
  CharacterContactShadow,
  DustMotes,
} from '../world/EnvironmentEffects';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

export const Scene06Advancements: React.FC = () => {
  const soulRef = useRef<THREE.Points>(null);

  // 70 Rising Sculk Soul Particles
  const { positions, speeds } = useMemo(() => {
    const count = 70;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      spd[i]         = 0.015 + Math.random() * 0.02;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame((state) => {
    if (soulRef.current) {
      const t = state.clock.getElapsedTime();
      const pos = soulRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 70; i++) {
        pos[i * 3 + 1] += speeds[i];
        pos[i * 3]     += Math.sin(t * 1.5 + i) * 0.005;
        pos[i * 3 + 2] += Math.cos(t * 1.5 + i) * 0.005;

        if (pos[i * 3 + 1] > 6.5) {
          pos[i * 3 + 1] = 0.1;
          pos[i * 3]     = (Math.random() - 0.5) * 14;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
        }
      }
      soulRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Oppressive Pitch-Black Cavern Lighting */}
      <ambientLight intensity={0.15} color="#040D14" />

      {/* Deep Cold Blue Directional Light */}
      <directionalLight position={[0, 6, 4]} intensity={0.5} color="#0E364A" />

      {/* Cold Cyan Rim Light for Player & Sculk Pillars */}
      <directionalLight position={[-3, 4, -4]} intensity={1.6} color="#00E5FF" />

      {/* Heavy Pitch-Black Fog */}
      <fog attach="fog" args={['#02060A', 4, 18]} />

      {/* 2. Floating Cyan Soul Particles */}
      <Interactable
        id="scene06_soul_particles"
        name="Escaped Sculk Souls"
        category="PARTICLE"
        onClick={() => {
          sounds.playParticleBurst();
          useStore.getState().recordDiscovery('scene06_soul_particles', 'PARTICLE', 'Soul Particle Whisper');
        }}
      >
        <points ref={soulRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            color="#00F3FF"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </Interactable>

      {/* Ambient Spore Motes */}
      <DustMotes count={45} area={[12, 5, 12]} color="#00B4D8" size={0.05} />

      {/* 3. Ancient City Sculk Floor with Glowing Cyan Tendrils */}
      <Interactable
        id="scene06_sculk_floor"
        name="Vibrating Sculk Tendril Floor"
        category="BLOCK"
        materialType="stone"
        hardness={400}
        dropItem="echo_shard"
        onClick={() => {
          sounds.playWobble(220);
          useStore.getState().recordDiscovery('scene06_sculk_floor', 'BLOCK', 'Disturb Sculk Bed');
        }}
      >
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <boxGeometry args={[20, 1, 20]} />
          <primitive object={blockMaterials.sculk} attach="material" />
        </mesh>
      </Interactable>

      {/* 4. Deepslate Sculk Catalyst Pillars */}
      {[-3.6, 3.6].map((cx, i) => (
        <group key={i} position={[cx, 0, -2]}>
          <Interactable
            id={`scene06_catalyst_pillar_${i}`}
            name="Deepslate Ancient Pillar"
            category="STRUCTURE"
            materialType="stone"
          >
            <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.2, 3.6, 1.2]} />
              <primitive object={blockMaterials.sculk} attach="material" />
            </mesh>
          </Interactable>

          {/* Glowing Catalyst Heart */}
          <Interactable
            id={`scene06_catalyst_heart_${i}`}
            name="Sculk Catalyst Core"
            category="BLOCK"
            materialType="stone"
            position={[0, 3.9, 0]}
            onClick={() => {
              sounds.playWobble(330);
              useStore.getState().recordDiscovery(`scene06_catalyst_${i}`, 'BLOCK', 'Sculk Catalyst Core');
            }}
          >
            <mesh castShadow>
              <boxGeometry args={[0.9, 0.6, 0.9]} />
              <meshStandardMaterial
                color="#00E5FF"
                emissive="#00E5FF"
                emissiveIntensity={3.5}
                roughness={0.2}
              />
            </mesh>
            <pointLight color="#00E5FF" intensity={2.8} distance={8} decay={2} />
          </Interactable>
          <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.7} scale={1.8} />
        </group>
      ))}

      {/* 5. Center Hanging Soul Lantern */}
      <group position={[0, 4.2, 0]}>
        <Interactable
          id="scene06_soul_lantern"
          name="Hanging Soul Lantern"
          category="LIGHT_SOURCE"
          onClick={() => {
            sounds.playClick();
            useStore.getState().recordDiscovery('scene06_soul_lantern', 'LIGHT_SOURCE', 'Hanging Soul Lantern');
          }}
        >
          {/* Iron Chain */}
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.4, 6]} />
            <meshStandardMaterial color="#222222" metalness={0.9} />
          </mesh>
          {/* Lantern Casing */}
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.7, 0.5]} />
            <meshStandardMaterial color="#1A2830" roughness={0.7} />
          </mesh>
          {/* Glowing Soul Core */}
          <mesh>
            <boxGeometry args={[0.3, 0.45, 0.3]} />
            <meshStandardMaterial
              color="#00F0FF"
              emissive="#00F0FF"
              emissiveIntensity={3.5}
              roughness={0.1}
            />
          </mesh>
          <FlickeringLight
            position={[0, 0, 0]}
            color="#00E5FF"
            baseIntensity={3.2}
            distance={10}
            flickerSpeed={8}
          />
        </Interactable>
      </group>

      {/* 6. Saksham Player Standing in the Deep Dark holding Soul Lantern */}
      <React.Suspense fallback={null}>
        <group position={[1.8, 0, 0.4]} rotation={[0, -0.35, 0]}>
          <PlayerModel
            pose="idle"
            heldItem="soul-lantern"
            scale={0.065}
          />
          <CharacterContactShadow position={[0, 0.01, 0]} opacity={0.8} scale={1.8} />
          <pointLight position={[0.4, 1.1, 0.4]} color="#00E5FF" intensity={2.4} distance={6} />
        </group>
      </React.Suspense>
    </group>
  );
};
