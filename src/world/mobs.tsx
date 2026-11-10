import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { sounds } from '../audio/soundManager';
import { Interactable } from '../interaction/Interactable';
import { useStore } from '../store';

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
  const [isSheared, setIsSheared] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (headRef.current) {
      headRef.current.rotation.x = 0.2 + Math.sin(t * 1.5) * 0.1;
    }
  });

  const handleSheepClick = () => {
    sounds.playSheepBaa();
    useStore.getState().recordDiscovery('mob_sheep_baa', 'MOB', 'Fluffy Sheep');
  };

  const handleRightClick = () => {
    sounds.playItemPop();
    setIsSheared(!isSheared);
    useStore.getState().recordDiscovery('mob_sheep_shear', 'MOB', 'Shear Sheep Wool');
  };

  return (
    <Interactable
      id="mob_sheep"
      name="Fluffy Sheep"
      category="MOB"
      onClick={handleSheepClick}
      onRightClick={handleRightClick}
      position={position}
      rotation={rotation}
      scale={0.4}
    >
      {/* Wool Body */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1.8, isSheared ? 1.0 : 1.4, 2.2]} />
        <meshStandardMaterial color={isSheared ? '#D4B895' : woolColor} roughness={0.9} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 1.5, 1.3]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[1.0, 1.0, 1.0]} />
          <meshStandardMaterial color={woolColor} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.35]}>
          <boxGeometry args={[0.8, 0.7, 0.7]} />
          <meshStandardMaterial color="#E5C7B0" roughness={0.8} />
        </mesh>
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
    </Interactable>
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

  const handleClick = () => {
    sounds.playVillagerHmm();
    if (onInteract) onInteract();
    useStore.getState().recordDiscovery('mob_villager_hmm', 'MOB', 'Villager Merchant');
  };

  return (
    <Interactable
      id="mob_villager"
      name="Village Merchant"
      category="MOB"
      onClick={handleClick}
      position={position}
      rotation={rotation}
      scale={0.065}
    >
      {/* Head Pivot at y=24 */}
      <group ref={headRef} position={[0, 24, 0]}>
        <mesh position={[0, 5, 0]} castShadow>
          <boxGeometry args={[8, 10, 8]} />
          <meshStandardMaterial color="#C8966E" roughness={0.8} />
        </mesh>
        <mesh position={[0, 3, 4.8]} castShadow>
          <boxGeometry args={[2, 4, 2]} />
          <meshStandardMaterial color="#BA835C" roughness={0.8} />
        </mesh>
        <mesh position={[0, 6.2, 4.05]}>
          <planeGeometry args={[6, 1.2]} />
          <meshBasicMaterial color="#3D2616" />
        </mesh>
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
    </Interactable>
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

  const handleClick = () => {
    sounds.playEndermanVwoop();
    useStore.getState().recordDiscovery('mob_enderman_vwoop', 'MOB', 'Enderman Teleport');
  };

  return (
    <Interactable
      id="mob_enderman"
      name="Ender Watcher"
      category="MOB"
      onClick={handleClick}
      position={position}
      rotation={rotation}
      scale={0.055}
    >
      {/* Head */}
      <group ref={headRef} position={[0, 40, 0]}>
        <mesh castShadow>
          <boxGeometry args={[8, 8, 8]} />
          <meshStandardMaterial color="#0E0E12" roughness={0.9} />
        </mesh>
        <mesh position={[-2.2, 0.5, 4.05]}>
          <planeGeometry args={[2.0, 0.8]} />
          <meshBasicMaterial color="#CC44FF" />
        </mesh>
        <mesh position={[2.2, 0.5, 4.05]}>
          <planeGeometry args={[2.0, 0.8]} />
          <meshBasicMaterial color="#CC44FF" />
        </mesh>
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
    </Interactable>
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
      axolotlRef.current.position.x = position[0] + Math.sin(t * 0.8) * 0.8;
      axolotlRef.current.position.z = position[2] + Math.cos(t * 0.8) * 0.8;
      axolotlRef.current.rotation.y = t * 0.8 + Math.PI / 2;
    }
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 4) * 0.35;
    }
  });

  const handleClick = () => {
    sounds.playWaterSplash();
    useStore.getState().recordDiscovery('mob_axolotl_splash', 'MOB', 'Playful Axolotl');
  };

  return (
    <Interactable
      id="mob_axolotl"
      name="Playful Axolotl"
      category="MOB"
      onClick={handleClick}
      position={position}
      scale={0.35}
    >
      <group ref={axolotlRef}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.4, 1.4]} />
          <meshStandardMaterial color="#FFB6C1" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.05, 0.85]} castShadow>
          <boxGeometry args={[1.0, 0.5, 0.6]} />
          <meshStandardMaterial color="#FFB6C1" roughness={0.6} />
        </mesh>
        <mesh position={[-0.6, 0.2, 0.8]}>
          <boxGeometry args={[0.3, 0.5, 0.2]} />
          <meshStandardMaterial color="#FF1493" roughness={0.5} />
        </mesh>
        <mesh position={[0.6, 0.2, 0.8]}>
          <boxGeometry args={[0.3, 0.5, 0.2]} />
          <meshStandardMaterial color="#FF1493" roughness={0.5} />
        </mesh>
        <mesh ref={tailRef} position={[0, 0, -1.0]}>
          <boxGeometry args={[0.2, 0.6, 0.8]} />
          <meshStandardMaterial color="#FF69B4" roughness={0.6} />
        </mesh>
      </group>
    </Interactable>
  );
};
