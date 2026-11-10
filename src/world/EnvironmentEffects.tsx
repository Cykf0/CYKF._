import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

/**
 * Dynamic Flickering Point Light
 * Simulates real torch / lantern / campfire flicker using layered sine & noise
 */
export const FlickeringLight: React.FC<{
  position: [number, number, number];
  color: string;
  baseIntensity?: number;
  distance?: number;
  flickerSpeed?: number;
  flickerAmount?: number;
  castShadow?: boolean;
}> = ({
  position,
  color,
  baseIntensity = 2.0,
  distance = 8,
  flickerSpeed = 10,
  flickerAmount = 0.25,
  castShadow = false,
}) => {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      const t = state.clock.getElapsedTime() * flickerSpeed;
      const noise =
        Math.sin(t) * 0.5 +
        Math.sin(t * 2.3 + 1.2) * 0.3 +
        Math.sin(t * 5.7 + 2.4) * 0.2;
      lightRef.current.intensity = Math.max(0.1, baseIntensity + noise * flickerAmount);
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={position}
      color={color}
      intensity={baseIntensity}
      distance={distance}
      decay={2}
      castShadow={castShadow}
      shadow-mapSize={[512, 512]}
      shadow-bias={-0.001}
    />
  );
};

/**
 * Cinematic Volumetric Light Shaft (God Ray)
 * Semi-transparent angled beam with subtle pulsing opacity
 */
export const VolumetricLightShaft: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  opacity?: number;
}> = ({
  position,
  rotation = [0.3, 0, -0.2],
  scale = [1, 1, 1],
  color = '#FFF8D6',
  opacity = 0.18,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      const pulse = 1.0 + Math.sin(t * 1.5) * 0.08;
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * pulse;
    }
  });

  return (
    <Interactable
      id="env_light_shaft"
      name="Sunbeam God Ray"
      category="LIGHT_SOURCE"
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={() => {
        sounds.playClick();
        useStore.getState().recordDiscovery('env_light_shaft', 'LIGHT_SOURCE', 'Sunbeam God Ray');
      }}
    >
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 10, 1.5]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Interactable>
  );
};

/**
 * Floating Dust Motes / Spores
 * Gentle Brownian motion particles that catch the light
 */
export const DustMotes: React.FC<{
  count?: number;
  area?: [number, number, number];
  color?: string;
  size?: number;
}> = ({ count = 40, area = [6, 4, 6], color = '#FFE6AA', size = 0.05 }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * area[0];
      pos[i * 3 + 1] = Math.random() * area[1];
      pos[i * 3 + 2] = (Math.random() - 0.5) * area[2];

      ph[i * 3]     = Math.random() * Math.PI * 2;
      ph[i * 3 + 1] = Math.random() * Math.PI * 2;
      ph[i * 3 + 2] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, [count, area]);

  useFrame((state) => {
    if (pointsRef.current) {
      const t = state.clock.getElapsedTime() * 0.4;
      const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        posArray[idx]     += Math.sin(t + phases[idx]) * 0.003;
        posArray[idx + 1] += Math.cos(t * 0.8 + phases[idx + 1]) * 0.002;
        posArray[idx + 2] += Math.sin(t * 1.2 + phases[idx + 2]) * 0.003;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Interactable
      id="env_dust_motes"
      name="Sunlight Pollen Motes"
      category="PARTICLE"
      onClick={() => {
        sounds.playParticleBurst();
        useStore.getState().recordDiscovery('env_dust_motes', 'PARTICLE', 'Pollen Dust Motes');
      }}
    >
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={size}
          color={color}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </Interactable>
  );
};

/**
 * Drifting Voxel Clouds
 * Blocky cloud clusters drifting across the sky
 */
export const DriftingVoxelClouds: React.FC<{
  altitude?: number;
  speed?: number;
  color?: string;
}> = ({ altitude = 14, speed = 0.25, color = '#FFFFFF' }) => {
  const groupRef = useRef<THREE.Group>(null);

  const cloudBlocks = useMemo(() => {
    const blocks: [number, number, number, number, number, number][] = [];
    const clusters = [-15, 0, 15];
    clusters.forEach((cx) => {
      blocks.push([cx, altitude, -8, 8, 1, 4]);
      blocks.push([cx + 2, altitude, -6, 6, 1, 5]);
      blocks.push([cx - 2, altitude, -10, 5, 1, 3]);
    });
    return blocks;
  }, [altitude]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x += speed * delta;
      if (groupRef.current.position.x > 25) {
        groupRef.current.position.x = -25;
      }
    }
  });

  return (
    <Interactable
      id="env_voxel_clouds"
      name="Drifting Voxel Clouds"
      category="SKY"
      onClick={() => {
        sounds.playWobble(520);
        useStore.getState().recordDiscovery('env_voxel_clouds', 'SKY', 'Puffy Voxel Clouds');
      }}
    >
      <group ref={groupRef}>
        {cloudBlocks.map(([x, y, z, w, h, d], i) => (
          <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial
              color={color}
              roughness={0.9}
              transparent
              opacity={0.88}
            />
          </mesh>
        ))}
      </group>
    </Interactable>
  );
};

/**
 * Universal Ground Contact Shadow
 * Soft contact occlusion to ground characters and props
 */
export const CharacterContactShadow: React.FC<{
  position?: [number, number, number];
  opacity?: number;
  scale?: number;
  blur?: number;
}> = ({ position = [0, 0.01, 0], opacity = 0.55, scale = 1.0 }) => {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[scale * 0.9, scale * 0.9]} />
      <meshBasicMaterial
        color="#000000"
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
};
