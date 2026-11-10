import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { sounds } from '../audio/soundManager';
import { Interactable } from '../interaction/Interactable';
import { useStore } from '../store';
import { vanillaAtlas } from './VanillaTextureAtlas';

function createMobTexture(name: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  return vanillaAtlas.getStandaloneTexture(`${name}_${width}x${height}`, (ctx) => {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx);
  });
}

/**
 * 3D Minecraft Sheep with textured wool and shearing mechanic
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

  // Curly wool texture (NearestFilter)
  const woolMaterial = useMemo(() => {
    const tex = createMobTexture('sheep_wool', 16, 16, (ctx) => {
      const shades = ['#EAEAEA', '#DFDFDF', '#D0D0D0', '#F2F2F2'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const isDarker = (x % 3 === 0 && y % 3 === 0) || (x % 4 === 2 && y % 4 === 2);
          ctx.fillStyle = isDarker ? '#C2C2C2' : shades[(x * 5 + y * 7) % shades.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
    return new THREE.MeshStandardMaterial({
      map: tex,
      color: woolColor,
      roughness: 1.0,
      metalness: 0.0,
    });
  }, [woolColor]);

  // Sheep face texture (Tan snout, black eyes, white cap)
  const faceMaterial = useMemo(() => {
    const tex = createMobTexture('sheep_face', 16, 16, (ctx) => {
      ctx.fillStyle = '#E5C7B0'; // Tan skin
      ctx.fillRect(0, 0, 16, 16);
      // White wool top cap
      ctx.fillStyle = '#EAEAEA';
      ctx.fillRect(0, 0, 16, 6);
      // Black eyes with white sclera
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(2, 7, 3, 2);
      ctx.fillRect(11, 7, 3, 2);
      ctx.fillStyle = '#111111';
      ctx.fillRect(3, 7, 2, 2);
      ctx.fillRect(11, 7, 2, 2);
      // Pink nostrils
      ctx.fillStyle = '#BC8B76';
      ctx.fillRect(6, 13, 2, 1);
      ctx.fillRect(8, 13, 2, 1);
    });
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 1.0,
      metalness: 0.0,
    });
  }, []);

  // Sheep skin/leg material
  const skinMaterial = useMemo(() => {
    const tex = createMobTexture('sheep_skin', 8, 8, (ctx) => {
      ctx.fillStyle = '#E5C7B0';
      ctx.fillRect(0, 0, 8, 8);
      // Dark hooves at bottom
      ctx.fillStyle = '#332E2A';
      ctx.fillRect(0, 6, 8, 2);
    });
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 1.0,
      metalness: 0.0,
    });
  }, []);

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
      <mesh position={[0, 1.2, 0]} material={isSheared ? skinMaterial : woolMaterial} castShadow>
        <boxGeometry args={[1.8, isSheared ? 1.0 : 1.4, 2.2]} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 1.5, 1.3]}>
        {/* Head Wool Top */}
        <mesh position={[0, 0.2, 0]} material={woolMaterial}>
          <boxGeometry args={[1.0, 1.0, 1.0]} />
        </mesh>
        {/* Head Snout Face */}
        <mesh position={[0, 0, 0.35]} material={faceMaterial}>
          <boxGeometry args={[0.8, 0.7, 0.7]} />
        </mesh>
      </group>

      {/* 4 Legs with hooves */}
      {[
        [-0.6, 0.45, -0.7],
        [0.6, 0.45, -0.7],
        [-0.6, 0.45, 0.7],
        [0.6, 0.45, 0.7],
      ].map(([lx, ly, lz], i) => (
        <mesh key={i} position={[lx, ly, lz]} material={skinMaterial} castShadow>
          <boxGeometry args={[0.4, 0.9, 0.4]} />
        </mesh>
      ))}
    </Interactable>
  );
};

/**
 * 3D Minecraft Villager with 3D Nose, Robe and Emerald Eyes
 */
export const Villager: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  onInteract?: () => void;
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0], onInteract }) => {
  const headRef = useRef<THREE.Group>(null);

  // Villager face texture
  const villagerFaceMaterial = useMemo(() => {
    const tex = createMobTexture('villager_face', 16, 16, (ctx) => {
      ctx.fillStyle = '#C8966E'; // Tan skin
      ctx.fillRect(0, 0, 16, 16);
      // Unibrow
      ctx.fillStyle = '#3D2616';
      ctx.fillRect(4, 5, 8, 2);
      // Emerald Green Eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(3, 7, 3, 2);
      ctx.fillRect(10, 7, 3, 2);
      ctx.fillStyle = '#1B9942'; // Green iris
      ctx.fillRect(4, 7, 2, 2);
      ctx.fillRect(10, 7, 2, 2);
    });
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 1.0,
      metalness: 0.0,
    });
  }, []);

  // Villager brown robe material
  const robeMaterial = useMemo(() => {
    const tex = createMobTexture('villager_robe', 16, 16, (ctx) => {
      const brown = ['#557A46', '#48683B', '#3E5A32', '#628C51'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = brown[(x * 5 + y * 7) % brown.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 1.0,
      metalness: 0.0,
    });
  }, []);

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
        {/* Head Box */}
        <mesh position={[0, 5, 0]} material={villagerFaceMaterial} castShadow>
          <boxGeometry args={[8, 10, 8]} />
        </mesh>
        {/* 3D Nose (2x4x2) */}
        <mesh position={[0, 3, 4.8]} castShadow>
          <boxGeometry args={[2, 4, 2]} />
          <meshBasicMaterial color="#BA835C" />
        </mesh>
      </group>

      {/* Robe Body */}
      <mesh position={[0, 14, 0]} material={robeMaterial} castShadow>
        <boxGeometry args={[9, 14, 6]} />
      </mesh>

      {/* Crossed Folded Arms */}
      <mesh position={[0, 16, 3.5]} material={robeMaterial} castShadow>
        <boxGeometry args={[10, 4, 4]} />
      </mesh>

      {/* Bottom Robe Skirt */}
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[9, 8, 6]} />
        <meshBasicMaterial color="#4A3423" />
      </mesh>
    </Interactable>
  );
};

