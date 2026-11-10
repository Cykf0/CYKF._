import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createMinecraftBoxGeometry, loadAndProcessSkin, ProcessedSkinData } from './SkinTexture';
import { Nametag } from './Nametag';
import { content } from '../content';

export interface PlayerModelProps {
  skinUrl?: string;
  pose?: 'idle' | 'walking' | 'waving' | 'holding' | 'look-back';
  heldItem?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  nametag?: string;
  cursorTracking?: boolean;
}

export const PlayerModel: React.FC<PlayerModelProps> = ({
  skinUrl = content.skinPath,
  pose = 'idle',
  heldItem = 'none',
  scale = 0.08,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  nametag = content.mcUsername,
  cursorTracking = true
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headPivotRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const rightArmPivotRef = useRef<THREE.Group>(null);
  const leftArmPivotRef = useRef<THREE.Group>(null);
  const rightLegPivotRef = useRef<THREE.Group>(null);
  const leftLegPivotRef = useRef<THREE.Group>(null);

  const [skinData, setSkinData] = useState<ProcessedSkinData | null>(null);

  useEffect(() => {
    let active = true;
    loadAndProcessSkin(skinUrl, content.skinModel)
      .then((data) => {
        if (active) setSkinData(data);
      })
      .catch((err) => {
        console.warn('Failed to load skin, using fallback texture:', err);
      });
    return () => { active = false; };
  }, [skinUrl]);

  const isSlim = skinData?.isSlim ?? false;
  const armWidth = isSlim ? 3 : 4;
  const shoulderOffset = isSlim ? 5.5 : 6;

  // Build Geometries
  const geometries = useMemo(() => {
    // Standard Minecraft dimensions:
    // Head: 8x8x8. Base at (0, 0), Hat at (32, 0)
    const headBase = createMinecraftBoxGeometry(8, 8, 8, 0, 0, 8, 8, 8);
    const headHat = createMinecraftBoxGeometry(8.6, 8.6, 8.6, 32, 0, 8, 8, 8);

    // Torso: 8x12x4. Base at (16, 16), Jacket at (16, 32)
    const bodyBase = createMinecraftBoxGeometry(8, 12, 4, 16, 16, 8, 12, 4);
    const bodyJacket = createMinecraftBoxGeometry(8.6, 12.6, 4.6, 16, 32, 8, 12, 4);

    // Right Arm: 4x12x4 (or 3x12x4). Base at (40, 16), Sleeve at (40, 32)
    const rightArmBase = createMinecraftBoxGeometry(armWidth, 12, 4, 40, 16, armWidth, 12, 4);
    const rightArmSleeve = createMinecraftBoxGeometry(armWidth + 0.6, 12.6, 4.6, 40, 32, armWidth, 12, 4);

    // Left Arm: 4x12x4 (or 3x12x4). Base at (32, 48), Sleeve at (48, 48)
    const leftArmBase = createMinecraftBoxGeometry(armWidth, 12, 4, 32, 48, armWidth, 12, 4);
    const leftArmSleeve = createMinecraftBoxGeometry(armWidth + 0.6, 12.6, 4.6, 48, 48, armWidth, 12, 4);

    // Right Leg: 4x12x4. Base at (0, 16), Pants at (0, 32)
    const rightLegBase = createMinecraftBoxGeometry(4, 12, 4, 0, 16, 4, 12, 4);
    const rightLegPants = createMinecraftBoxGeometry(4.6, 12.6, 4.6, 0, 32, 4, 12, 4);

    // Left Leg: 4x12x4. Base at (16, 48), Pants at (0, 48)
    const leftLegBase = createMinecraftBoxGeometry(4, 12, 4, 16, 48, 4, 12, 4);
    const leftLegPants = createMinecraftBoxGeometry(4.6, 12.6, 4.6, 0, 48, 4, 12, 4);

    return {
      headBase, headHat,
      bodyBase, bodyJacket,
      rightArmBase, rightArmSleeve,
      leftArmBase, leftArmSleeve,
      rightLegBase, rightLegPants,
      leftLegBase, leftLegPants,
    };
  }, [armWidth]);

  // Materials
  const baseMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: skinData?.texture || null,
      roughness: 0.85,
      metalness: 0.05,
      alphaTest: 0.1,
    });
  }, [skinData]);

  const overlayMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: skinData?.texture || null,
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });
  }, [skinData]);

  // Animation frame loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Idle breathing
    if (bodyRef.current) {
      bodyRef.current.position.y = 18 + Math.sin(t * 2) * 0.15;
    }

    // 2. Head Tracking
    if (headPivotRef.current && cursorTracking) {
      const mouse = state.pointer; // normalized [-1, 1]
      // Clamped pitch & yaw
      const targetYaw = THREE.MathUtils.clamp(-mouse.x * 0.7, -0.65, 0.65);
      const targetPitch = THREE.MathUtils.clamp(-mouse.y * 0.45, -0.4, 0.4);
      headPivotRef.current.rotation.y = THREE.MathUtils.damp(headPivotRef.current.rotation.y, targetYaw, 6, delta);
      headPivotRef.current.rotation.x = THREE.MathUtils.damp(headPivotRef.current.rotation.x, targetPitch, 6, delta);
    }

    // 3. Pose-specific animations
    if (pose === 'waving') {
      // Right arm waves
      if (rightArmPivotRef.current) {
        rightArmPivotRef.current.rotation.x = -Math.PI + 0.3;
        rightArmPivotRef.current.rotation.z = Math.sin(t * 6) * 0.3 - 0.2;
      }
      if (leftArmPivotRef.current) {
        leftArmPivotRef.current.rotation.x = Math.sin(t * 1.5) * 0.08;
        leftArmPivotRef.current.rotation.z = 0.05;
      }
    } else if (pose === 'walking') {
      const walkSpeed = 6;
      const swing = Math.sin(t * walkSpeed) * 0.6;
      if (rightArmPivotRef.current) rightArmPivotRef.current.rotation.x = swing;
      if (leftArmPivotRef.current) leftArmPivotRef.current.rotation.x = -swing;
      if (rightLegPivotRef.current) rightLegPivotRef.current.rotation.x = -swing * 0.8;
      if (leftLegPivotRef.current) leftLegPivotRef.current.rotation.x = swing * 0.8;
    } else if (pose === 'look-back') {
      // Look back pose (Snowy Peaks / The End)
      if (groupRef.current) {
        groupRef.current.rotation.y = Math.PI;
      }
      if (rightArmPivotRef.current) {
        rightArmPivotRef.current.rotation.x = Math.sin(t * 1.5) * 0.06;
      }
    } else {
      // Default Idle
      if (rightArmPivotRef.current) {
        if (heldItem === 'diamond-pickaxe' || heldItem === 'torch' || heldItem === 'soul-lantern') {
          // Raise arm slightly to hold item
          rightArmPivotRef.current.rotation.x = -0.55 + Math.sin(t * 1.5) * 0.04;
          rightArmPivotRef.current.rotation.z = -0.1;
        } else {
          rightArmPivotRef.current.rotation.x = Math.sin(t * 1.5) * 0.08;
          rightArmPivotRef.current.rotation.z = -0.05;
        }
      }
      if (leftArmPivotRef.current) {
        if (heldItem === 'book' || heldItem === 'emerald') {
          leftArmPivotRef.current.rotation.x = -0.45 + Math.sin(t * 1.5) * 0.04;
          leftArmPivotRef.current.rotation.z = 0.1;
        } else {
          leftArmPivotRef.current.rotation.x = -Math.sin(t * 1.5) * 0.08;
          leftArmPivotRef.current.rotation.z = 0.05;
        }
      }
      if (rightLegPivotRef.current) rightLegPivotRef.current.rotation.x = 0;
      if (leftLegPivotRef.current) leftLegPivotRef.current.rotation.x = 0;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Floating Nametag */}
      {nametag && <Nametag name={nametag} position={[0, 34, 0]} />}

      {/* Head + Hat (Pivot at neck y=24) */}
      <group ref={headPivotRef} position={[0, 24, 0]}>
        {/* Head center is at y=4 relative to pivot */}
        <mesh geometry={geometries.headBase} material={baseMaterial} position={[0, 4, 0]} castShadow receiveShadow />
        <mesh geometry={geometries.headHat} material={overlayMaterial} position={[0, 4, 0]} castShadow />
      </group>

      {/* Body / Torso + Jacket (Center at y=18) */}
      <group ref={bodyRef} position={[0, 18, 0]}>
        <mesh geometry={geometries.bodyBase} material={baseMaterial} castShadow receiveShadow />
        <mesh geometry={geometries.bodyJacket} material={overlayMaterial} castShadow />
      </group>

      {/* Right Arm + Sleeve (Pivot at shoulder x=-shoulderOffset, y=22) */}
      <group ref={rightArmPivotRef} position={[-shoulderOffset, 22, 0]}>
        <mesh geometry={geometries.rightArmBase} material={baseMaterial} position={[0, -4, 0]} castShadow receiveShadow />
        <mesh geometry={geometries.rightArmSleeve} material={overlayMaterial} position={[0, -4, 0]} castShadow />

        {/* Held Item in Right Hand */}
        {heldItem !== 'none' && (
          <group position={[0, -9, 2]} rotation={[0.4, 0, 0]}>
            <HeldItemMesh type={heldItem} />
          </group>
        )}
      </group>

      {/* Left Arm + Sleeve (Pivot at shoulder x=shoulderOffset, y=22) */}
      <group ref={leftArmPivotRef} position={[shoulderOffset, 22, 0]}>
        <mesh geometry={geometries.leftArmBase} material={baseMaterial} position={[0, -4, 0]} castShadow receiveShadow />
        <mesh geometry={geometries.leftArmSleeve} material={overlayMaterial} position={[0, -4, 0]} castShadow />
      </group>

      {/* Right Leg + Pants (Pivot at hip x=-2, y=12) */}
      <group ref={rightLegPivotRef} position={[-2, 12, 0]}>
        <mesh geometry={geometries.rightLegBase} material={baseMaterial} position={[0, -6, 0]} castShadow receiveShadow />
        <mesh geometry={geometries.rightLegPants} material={overlayMaterial} position={[0, -6, 0]} castShadow />
      </group>

      {/* Left Leg + Pants (Pivot at hip x=2, y=12) */}
      <group ref={leftLegPivotRef} position={[2, 12, 0]}>
        <mesh geometry={geometries.leftLegBase} material={baseMaterial} position={[0, -6, 0]} castShadow receiveShadow />
        <mesh geometry={geometries.leftLegPants} material={overlayMaterial} position={[0, -6, 0]} castShadow />
      </group>
    </group>
  );
};

