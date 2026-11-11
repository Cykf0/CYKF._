import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createMinecraftBoxGeometry, loadAndProcessSkin, ProcessedSkinData, getDefaultSkinData } from './SkinTexture';
import { Nametag } from './Nametag';
import { content } from '../content';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';
import { getItemTexture3D } from '../utils/itemIcons';
import { create3DVoxelItemGeometry } from './VoxelItemGeometry';
import { DIAMOND_PICKAXE_VOXELS, SOUL_TORCH_VOXELS } from './VoxelItemData';

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

  const [skinData, setSkinData] = useState<ProcessedSkinData>(() => getDefaultSkinData());
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

  // Materials - Pure Vanilla Matte Shading
  const baseMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: skinData?.texture || null,
      roughness: 1.0,
      metalness: 0.0,
      alphaTest: 0.1,
    });
  }, [skinData]);

  const overlayMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: skinData?.texture || null,
      roughness: 1.0,
      metalness: 0.0,
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

    // 1. Idle breathing & natural torso bob
    if (bodyRef.current) {
      const breathBob = pose === 'walking' 
        ? Math.abs(Math.sin(t * 4.2)) * 0.35 
        : Math.sin(t * 1.8) * 0.12;
      bodyRef.current.position.y = 18 + breathBob;
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
        const targetYaw = THREE.MathUtils.clamp(mouse.x * 0.7, -0.65, 0.65);
        const targetPitch = THREE.MathUtils.clamp(-mouse.y * 0.45, -0.4, 0.4);
        headPivotRef.current.rotation.y = THREE.MathUtils.damp(headPivotRef.current.rotation.y, targetYaw, 6, delta);
        headPivotRef.current.rotation.x = THREE.MathUtils.damp(headPivotRef.current.rotation.x, targetPitch, 6, delta);
      } else if (pose === 'look-back') {
        const targetYaw = 2.4 + Math.sin(t * 1.2) * 0.08;
        headPivotRef.current.rotation.y = THREE.MathUtils.damp(headPivotRef.current.rotation.y, targetYaw, 4, delta);
      }
    }

    // 3. Synchronized Poses and Limb Animations
    if (pose === 'waving') {
      if (rightArmPivotRef.current && armSwingAnimation === null) {
        // Right arm raised high in energetic, natural waving greeting (pointing up and away from face)
        const waveAngle = Math.sin(t * 5.0) * 0.35;
        rightArmPivotRef.current.rotation.z = -2.3 - waveAngle;
        rightArmPivotRef.current.rotation.x = -0.15 + Math.cos(t * 2.5) * 0.08;
        rightArmPivotRef.current.rotation.y = 0.2;
      }
      if (leftArmPivotRef.current) {
        leftArmPivotRef.current.rotation.x = Math.sin(t * 1.8) * 0.04;
        leftArmPivotRef.current.rotation.z = -0.06;
      }
      if (rightLegPivotRef.current && kickAnimation === null) {
        rightLegPivotRef.current.rotation.x = 0;
      }
      if (leftLegPivotRef.current && kickAnimation === null) {
        leftLegPivotRef.current.rotation.x = 0;
      }
    } else if (pose === 'walking') {
      const walkCycle = Math.sin(t * 4.2);
      if (rightLegPivotRef.current && kickAnimation === null) {
        rightLegPivotRef.current.rotation.x = walkCycle * 0.55;
      }
      if (leftLegPivotRef.current && kickAnimation === null) {
        leftLegPivotRef.current.rotation.x = -walkCycle * 0.55;
      }
      if (rightArmPivotRef.current && armSwingAnimation === null) {
        rightArmPivotRef.current.rotation.x = -walkCycle * 0.45;
        rightArmPivotRef.current.rotation.z = 0.05;
      }
      if (leftArmPivotRef.current) {
        leftArmPivotRef.current.rotation.x = walkCycle * 0.45;
        leftArmPivotRef.current.rotation.z = -0.05;
      }
    } else if (pose === 'holding') {
      if (rightArmPivotRef.current && armSwingAnimation === null) {
        // Holding tool / pickaxe / lantern forward
        rightArmPivotRef.current.rotation.x = -1.1 + Math.sin(t * 1.8) * 0.03;
        rightArmPivotRef.current.rotation.y = -0.15;
        rightArmPivotRef.current.rotation.z = 0.08;
      }
      if (leftArmPivotRef.current) {
        leftArmPivotRef.current.rotation.x = Math.sin(t * 1.8) * 0.04;
        leftArmPivotRef.current.rotation.z = -0.05;
      }
      if (rightLegPivotRef.current && kickAnimation === null) {
        rightLegPivotRef.current.rotation.x = 0;
      }
      if (leftLegPivotRef.current && kickAnimation === null) {
        leftLegPivotRef.current.rotation.x = 0;
      }
    } else {
      // Default Idle
      if (rightArmPivotRef.current && armSwingAnimation === null) {
        const toolHoldingBias = heldItem !== 'none' ? -0.08 : 0;
        rightArmPivotRef.current.rotation.x = toolHoldingBias + Math.sin(t * 1.8) * 0.03;
        rightArmPivotRef.current.rotation.z = 0.04;
        rightArmPivotRef.current.rotation.y = 0;
      }
      if (leftArmPivotRef.current) {
        leftArmPivotRef.current.rotation.x = -Math.sin(t * 1.8) * 0.04;
        leftArmPivotRef.current.rotation.z = -0.05;
        leftArmPivotRef.current.rotation.y = 0;
      }
      if (rightLegPivotRef.current && kickAnimation === null) {
        rightLegPivotRef.current.rotation.x = 0;
      }
      if (leftLegPivotRef.current && kickAnimation === null) {
        leftLegPivotRef.current.rotation.x = 0;
      }
    }

    // 4. Arm swing on click override
    if (armSwingAnimation !== null && rightArmPivotRef.current) {
      const elapsed = (Date.now() - armSwingAnimation) / 1000;
      if (elapsed > 0.4) {
        setArmSwingAnimation(null);
      } else {
        rightArmPivotRef.current.rotation.x = -Math.sin(elapsed * Math.PI * 5) * 1.2;
      }
    }

    // 5. Kick on click override
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
              desc: `B.Tech 1st year student & Minecraft enthusiast!`,
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
          <group position={[0, -9.5, 0.4]} rotation={[0.2, 0, 0]}>
            <Interactable
              id={`player_held_${heldItem}`}
              name={`Held ${heldItem}`}
              category="ITEM"
              onClick={() => {
                sounds.playItemPop();
                useStore.getState().recordDiscovery(`player_held_${heldItem}`, 'ITEM', `Held Item: ${heldItem}`);
              }}
            >
              <HeldItemMesh type={heldItem} pose={pose} />
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
 * 3D True Extruded Voxel Items
 * Adapts to both idle tool carrying (media_1794344619118_66476b0d.png)
 * and active holding/mining pose (media_1794344290756_5d19728c.png)
 */
