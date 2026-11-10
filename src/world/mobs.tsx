import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { sounds } from '../audio/soundManager';

/**
 * 3D Low-Poly Minecraft Sheep
 */
export const Sheep: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  woolColor?: string;
}> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  woolColor = '#EAEAEA',
}) => {
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (headRef.current) {
      // Gentle grazing bob
      headRef.current.rotation.x = 0.2 + Math.sin(t * 1.5) * 0.1;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={0.4}>
      {/* Wool Body */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1.8, 1.4, 2.2]} />
        <meshStandardMaterial color={woolColor} roughness={0.9} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 1.5, 1.3]}>
        {/* Head wool back */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[1.0, 1.0, 1.0]} />
          <meshStandardMaterial color={woolColor} roughness={0.9} />
        </mesh>
        {/* Pink/Tan Face */}
        <mesh position={[0, 0, 0.35]}>
          <boxGeometry args={[0.8, 0.7, 0.7]} />
          <meshStandardMaterial color="#E5C7B0" roughness={0.8} />
        </mesh>
        {/* Black eyes */}
        <mesh position={[-0.32, 0.1, 0.71]}>
          <planeGeometry args={[0.15, 0.15]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        <mesh position={[0.32, 0.1, 0.71]}>
          <planeGeometry args={[0.15, 0.15]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
      </group>

      {/* 4 Legs */}
      {[
        [-0.6, 0.45, -0.7],
        [0.6, 0.45, -0.7],
        [-0.6, 0.45, 0.7],
        [0.6, 0.45, 0.7],
      ].map(([lx, ly, lz], i) => (
        <mesh key={i} position={[lx, ly, lz]} castShadow>
          <boxGeometry args={[0.4, 0.9, 0.4]} />
          <meshStandardMaterial color="#E5C7B0" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

/**
 * 3D Minecraft Villager (Trades Scene)
 */
export const Villager: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  onInteract?: () => void;
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0], onInteract }) => {
  const headRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (headRef.current) {
      const mouse = state.pointer;
      const targetYaw = THREE.MathUtils.clamp(-mouse.x * 0.6, -0.5, 0.5);
      const targetPitch = THREE.MathUtils.clamp(-mouse.y * 0.4, -0.3, 0.3);
      headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, targetYaw, 6, delta);
      headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, targetPitch, 6, delta);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    sounds.playVillagerHmm();
    if (onInteract) onInteract();
  };

  return (
    <group
      position={position}
      rotation={rotation}
      scale={0.065}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      {/* Head Pivot at y=24 */}
      <group ref={headRef} position={[0, 24, 0]}>
        {/* Head */}
        <mesh position={[0, 5, 0]} castShadow>
          <boxGeometry args={[8, 10, 8]} />
          <meshStandardMaterial color="#C8966E" roughness={0.8} />
        </mesh>
        {/* Iconic Large Nose */}
        <mesh position={[0, 3, 4.8]} castShadow>
          <boxGeometry args={[2, 4, 2]} />
          <meshStandardMaterial color="#BA835C" roughness={0.8} />
        </mesh>
        {/* Monobrow */}
        <mesh position={[0, 6.2, 4.05]}>
          <planeGeometry args={[6, 1.2]} />
          <meshBasicMaterial color="#3D2616" />
        </mesh>
        {/* Green Eyes */}
        <mesh position={[-2, 4.8, 4.05]}>
          <planeGeometry args={[1.4, 1.2]} />
          <meshBasicMaterial color="#1B9942" />
        </mesh>
        <mesh position={[2, 4.8, 4.05]}>
          <planeGeometry args={[1.4, 1.2]} />
          <meshBasicMaterial color="#1B9942" />
        </mesh>
      </group>

      {/* Robe Body */}
      <mesh position={[0, 14, 0]} castShadow>
        <boxGeometry args={[9, 14, 6]} />
        <meshStandardMaterial color="#557A46" roughness={0.85} />
      </mesh>

      {/* Crossed Arms */}
      <mesh position={[0, 16, 3.5]} castShadow>
        <boxGeometry args={[10, 4, 4]} />
        <meshStandardMaterial color="#446237" roughness={0.85} />
      </mesh>

      {/* Bottom Robe Skirt */}
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[9, 8, 6]} />
        <meshStandardMaterial color="#4A3423" roughness={0.9} />
      </mesh>
    </group>
  );
};

