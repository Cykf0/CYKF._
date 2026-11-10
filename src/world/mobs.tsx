import React, { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { sounds } from '../audio/soundManager';
import { Interactable } from '../interaction/Interactable';
import { useStore } from '../store';
import { vanillaAtlas } from './VanillaTextureAtlas';
import { createBoxUVs } from '../player/SkinTexture';

/**
 * Creates custom BoxGeometry with precise Minecraft UVs applied.
 */
function createMobBoxGeometry(
  w: number,
  h: number,
  d: number,
  texX: number,
  texY: number,
  texW: number,
  texH: number,
  texD: number,
  texWidth = 64,
  texHeight = 64
): THREE.BoxGeometry {
  const geom = new THREE.BoxGeometry(w, h, d);
  const uvs = createBoxUVs(texWidth, texHeight, texX, texY, texW, texH, texD);
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geom;
}

/**
 * Helper to load pixel-crisp Minecraft entity textures
 */
function loadEntityTexture(url: string): THREE.Texture {
  const loader = new THREE.TextureLoader();
  const tex = loader.load(url);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createMobTexture(name: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  return vanillaAtlas.getStandaloneTexture(`${name}_${width}x${height}`, (ctx: CanvasRenderingContext2D) => {
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
 * 3D Authentic Minecraft Villager with 64x64 UV Texture Mapping,
 * Protruding 3D Nose, Robe Coat, Folded Cross-Arms, and Natural Idle & Interaction Animations.
 */
export const Villager: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  profession?: 'none' | 'librarian' | 'mason' | 'weaponsmith' | 'cleric' | 'farmer' | 'toolsmith';
  onInteract?: () => void;
  id?: string;
  name?: string;
  tooltip?: string;
}> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.065,
  profession = 'none',
  onInteract,
  id = 'mob_villager',
  name = 'Village Merchant',
  tooltip = 'Click to interact'
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const armsRef = useRef<THREE.Group>(null);
  const [nodAnimation, setNodAnimation] = useState<number | null>(null);
  const [gestureAnimation, setGestureAnimation] = useState<number | null>(null);

  // 1. Authentic 64x64 Base Villager Texture
  const villagerMaterial = useMemo(() => {
    const tex = loadEntityTexture('/textures/villager.png');
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 1.0,
      metalness: 0.0,
      alphaTest: 0.1,
    });
  }, []);

  // 2. Canonical Profession Texture Overlay
  const professionMaterial = useMemo(() => {
    if (!profession || profession === 'none') return null;
    const tex = loadEntityTexture(`/texturepack/assets/minecraft/textures/entity/villager/profession/${profession}.png`);
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 1.0,
      metalness: 0.0,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });
  }, [profession]);

  // 3. Exact Mojang Minecraft Villager Box Geometries (64x64 coordinates)
  const geometries = useMemo(() => {
    // Head: 8x10x8 at (0, 0)
    const head = createMobBoxGeometry(8, 10, 8, 0, 0, 8, 10, 8, 64, 64);
    // Head hat / spectacles overlay: 8.5x10.5x8.5 at (32, 0)
    const headOverlay = createMobBoxGeometry(8.5, 10.5, 8.5, 32, 0, 8, 10, 8, 64, 64);
    // 3D Protruding Nose: 2x4x2 at (24, 0)
    const nose = createMobBoxGeometry(2, 4, 2, 24, 0, 2, 4, 2, 64, 64);
    // Torso / Body: 8x12x6 at (16, 20)
    const body = createMobBoxGeometry(8, 12, 6, 16, 20, 8, 12, 6, 64, 64);
    // Robe / Coat overlay: 8.5x18.5x6.5 at (0, 38)
    const robe = createMobBoxGeometry(8.5, 18.5, 6.5, 0, 38, 8, 18, 6, 64, 64);
    // Folded arms crossbar: 8x4x4 at (40, 38)
    const armMiddle = createMobBoxGeometry(8, 4, 4, 40, 38, 8, 4, 4, 64, 64);
    // Left & right arm sleeves: 4x8x4 at (44, 22)
    const armSleeveL = createMobBoxGeometry(4, 8, 4, 44, 22, 4, 8, 4, 64, 64);
    const armSleeveR = createMobBoxGeometry(4, 8, 4, 44, 22, 4, 8, 4, 64, 64);
    // Right & left legs: 4x12x4 at (0, 22)
    const rightLeg = createMobBoxGeometry(4, 12, 4, 0, 22, 4, 12, 4, 64, 64);
    const leftLeg = createMobBoxGeometry(4, 12, 4, 0, 22, 4, 12, 4, 64, 64);

    return { head, headOverlay, nose, body, robe, armMiddle, armSleeveL, armSleeveR, rightLeg, leftLeg };
  }, []);

  // 4. Natural Synchronized Animation Loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Idle breathing: subtle rise and fall
    const breath = Math.sin(t * 1.8) * 0.12;
    if (bodyRef.current) {
      bodyRef.current.position.y = 18 + breath;
    }
    if (armsRef.current) {
      // Natural trade gesture on interaction: arms tilt forward
      let armAngle = -0.75;
      if (gestureAnimation !== null) {
        const elapsed = (Date.now() - gestureAnimation) / 1000;
        if (elapsed > 0.8) {
          setGestureAnimation(null);
        } else {
          armAngle = -0.75 - Math.sin((elapsed / 0.8) * Math.PI) * 0.35;
        }
      }
      armsRef.current.position.y = 20 + breath;
      armsRef.current.rotation.x = THREE.MathUtils.damp(armsRef.current.rotation.x, armAngle, 8, delta);
    }

    // Micro body sway (subtle organic weight shifting)
    if (rootRef.current) {
      rootRef.current.rotation.z = Math.sin(t * 0.9) * 0.012;
    }

    // Head Behavior: Curiosity tracking + greeting nod
    if (headRef.current) {
      if (nodAnimation !== null) {
        const elapsed = (Date.now() - nodAnimation) / 1000;
        if (elapsed > 0.6) {
          setNodAnimation(null);
        } else {
          headRef.current.rotation.x = Math.sin(elapsed * Math.PI * 4) * 0.3;
          headRef.current.rotation.z = Math.sin(elapsed * Math.PI * 2) * 0.08;
        }
      } else {
        const mouse = state.pointer;
        const targetYaw = THREE.MathUtils.clamp(mouse.x * 0.55, -0.6, 0.6);
        const targetPitch = THREE.MathUtils.clamp(-mouse.y * 0.35, -0.35, 0.25);
        const curiousRoll = Math.sin(t * 0.75) * 0.05;

        headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, targetYaw, 5, delta);
        headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, targetPitch, 5, delta);
        headRef.current.rotation.z = THREE.MathUtils.damp(headRef.current.rotation.z, curiousRoll, 3, delta);
      }
    }
  });

  const handleClick = () => {
    sounds.playVillagerHmm();
    setNodAnimation(Date.now());
    setGestureAnimation(Date.now());
    if (onInteract) onInteract();
    useStore.getState().recordDiscovery('mob_villager_hmm', 'MOB', 'Villager Merchant');
  };

  return (
    <Interactable
      id={id}
      name={name}
      category="MOB"
      tooltip={tooltip}
      onClick={handleClick}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <group ref={rootRef}>
        {/* Legs: 4x12x4 each, grounded flush at y=0 (centers at y=6) */}
        <mesh position={[-2, 6, 0]} geometry={geometries.rightLeg} material={villagerMaterial} castShadow receiveShadow />
        <mesh position={[2, 6, 0]} geometry={geometries.leftLeg} material={villagerMaterial} castShadow receiveShadow />

        {/* Body Group (Torso + Robe, pivot at y=18) */}
        <group ref={bodyRef} position={[0, 18, 0]}>
          {/* Torso Box (8x12x6) */}
          <mesh geometry={geometries.body} material={villagerMaterial} castShadow receiveShadow />
          {/* Robe Coat Overlay (8.5x18.5x6.5, extends from neck down to y=6) */}
          <mesh position={[0, -3.25, 0]} geometry={geometries.robe} material={villagerMaterial} castShadow />

          {/* Profession overlay robe if active */}
          {professionMaterial && (
            <mesh position={[0, -3.25, 0]} scale={[1.04, 1.04, 1.04]} geometry={geometries.robe} material={professionMaterial} />
          )}
        </group>

        {/* Anatomically Correct Folded Arms: Sleeves hang from shoulders y=0..-8, crossbar connects bottoms at y=-6 */}
        <group ref={armsRef} position={[0, 20, -1]} rotation={[-0.75, 0, 0]}>
          {/* Middle horizontal crossbar (8x4x4) connecting lower sleeves */}
          <mesh position={[0, -6, -2]} geometry={geometries.armMiddle} material={villagerMaterial} castShadow />
          {/* Left Sleeve (4x8x4) hanging down from shoulder */}
          <mesh position={[6, -4, -1]} geometry={geometries.armSleeveL} material={villagerMaterial} castShadow />
          {/* Right Sleeve (4x8x4) hanging down from shoulder */}
          <mesh position={[-6, -4, -1]} geometry={geometries.armSleeveR} material={villagerMaterial} castShadow />

          {/* Profession overlay on arms if active */}
          {professionMaterial && (
            <>
              <mesh position={[0, -6, -2]} scale={[1.05, 1.05, 1.05]} geometry={geometries.armMiddle} material={professionMaterial} />
              <mesh position={[6, -4, -1]} scale={[1.05, 1.05, 1.05]} geometry={geometries.armSleeveL} material={professionMaterial} />
              <mesh position={[-6, -4, -1]} scale={[1.05, 1.05, 1.05]} geometry={geometries.armSleeveR} material={professionMaterial} />
            </>
          )}
        </group>

        {/* Head Pivot at Neck y=24 */}
        <group ref={headRef} position={[0, 24, 0]}>
          {/* Head Box (8x10x8, center at y=5) */}
          <mesh position={[0, 5, 0]} geometry={geometries.head} material={villagerMaterial} castShadow receiveShadow />
          {/* 3D Protruding Nose (2x4x2, protruding forward at z=5) */}
          <mesh position={[0, 2.5, 5]} geometry={geometries.nose} material={villagerMaterial} castShadow />

          {/* Profession headwear (e.g. librarian spectacles & hat, mason bandana) */}
          {professionMaterial && (
            <mesh position={[0, 5, 0]} geometry={geometries.headOverlay} material={professionMaterial} />
          )}
        </group>
      </group>
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
      headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, mouse.x * 0.4, 5, delta);
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
      <group ref={headRef} position={[0, 48, 0]}>
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

      {/* Slender Body (6x18x4, center at y=39) */}
      <mesh position={[0, 39, 0]} material={endermanMaterial} castShadow>
        <boxGeometry args={[6, 18, 4]} />
      </mesh>

      {/* Long Slender Arms (2x30x2, shoulders at y=48, center at y=33) */}
      <mesh position={[-4, 33, 0]} material={endermanMaterial} castShadow>
        <boxGeometry args={[2, 30, 2]} />
      </mesh>
      <mesh position={[4, 33, 0]} material={endermanMaterial} castShadow>
        <boxGeometry args={[2, 30, 2]} />
      </mesh>

      {/* Long Slender Legs (2x30x2, grounded flush at y=0, center at y=15) */}
      <mesh position={[-1.5, 15, 0]} material={endermanMaterial} castShadow>
        <boxGeometry args={[2, 30, 2]} />
      </mesh>
      <mesh position={[1.5, 15, 0]} material={endermanMaterial} castShadow>
        <boxGeometry args={[2, 30, 2]} />
      </mesh>
    </Interactable>
  );
};