const CustomDiamondPickaxeHeld: React.FC<{ pose?: string }> = ({ pose = 'idle' }) => {
  const geom = useMemo(() => {
    // 16x16 sprite: handle enters palm around pixel (4, 3.5)
    return create3DVoxelItemGeometry(DIAMOND_PICKAXE_VOXELS, 4.0, 3.5, 0.38, 0.32);
  }, []);

  const isHolding = pose === 'holding';

  return (
    <group
      position={isHolding ? [0, -0.2, 0.2] : [-0.1, -0.1, 0.1]}
      rotation={isHolding ? [-0.45, 0.4, -0.65] : [-0.2, 0.1, 0.55]}
    >
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.35}
          metalness={0.25}
          emissive="#0088AA"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
};

const CustomSoulTorchHeld: React.FC<{ pose?: string }> = ({ pose = 'idle' }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const geom = useMemo(() => {
    // 16x16 sprite: stick base gripped at pixel (7.5, 2.0)
    return create3DVoxelItemGeometry(SOUL_TORCH_VOXELS, 7.5, 2.0, 0.38, 0.32);
  }, []);

  const isHolding = pose === 'holding';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (lightRef.current) {
      const flicker = 1.0 + Math.sin(t * 13.5) * 0.08 + Math.sin(t * 21.3) * 0.05;
      lightRef.current.intensity = 2.8 * flicker;
    }
  });

  return (
    <group
      position={isHolding ? [0, -0.1, 0.3] : [0, -0.1, 0.2]}
      rotation={isHolding ? [0.95, 0.1, -0.05] : [-0.35, 0.2, -0.1]}
    >
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.7}
          metalness={0.1}
          emissive="#00E5FF"
          emissiveIntensity={0.4}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 2.8, 0.3]}
        color="#00E5FF"
        intensity={2.8}
        distance={14}
        decay={2}
      />
    </group>
  );
};

export const HeldItemMesh: React.FC<{ type: string; pose?: string }> = ({ type, pose = 'idle' }) => {
  switch (type) {
    case 'diamond-pickaxe':
      return <CustomDiamondPickaxeHeld pose={pose} />;

    case 'soul-torch':
    case 'soul-lantern':
      return <CustomSoulTorchHeld pose={pose} />;

    case 'emerald':
      return <HeldSpriteItem type="emerald" />;

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
      return <HeldSpriteItem type="ender-pearl" />;

    default:
      if (!type || type === 'none') return null;
      return <HeldSpriteItem type={type} />;
  }
};

const HeldSpriteItem: React.FC<{ type: string }> = ({ type }) => {
  const texture = useMemo(() => getItemTexture3D(type), [type]);
  return (
    <group scale={3.5} rotation={[0, 0, -0.4]}>
      <mesh>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={texture}
          transparent={true}
          alphaTest={0.5}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};