/**
 * 3D Minecraft Enderman (The End Scene)
 */
export const Enderman: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const headRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (headRef.current) {
      const mouse = state.pointer;
      headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, -mouse.x * 0.4, 5, delta);
    }
  });

  return (
    <group position={position} rotation={rotation} scale={0.055}>
      {/* Head */}
      <group ref={headRef} position={[0, 40, 0]}>
        <mesh castShadow>
          <boxGeometry args={[8, 8, 8]} />
          <meshStandardMaterial color="#0E0E12" roughness={0.9} />
        </mesh>
        {/* Glowing Purple Eyes */}
        <mesh position={[-2.2, 0.5, 4.05]}>
          <planeGeometry args={[2.0, 0.8]} />
          <meshBasicMaterial color="#CC44FF" />
        </mesh>
        <mesh position={[2.2, 0.5, 4.05]}>
          <planeGeometry args={[2.0, 0.8]} />
          <meshBasicMaterial color="#CC44FF" />
        </mesh>
        {/* Eye glow light */}
        <pointLight color="#CC44FF" intensity={0.8} distance={5} position={[0, 0.5, 4.5]} />
      </group>

      {/* Slender Body */}
      <mesh position={[0, 27, 0]} castShadow>
        <boxGeometry args={[6, 18, 4]} />
        <meshStandardMaterial color="#0A0A0E" roughness={0.9} />
      </mesh>

      {/* Long Slender Arms */}
      <mesh position={[-4, 20, 0]} castShadow>
        <boxGeometry args={[2, 30, 2]} />
        <meshStandardMaterial color="#0A0A0E" roughness={0.9} />
      </mesh>
      <mesh position={[4, 20, 0]} castShadow>
        <boxGeometry args={[2, 30, 2]} />
        <meshStandardMaterial color="#0A0A0E" roughness={0.9} />
      </mesh>

      {/* Long Slender Legs */}
      <mesh position={[-1.5, 9, 0]} castShadow>
        <boxGeometry args={[2, 22, 2]} />
        <meshStandardMaterial color="#0A0A0E" roughness={0.9} />
      </mesh>
      <mesh position={[1.5, 9, 0]} castShadow>
        <boxGeometry args={[2, 22, 2]} />
        <meshStandardMaterial color="#0A0A0E" roughness={0.9} />
      </mesh>
    </group>
  );
};

/**
 * 3D Minecraft Axolotl (Lush Caves Scene)
 */
export const Axolotl: React.FC<{ position?: [number, number, number] }> = ({
  position = [0, 0, 0]
}) => {
  const axolotlRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (axolotlRef.current) {
      // Gentle circular swimming path
      axolotlRef.current.position.x = position[0] + Math.sin(t * 0.8) * 0.8;
      axolotlRef.current.position.z = position[2] + Math.cos(t * 0.8) * 0.8;
      axolotlRef.current.rotation.y = t * 0.8 + Math.PI / 2;
    }
    if (tailRef.current) {
      // Undulating tail
      tailRef.current.rotation.y = Math.sin(t * 4) * 0.35;
    }
  });

  return (
    <group ref={axolotlRef} position={position} scale={0.35}>
      {/* Pink Body */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.4, 1.4]} />
        <meshStandardMaterial color="#FFB6C1" roughness={0.6} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.05, 0.85]} castShadow>
        <boxGeometry args={[1.0, 0.5, 0.6]} />
        <meshStandardMaterial color="#FFB6C1" roughness={0.6} />
      </mesh>

      {/* Gills (External Red Frills) */}
      <mesh position={[-0.6, 0.2, 0.8]}>
        <boxGeometry args={[0.3, 0.5, 0.2]} />
        <meshStandardMaterial color="#FF1493" roughness={0.5} />
      </mesh>
      <mesh position={[0.6, 0.2, 0.8]}>
        <boxGeometry args={[0.3, 0.5, 0.2]} />
        <meshStandardMaterial color="#FF1493" roughness={0.5} />
      </mesh>

      {/* Animated Swimming Tail */}
      <mesh ref={tailRef} position={[0, 0, -1.0]}>
        <boxGeometry args={[0.2, 0.6, 0.8]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.6} />
      </mesh>
    </group>
  );
};