/**
 * 3D Authentic Minecraft Axolotl (Lucy Pink) with 64x64 Box UV Mappings and Natural Aquatic Swimming
 */
export const Axolotl: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 0.055 }) => {
  const rootRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  // Authentic 64x64 Lucy Pink Axolotl texture
  const axolotlMaterial = useMemo(() => {
    const tex = loadEntityTexture('/texturepack/assets/minecraft/textures/entity/axolotl/axolotl_lucy.png');
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.9,
      metalness: 0.0,
      alphaTest: 0.1,
    });
  }, []);

  const gillMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#E06287',
      roughness: 0.8,
      metalness: 0.0,
    });
  }, []);

  // Precise Mojang 64x64 Axolotl Box Geometries
  const geometries = useMemo(() => {
    const head = createMobBoxGeometry(7, 5, 5, 0, 1, 7, 5, 5, 64, 64);
    const body = createMobBoxGeometry(8, 4, 10, 0, 11, 8, 4, 10, 64, 64);
    const tail = createMobBoxGeometry(1.2, 5, 12, 2, 19, 1, 5, 12, 64, 64);
    const legFrontL = createMobBoxGeometry(3, 4, 3, 2, 13, 3, 4, 3, 64, 64);
    const legFrontR = createMobBoxGeometry(3, 4, 3, 2, 13, 3, 4, 3, 64, 64);
    const legBackL = createMobBoxGeometry(3, 4, 3, 2, 13, 3, 4, 3, 64, 64);
    const legBackR = createMobBoxGeometry(3, 4, 3, 2, 13, 3, 4, 3, 64, 64);
    return { head, body, tail, legFrontL, legFrontR, legBackL, legBackR };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 3.5) * 0.35;
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 2.0) * 0.3;
      bodyRef.current.rotation.y = Math.sin(t * 1.8) * 0.1;
      bodyRef.current.rotation.z = Math.sin(t * 2.5) * 0.05;
    }
  });

  const handleClick = () => {
    sounds.playWaterSplash();
    useStore.getState().recordDiscovery('mob_axolotl_splash', 'MOB', 'Playful Axolotl');
  };

  return (
    <Interactable
      id="mob_axolotl"
      name="Playful Axolotl (Lucy Pink)"
      category="MOB"
      tooltip="Click to splash with the axolotl!"
      onClick={handleClick}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <group ref={rootRef}>
        <group ref={bodyRef}>
          {/* Head: 7x5x5 at z = +4.5 */}
          <mesh position={[0, 0, 4.5]} geometry={geometries.head} material={axolotlMaterial} castShadow />

          {/* 3 Pairs of Pink External Gills/Frills on Left and Right of Head */}
          {[-1, 0, 1].map((gi) => (
            <React.Fragment key={gi}>
              <mesh position={[-4.2, gi * 1.3 + 0.6, 4.0]} material={gillMaterial}>
                <boxGeometry args={[1.8, 0.7, 0.7]} />
              </mesh>
              <mesh position={[4.2, gi * 1.3 + 0.6, 4.0]} material={gillMaterial}>
                <boxGeometry args={[1.8, 0.7, 0.7]} />
              </mesh>
            </React.Fragment>
          ))}

          {/* Body: 8x4x10 centered at z = -2.5 */}
          <mesh position={[0, -0.2, -2.5]} geometry={geometries.body} material={axolotlMaterial} castShadow />

          {/* Dorsal Fin */}
          <mesh position={[0, 2.0, -2.5]} material={gillMaterial}>
            <boxGeometry args={[0.6, 1.4, 9.0]} />
          </mesh>

          {/* Animated Undulating Tail: 1.2x5x12 attached at z = -7.5 */}
          <group ref={tailRef} position={[0, 0, -7.5]}>
            <mesh position={[0, 0, -5.5]} geometry={geometries.tail} material={axolotlMaterial} castShadow />
            <mesh position={[0, 0.8, -5.5]} material={gillMaterial}>
              <boxGeometry args={[0.6, 1.8, 10.5]} />
            </mesh>
          </group>

          {/* 4 Swimming Splayed Legs */}
          <mesh position={[-4.5, -1.2, 0.5]} rotation={[0, 0, -0.3]} geometry={geometries.legFrontL} material={axolotlMaterial} />
          <mesh position={[4.5, -1.2, 0.5]} rotation={[0, 0, 0.3]} geometry={geometries.legFrontR} material={axolotlMaterial} />
          <mesh position={[-4.5, -1.2, -5.5]} rotation={[0, 0, -0.3]} geometry={geometries.legBackL} material={axolotlMaterial} />
          <mesh position={[4.5, -1.2, -5.5]} rotation={[0, 0, 0.3]} geometry={geometries.legBackR} material={axolotlMaterial} />
        </group>
      </group>
    </Interactable>
  );
};
