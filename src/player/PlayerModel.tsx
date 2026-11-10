import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createMinecraftBoxGeometry, loadAndProcessSkin, ProcessedSkinData } from './SkinTexture';
import { Nametag } from './Nametag';
import { content } from '../content';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

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
  const [hatVisible, setHatVisible] = useState(true);
  const [nodAnimation, setNodAnimation] = useState<number | null>(null);
  const [armSwingAnimation, setArmSwingAnimation] = useState<number | null>(null);
  const [kickAnimation, setKickAnimation] = useState<number | null>(null);
  const [jumpTime, setJumpTime] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extraRotationY, setExtraRotationY] = useState(0);
  const lastPointerX = useRef(0);

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
    const headBase = createMinecraftBoxGeometry(8, 8, 8, 0, 0, 8, 8, 8);
    const headHat = createMinecraftBoxGeometry(8.6, 8.6, 8.6, 32, 0, 8, 8, 8);

    const bodyBase = createMinecraftBoxGeometry(8, 12, 4, 16, 16, 8, 12, 4);
    const bodyJacket = createMinecraftBoxGeometry(8.6, 12.6, 4.6, 16, 32, 8, 12, 4);

    const rightArmBase = createMinecraftBoxGeometry(armWidth, 12, 4, 40, 16, armWidth, 12, 4);
    const rightArmSleeve = createMinecraftBoxGeometry(armWidth + 0.6, 12.6, 4.6, 40, 32, armWidth, 12, 4);

    const leftArmBase = createMinecraftBoxGeometry(armWidth, 12, 4, 32, 48, armWidth, 12, 4);
    const leftArmSleeve = createMinecraftBoxGeometry(armWidth + 0.6, 12.6, 4.6, 48, 48, armWidth, 12, 4);

    const rightLegBase = createMinecraftBoxGeometry(4, 12, 4, 0, 16, 4, 12, 4);
    const rightLegPants = createMinecraftBoxGeometry(4.6, 12.6, 4.6, 0, 32, 4, 12, 4);

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

    // Double-click jump animation
    if (jumpTime !== null && groupRef.current) {
      const elapsedJump = (Date.now() - jumpTime) / 1000;
      if (elapsedJump > 0.45) {
        setJumpTime(null);
        groupRef.current.position.y = position[1];
      } else {
        const jumpH = Math.sin((elapsedJump / 0.45) * Math.PI) * 0.8;
        groupRef.current.position.y = position[1] + jumpH;
      }
    }

    // Drag rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation[1] + extraRotationY;
    }

    // 1. Idle breathing
    if (bodyRef.current) {
      bodyRef.current.position.y = 18 + Math.sin(t * 2) * 0.15;
    }

    // 2. Head Tracking & Nodding
    if (headPivotRef.current) {
      if (nodAnimation !== null) {
        const elapsedNod = (Date.now() - nodAnimation) / 1000;
        if (elapsedNod > 0.6) {
          setNodAnimation(null);
        } else {
          headPivotRef.current.rotation.x = Math.sin(elapsedNod * Math.PI * 4) * 0.35;
        }
      } else if (cursorTracking) {
        const mouse = state.pointer; // normalized [-1, 1]
        const targetYaw = THREE.MathUtils.clamp(-mouse.x * 0.7, -0.65, 0.65);
        const targetPitch = THREE.MathUtils.clamp(-mouse.y * 0.45, -0.4, 0.4);
        headPivotRef.current.rotation.y = THREE.MathUtils.damp(headPivotRef.current.rotation.y, targetYaw, 6, delta);
        headPivotRef.current.rotation.x = THREE.MathUtils.damp(headPivotRef.current.rotation.x, targetPitch, 6, delta);
      }
    }

    // 3. Arm swing on click
    if (armSwingAnimation !== null && rightArmPivotRef.current) {
      const elapsed = (Date.now() - armSwingAnimation) / 1000;
      if (elapsed > 0.4) {
        setArmSwingAnimation(null);
      } else {
        rightArmPivotRef.current.rotation.x = -Math.sin(elapsed * Math.PI * 5) * 1.2;
      }
    }

    // 4. Kick on click
    if (kickAnimation !== null && rightLegPivotRef.current) {
      const elapsed = (Date.now() - kickAnimation) / 1000;
      if (elapsed > 0.4) {
        setKickAnimation(null);
      } else {
        rightLegPivotRef.current.rotation.x = -Math.sin(elapsed * Math.PI * 5) * 0.9;
      }
    }
  });

  const handlePointerDown = (e: any) => {
    setIsDragging(true);
    lastPointerX.current = e.clientX || 0;
    const handleMove = (ev: MouseEvent) => {
      const dx = ev.clientX - lastPointerX.current;
      lastPointerX.current = ev.clientX;
      setExtraRotationY((prev) => prev + dx * 0.015);
    };
    const handleUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const handleDoubleClick = () => {
    sounds.playWobble(580);
    setJumpTime(Date.now());
    useStore.getState().recordDiscovery('player_jump', 'PLAYER', 'Player Jump');
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Floating Nametag */}
      {nametag && (
        <Interactable
          id="player_nametag"
          name="Player Nametag"
          category="PLAYER"
          onClick={() => {
            sounds.playXpOrb();
            useStore.getState().setToastMessage({
              title: `Player: ${nametag}`,
              desc: `Full-stack engineer & Minecraft enthusiast!`,
              icon: 'diamond'
            });
            setTimeout(() => useStore.getState().setToastMessage(null), 3000);
          }}
        >
          <Nametag name={nametag} position={[0, 34, 0]} />
        </Interactable>
      )}

      {/* Head + Hat (Pivot at neck y=24) */}
      <group ref={headPivotRef} position={[0, 24, 0]}>
        <Interactable
          id="player_head"
          name="Player Head"
          category="PLAYER"
          onClick={() => {
            sounds.playWobble(520);
            setNodAnimation(Date.now());
            useStore.getState().recordDiscovery('player_head_nod', 'PLAYER', 'Player Head Nod');
          }}
        >
          <mesh geometry={geometries.headBase} material={baseMaterial} position={[0, 4, 0]} castShadow receiveShadow />
        </Interactable>

        {hatVisible && (
          <Interactable
            id="player_hat"
            name="Player Hat"
            category="PLAYER"
            onClick={() => {
              sounds.playClick();
              setHatVisible(!hatVisible);
              useStore.getState().recordDiscovery('player_hat_toggle', 'PLAYER', 'Toggle Hat Layer');
            }}
          >
            <mesh geometry={geometries.headHat} material={overlayMaterial} position={[0, 4, 0]} castShadow />
          </Interactable>
        )}
      </group>

      {/* Body / Torso + Jacket (Center at y=18) */}
      <group ref={bodyRef} position={[0, 18, 0]}>
        <Interactable
          id="player_torso"
          name="Player Torso"
          category="PLAYER"
          onClick={() => {
            sounds.playWobble(440);
            setArmSwingAnimation(Date.now());
            setKickAnimation(Date.now());
            useStore.getState().recordDiscovery('player_torso_emote', 'PLAYER', 'Player Body Emote');
          }}
        >
          <mesh geometry={geometries.bodyBase} material={baseMaterial} castShadow receiveShadow />
          <mesh geometry={geometries.bodyJacket} material={overlayMaterial} castShadow />
        </Interactable>
      </group>

      {/* Right Arm + Sleeve (Pivot at shoulder x=-shoulderOffset, y=22) */}
      <group ref={rightArmPivotRef} position={[-shoulderOffset, 22, 0]}>
        <Interactable
          id="player_right_arm"
          name="Player Right Arm"
          category="PLAYER"
          onClick={() => {
            sounds.playBlockHit('wood');
            setArmSwingAnimation(Date.now());
            useStore.getState().recordDiscovery('player_right_arm_swing', 'PLAYER', 'Player Arm Swing');
          }}
        >
          <mesh geometry={geometries.rightArmBase} material={baseMaterial} position={[0, -4, 0]} castShadow receiveShadow />
          <mesh geometry={geometries.rightArmSleeve} material={overlayMaterial} position={[0, -4, 0]} castShadow />
        </Interactable>

        {/* Held Item in Right Hand */}
        {heldItem !== 'none' && (
          <group position={[0, -9, 2]} rotation={[0.4, 0, 0]}>
            <Interactable
              id={`player_held_${heldItem}`}
              name={`Held ${heldItem}`}
              category="ITEM"
              onClick={() => {
                sounds.playItemPop();
                useStore.getState().recordDiscovery(`player_held_${heldItem}`, 'ITEM', `Held Item: ${heldItem}`);
              }}
            >
              <HeldItemMesh type={heldItem} />
            </Interactable>
          </group>
        )}
      </group>

      {/* Left Arm + Sleeve (Pivot at shoulder x=shoulderOffset, y=22) */}
      <group ref={leftArmPivotRef} position={[shoulderOffset, 22, 0]}>
        <Interactable
          id="player_left_arm"
          name="Player Left Arm"
          category="PLAYER"
          onClick={() => {
            sounds.playBlockHit('wood');
            setArmSwingAnimation(Date.now());
            useStore.getState().recordDiscovery('player_left_arm_swing', 'PLAYER', 'Player Left Arm');
          }}
        >
          <mesh geometry={geometries.leftArmBase} material={baseMaterial} position={[0, -4, 0]} castShadow receiveShadow />
          <mesh geometry={geometries.leftArmSleeve} material={overlayMaterial} position={[0, -4, 0]} castShadow />
        </Interactable>
      </group>

      {/* Right Leg + Pants (Pivot at hip x=-2, y=12) */}
      <group ref={rightLegPivotRef} position={[-2, 12, 0]}>
        <Interactable
          id="player_right_leg"
          name="Player Right Leg"
          category="PLAYER"
          onClick={() => {
            sounds.playBlockHit('grass');
            setKickAnimation(Date.now());
            useStore.getState().recordDiscovery('player_right_leg_kick', 'PLAYER', 'Player Leg Kick');
          }}
        >
          <mesh geometry={geometries.rightLegBase} material={baseMaterial} position={[0, -6, 0]} castShadow receiveShadow />
          <mesh geometry={geometries.rightLegPants} material={overlayMaterial} position={[0, -6, 0]} castShadow />
        </Interactable>
      </group>

      {/* Left Leg + Pants (Pivot at hip x=2, y=12) */}
      <group ref={leftLegPivotRef} position={[2, 12, 0]}>
        <Interactable
          id="player_left_leg"
          name="Player Left Leg"
          category="PLAYER"
          onClick={() => {
            sounds.playBlockHit('grass');
            setKickAnimation(Date.now());
            useStore.getState().recordDiscovery('player_left_leg_kick', 'PLAYER', 'Player Left Leg');
          }}
        >
          <mesh geometry={geometries.leftLegBase} material={baseMaterial} position={[0, -6, 0]} castShadow receiveShadow />
          <mesh geometry={geometries.leftLegPants} material={overlayMaterial} position={[0, -6, 0]} castShadow />
        </Interactable>
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