/**
 * 3D Low-Poly Held Items
 */
export const HeldItemMesh: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'diamond-pickaxe':
      return (
        <group scale={0.7} rotation={[0, 0, -0.6]}>
          {/* Stick */}
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[0.8, 10, 0.8]} />
            <meshStandardMaterial color="#8B5A2B" roughness={0.9} />
          </mesh>
          {/* Diamond head */}
          <mesh position={[0, 7.5, 0]}>
            <boxGeometry args={[6.5, 1.2, 1.2]} />
            <meshStandardMaterial color="#55FFFF" roughness={0.2} metalness={0.8} emissive="#22FFFF" emissiveIntensity={0.2} />
          </mesh>
        </group>
      );

    case 'torch':
      return (
        <group scale={0.8} rotation={[0.2, 0, 0]}>
          {/* Wooden stick */}
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[1, 7, 1]} />
            <meshStandardMaterial color="#7D5127" roughness={0.9} />
          </mesh>
          {/* Coal head */}
          <mesh position={[0, 6, 0]}>
            <boxGeometry args={[1.2, 1.5, 1.2]} />
            <meshStandardMaterial color="#2B2B2B" roughness={0.9} />
          </mesh>
          {/* Flame */}
          <mesh position={[0, 7.2, 0]}>
            <boxGeometry args={[1.1, 1.1, 1.1]} />
            <meshBasicMaterial color="#FF9900" />
          </mesh>
          <pointLight color="#FFAA33" intensity={2.5} distance={15} decay={2} position={[0, 7.5, 0]} />
        </group>
      );

    case 'soul-lantern':
      return (
        <group scale={0.65}>
          {/* Metal frame */}
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[3.2, 4.5, 3.2]} />
            <meshStandardMaterial color="#2A2A30" metalness={0.9} roughness={0.4} />
          </mesh>
          {/* Glowing soul core */}
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[2.2, 3.2, 2.2]} />
            <meshBasicMaterial color="#00E5FF" />
          </mesh>
          <pointLight color="#00E5FF" intensity={3} distance={18} decay={2} position={[0, 2, 0]} />
        </group>
      );

    case 'emerald':
      return (
        <mesh scale={0.7} rotation={[0.4, 0.4, 0]}>
          <octahedronGeometry args={[2, 0]} />
          <meshStandardMaterial color="#00FF66" roughness={0.1} metalness={0.9} emissive="#00DD44" emissiveIntensity={0.3} />
        </mesh>
      );

    case 'book':
      return (
        <group scale={0.65} rotation={[0.8, 0, 0]}>
          <mesh>
            <boxGeometry args={[4, 5, 1.2]} />
            <meshStandardMaterial color="#881B1B" roughness={0.7} />
          </mesh>
          {/* Pages */}
          <mesh position={[0.2, 0, 0]}>
            <boxGeometry args={[3.6, 4.6, 0.9]} />
            <meshStandardMaterial color="#F5E6C8" roughness={0.9} />
          </mesh>
        </group>
      );

    case 'ender-pearl':
      return (
        <mesh scale={0.7}>
          <sphereGeometry args={[1.6, 12, 12]} />
          <meshStandardMaterial color="#0B4D3C" roughness={0.2} metalness={0.8} emissive="#077A5B" emissiveIntensity={0.6} />
        </mesh>
      );

    default:
      return null;
  }
};