/**
 * 3D Minecraft Enderman with animated mouth and purple glowing eyes
 */
export const Enderman: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const headRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Group>(null);
  const [isAggro, setIsAggro] = useState(false);

  // Enderman mottled black skin texture
  const endermanMaterial = useMemo(() => {
    const tex = createMobTexture('enderman_skin', 16, 16, (ctx) => {
      const darks = ['#121216', '#17171d', '#0d0d10', '#1c1c24'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = darks[(x * 7 + y * 13) % darks.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 1.0,
      metalness: 0.0,
    });
  }, []);

  useFrame((state, delta) => {
    if (headRef.current) {
      const mouse = state.pointer;
      headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, -mouse.x * 0.4, 5, delta);
    }
    if (jawRef.current) {
      const targetY = isAggro ? -2.5 : 0;
      jawRef.current.position.y = THREE.MathUtils.damp(jawRef.current.position.y, targetY, 8, delta);
    }
  });

  const handleClick = () => {
    sounds.playEndermanVwoop();
    setIsAggro(!isAggro);
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
        {/* Upper Head */}
        <mesh position={[0, 2, 0]} material={endermanMaterial} castShadow>
          <boxGeometry args={[8, 6, 8]} />
        </mesh>
        {/* Lower Animated Jaw (Opens downwards on aggro!) */}
        <group ref={jawRef} position={[0, -2, 0]}>
          <mesh material={endermanMaterial} castShadow>
            <boxGeometry args={[8, 3, 8]} />
          </mesh>
        </group>
        {/* Glowing Purple Eyes */}
        <mesh position={[-2.2, 0.5, 4.05]}>
          <planeGeometry args={[2.0, 0.8]} />
          <meshBasicMaterial color="#E079FA" />
        </mesh>
        <mesh position={[2.2, 0.5, 4.05]}>
          <planeGeometry args={[2.0, 0.8]} />
          <meshBasicMaterial color="#E079FA" />
        </mesh>
        <pointLight color="#CC44FF" intensity={0.8} distance={5} position={[0, 0.5, 4.5]} />
      </group>

      {/* Slender Body */}
      <mesh position={[0, 27, 0]} material={endermanMaterial} castShadow>
        <boxGeometry args={[6, 18, 4]} />
      </mesh>

      {/* Long Slender Arms (2x30x2) */}
      <mesh position={[-4, 20, 0]} material={endermanMaterial} castShadow>
        <boxGeometry args={[2, 30, 2]} />
      </mesh>
      <mesh position={[4, 20, 0]} material={endermanMaterial} castShadow>
        <boxGeometry args={[2, 30, 2]} />
      </mesh>

      {/* Long Slender Legs (2x30x2) */}
      <mesh position={[-1.5, 9, 0]} material={endermanMaterial} castShadow>
        <boxGeometry args={[2, 30, 2]} />
      </mesh>
      <mesh position={[1.5, 9, 0]} material={endermanMaterial} castShadow>
        <boxGeometry args={[2, 30, 2]} />
      </mesh>
    </Interactable>
  );
};

/**
 * 3D Minecraft Axolotl (Lush Caves Scene)
 */
export const Axolotl: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const tailRef = useRef<THREE.Mesh>(null);

  // Pink Axolotl texture
  const axolotlMaterial = useMemo(() => {
    const tex = createMobTexture('axolotl_skin', 16, 16, (ctx) => {
      const pinks = ['#fbc1e3', '#f5b0d8', '#fecde8', '#efa0cd'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = pinks[(x * 7 + y * 11) % pinks.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 1.0,
      metalness: 0.0,
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 5) * 0.35;
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
      rotation={rotation}
      scale={0.07}
    >
      {/* Head */}
      <mesh position={[0, 0, 4]} material={axolotlMaterial} castShadow>
        <boxGeometry args={[8, 5, 5]} />
      </mesh>
      {/* Gills (Left & Right) */}
      <mesh position={[-4.5, 1, 3]}>
        <boxGeometry args={[2, 4, 1]} />
        <meshBasicMaterial color="#DB4F8D" />
      </mesh>
      <mesh position={[4.5, 1, 3]}>
        <boxGeometry args={[2, 4, 1]} />
        <meshBasicMaterial color="#DB4F8D" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0, -2]} material={axolotlMaterial} castShadow>
        <boxGeometry args={[7, 4, 10]} />
      </mesh>

      {/* Animated Swimming Tail */}
      <mesh ref={tailRef} position={[0, 0, -8]} material={axolotlMaterial} castShadow>
        <boxGeometry args={[2, 5, 8]} />
      </mesh>

      {/* 4 Splayed Legs */}
      <mesh position={[-4, -1.5, 1]} material={axolotlMaterial}>
        <boxGeometry args={[3, 2, 3]} />
      </mesh>
      <mesh position={[4, -1.5, 1]} material={axolotlMaterial}>
        <boxGeometry args={[3, 2, 3]} />
      </mesh>
      <mesh position={[-4, -1.5, -4]} material={axolotlMaterial}>
        <boxGeometry args={[3, 2, 3]} />
      </mesh>
      <mesh position={[4, -1.5, -4]} material={axolotlMaterial}>
        <boxGeometry args={[3, 2, 3]} />
      </mesh>
    </Interactable>
  );
};
