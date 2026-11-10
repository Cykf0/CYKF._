import React, { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { vanillaAtlas } from './VanillaTextureAtlas';
import { createVanillaBlockGeometry } from './VanillaBlockGeometry';
import { textureManager } from './TextureManager';
import { createMojangLanternGeometry, createMojangTorchGeometry, createMojangWallTorchGeometry, createMojangChainGeometry } from './VanillaModelBuilder';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

/**
 * Canonical 1x1x1 Voxel Block
 */
export const VoxelBlock: React.FC<{
  position: [number, number, number];
  type: string;
  topType?: string;
  sideType?: string;
  bottomType?: string;
  biomeTint?: THREE.ColorRepresentation;
}> = ({ position, type, topType, sideType, bottomType, biomeTint }) => {
  const geometry = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 1,
      height: 1,
      depth: 1,
      textures: {
        all: type,
        top: topType || type,
        side: sideType || type,
        bottom: bottomType || type,
      },
      biomeTint,
    });
  }, [type, topType, sideType, bottomType, biomeTint]);

  const isCutout = type.includes('leaves') || type.includes('glass');
  const material = isCutout ? vanillaAtlas.getCutoutMaterial() : vanillaAtlas.getSolidMaterial();

  return (
    <mesh position={position} geometry={geometry} material={material} castShadow receiveShadow />
  );
};

/**
 * Canonical Voxel Tree built strictly from 1x1x1 log blocks and 1x1x1 leaf cubes
 */
export const VoxelTree: React.FC<{
  position?: [number, number, number];
  trunkHeight?: number;
  type?: 'oak' | 'cherry' | 'spruce';
}> = ({ position = [0, 0, 0], trunkHeight = 5, type = 'oak' }) => {
  const logSide = `${type}_log`;
  const logTop = `${type}_log_top`;
  const leafType = `${type}_leaves`;

  // Compute canonical vanilla canopy offsets
  const leafBlocks = useMemo(() => {
    const blocks: [number, number, number][] = [];
    const topY = trunkHeight;

    // Layer 1 & 2: 5x5 layers with corners removed (at y = topY - 2 and topY - 1)
    for (let ly = topY - 2; ly <= topY - 1; ly++) {
      for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
          // Remove 4 outer corners for authentic rounded voxel crown
          if (Math.abs(x) === 2 && Math.abs(z) === 2) continue;
          if (x === 0 && z === 0 && ly < topY) continue; // occupied by trunk
          blocks.push([x, ly, z]);
        }
      }
    }

    // Layer 3: 3x3 layer at y = topY
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        if (Math.abs(x) === 1 && Math.abs(z) === 1) continue;
        if (x === 0 && z === 0) continue; // trunk top
        blocks.push([x, topY, z]);
      }
    }

    // Layer 4: Plus cross at y = topY + 1
    blocks.push([0, topY + 1, 0]);
    blocks.push([1, topY + 1, 0]);
    blocks.push([-1, topY + 1, 0]);
    blocks.push([0, topY + 1, 1]);
    blocks.push([0, topY + 1, -1]);

    return blocks;
  }, [trunkHeight]);

  return (
    <group position={position}>
      {/* 1x1x1 Log Trunk Blocks */}
      {Array.from({ length: trunkHeight }).map((_, i) => (
        <VoxelBlock
          key={`log_${i}`}
          position={[0, i + 0.5, 0]}
          type={logSide}
          sideType={logSide}
          topType={logTop}
          bottomType={logTop}
        />
      ))}

      {/* 1x1x1 Cutout Leaf Blocks */}
      {leafBlocks.map(([lx, ly, lz], i) => (
        <VoxelBlock
          key={`leaf_${i}`}
          position={[lx, ly + 0.5, lz]}
          type={leafType}
        />
      ))}
    </group>
  );
};

/**
 * Exact Vanilla Minecraft Chest (14x14x14 px) with animated hinged lid & latch
 */
export const VoxelChest: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  initiallyOpen?: boolean;
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0], initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const lidRef = useRef<THREE.Group>(null);

  // Exact vanilla proportions:
  // 1 block = 16 pixels. Chest is inset 1px on all horizontal edges (14x14 px).
  const baseWidth = 14 / 16;  // 0.875
  const baseHeight = 10 / 16; // 0.625
  const lidHeight = 5 / 16;   // 0.3125
  const latchWidth = 2 / 16;  // 0.125
  const latchHeight = 4 / 16; // 0.25
  const latchDepth = 1 / 16;  // 0.0625

  const baseGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: baseWidth,
      height: baseHeight,
      depth: baseWidth,
      textures: {
        all: 'oak_planks',
        top: 'oak_planks',
        side: 'crafting_table_side',
        bottom: 'oak_planks',
      }
    });
  }, []);

  const lidGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: baseWidth,
      height: lidHeight,
      depth: baseWidth,
      textures: 'oak_planks'
    });
  }, []);

  const latchGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: latchWidth,
      height: latchHeight,
      depth: latchDepth,
      textures: 'iron_ore'
    });
  }, []);

  useFrame((_, delta) => {
    if (lidRef.current) {
      const targetAngle = isOpen ? -Math.PI * 0.45 : 0;
      lidRef.current.rotation.x = THREE.MathUtils.damp(lidRef.current.rotation.x, targetAngle, 8, delta);
    }
  });

  const toggleChest = (e: any) => {
    e.stopPropagation();
    if (isOpen) {
      sounds.playChestClose();
    } else {
      sounds.playChestOpen();
    }
    setIsOpen(!isOpen);
    useStore.getState().recordDiscovery('prop_chest_open', 'PROP', 'Treasure Chest');
  };

  return (
    <Interactable
      id="prop_chest"
      name="Treasure Chest"
      category="PROP"
      position={position}
      rotation={rotation}
      onClick={toggleChest}
    >
      <group>
        {/* Chest Base (14x10x14 px) */}
        <mesh position={[0, baseHeight / 2, 0]} geometry={baseGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

        {/* Chest Lid Group (hinged at back top edge) */}
        <group ref={lidRef} position={[0, baseHeight, -baseWidth / 2]}>
          <mesh position={[0, lidHeight / 2, baseWidth / 2]} geometry={lidGeo} material={vanillaAtlas.getSolidMaterial()} castShadow />
          {/* Latch Lock at front */}
          <mesh position={[0, 0, baseWidth + latchDepth / 2]} geometry={latchGeo} material={vanillaAtlas.getSolidMaterial()} />
        </group>
      </group>
    </Interactable>
  );
};

/**
 * Exact Vanilla Enchanting Table (12/16 height = 0.75m)
 */
export const VoxelEnchantingTable: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  const tableGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 1,
      height: 12 / 16,
      depth: 1,
      textures: {
        top: 'redstone_ore',
        side: 'obsidian',
        bottom: 'obsidian'
      }
    });
  }, []);

  const bookRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (bookRef.current) {
      const t = state.clock.getElapsedTime();
      bookRef.current.position.y = 0.75 + 0.35 + Math.sin(t * 2) * 0.05;
      bookRef.current.rotation.y = t * 0.5;
    }
  });

  return (
    <Interactable
      id="prop_enchanting_table"
      name="Enchanting Table"
      category="PROP"
      position={position}
      onClick={() => {
        sounds.playEnchantChime();
        useStore.getState().recordDiscovery('prop_enchanting_table', 'PROP', 'Enchanting Table');
      }}
    >
      <group>
        {/* 12/16 (0.75m) Table Base */}
        <mesh position={[0, 0.75 / 2, 0]} geometry={tableGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

        {/* Floating Spellbook */}
        <group ref={bookRef} position={[0, 1.1, 0]}>
          <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.3, 0.4, 0.04]} />
            <meshStandardMaterial color="#8B1E1E" roughness={1.0} />
          </mesh>
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.3, 0.4, 0.04]} />
            <meshStandardMaterial color="#8B1E1E" roughness={1.0} />
          </mesh>
        </group>
      </group>
    </Interactable>
  );
};

/**
 * Exact Vanilla End Portal Frame (13/16 height = 0.8125m)
 */
export const VoxelEndPortalFrame: React.FC<{
  position: [number, number, number];
  hasEye?: boolean;
}> = ({ position, hasEye = true }) => {
  const frameGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 1,
      height: 13 / 16,
      depth: 1,
      textures: {
        top: 'end_portal_frame_top',
        side: 'end_portal_frame_side',
        bottom: 'end_stone'
      }
    });
  }, []);

  return (
    <group position={position}>
      <mesh position={[0, 0.8125 / 2, 0]} geometry={frameGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />
      {hasEye && (
        <mesh position={[0, 0.8125 + 0.05, 0]}>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshStandardMaterial color="#0A5C43" emissive="#00FF88" emissiveIntensity={0.6} roughness={1.0} />
        </mesh>
      )}
    </group>
  );
};

/**
 * Canonical Mojang Minecraft Torch (2x10x2 px stick with torch texture)
 */
export const VoxelTorch: React.FC<{
  position: [number, number, number];
}> = ({ position }) => {
  const torchGeo = useMemo(() => createMojangTorchGeometry(), []);
  const torchTex = useMemo(() => {
    return textureManager.getTexture('/texturepack/assets/minecraft/textures/block/torch.png');
  }, []);
  const torchMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: torchTex,
      transparent: true,
      alphaTest: 0.1,
      roughness: 1.0,
      metalness: 0.0,
    });
  }, [torchTex]);

  return (
    <group position={position}>
      <mesh geometry={torchGeo} material={torchMat} castShadow />
      <pointLight position={[0, 0.625, 0]} color="#FFAA33" intensity={2.5} distance={10} decay={2} />
    </group>
  );
};

/**
 * Canonical Mojang Minecraft Wall Torch with -22.5 deg tilt
 */
export const VoxelWallTorch: React.FC<{
  position: [number, number, number];
  rotationY?: number;
}> = ({ position, rotationY = 0 }) => {
  const wallTorchGeo = useMemo(() => createMojangWallTorchGeometry(), []);
  const torchTex = useMemo(() => {
    return textureManager.getTexture('/texturepack/assets/minecraft/textures/block/torch.png');
  }, []);
  const torchMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: torchTex,
      transparent: true,
      alphaTest: 0.1,
      roughness: 1.0,
      metalness: 0.0,
    });
  }, [torchTex]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={wallTorchGeo} material={torchMat} castShadow />
      <pointLight position={[0.2, 0.65, 0]} color="#FFAA33" intensity={2.5} distance={10} decay={2} />
    </group>
  );
};

/**
 * Square Voxel Sunbeam (Replaces smooth cylinder)
 */
export const VoxelLightBeam: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  opacity?: number;
}> = ({
  position,
  rotation = [0.35, 0, -0.65],
  scale = [1, 1, 1],
  color = '#FFE6A0',
  opacity = 0.18,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * (1.0 + Math.sin(t * 1.5) * 0.06);
    }
  });

  return (
    <Interactable
      id="env_light_beam"
      name="Sunbeam God Ray"
      category="LIGHT_SOURCE"
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* Authentic Square Prism Beam (Zero curves) */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 12, 1.5]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </Interactable>
  );
};

// ---------------------------------------------------------------------------
// Advanced Shader-Pack Components (BSL / Complementary Look)
// ---------------------------------------------------------------------------

/**
 * Exact Vanilla Lantern with 7x9 px cage, hanging iron chain, lit core, and warm point light
 */
/**
 * Exact Mojang Minecraft Lantern (template_lantern.json)
 * - Authentic 6x7x6 cage, 4x2x4 cap, and crossed loop handle
 * - Samples single 16x16 frame via TextureManager (cures 3-frame animated strip stretching)
 * - Base sits flush at Y=0 when standing (hanging=false)
 */
export const VanillaLantern: React.FC<{
  position: [number, number, number];
  hanging?: boolean;
  chainLinks?: number;
  isSoul?: boolean;
}> = ({ position, hanging = false, chainLinks = 1, isSoul = false }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const lanternGroupRef = useRef<THREE.Group>(null);
  const seed = useMemo(() => Math.random() * 50, []);

  const chainGeo = useMemo(() => createMojangChainGeometry(0.5), []);
  const chainTex = useMemo(() => {
    return textureManager.getTexture('/texturepack/assets/minecraft/textures/block/iron_chain.png');
  }, []);

  const lanternGeo = useMemo(() => createMojangLanternGeometry(hanging), [hanging]);

  const lanternTex = useMemo(() => {
    const path = isSoul
      ? '/texturepack/assets/minecraft/textures/block/soul_lantern.png'
      : '/texturepack/assets/minecraft/textures/block/lantern.png';
    return textureManager.getStaticFrame(path, 0);
  }, [isSoul]);

  const lanternMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: lanternTex,
      transparent: true,
      alphaTest: 0.1,
      roughness: 0.9,
      metalness: 0.1,
    });
  }, [lanternTex]);

  const chainMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: chainTex,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: true,
      side: THREE.DoubleSide,
      roughness: 1.0,
      metalness: 0.2,
    });
  }, [chainTex]);

  const lightColor = isSoul ? '#00E5FF' : '#FFAE38';
  const baseIntensity = isSoul ? 3.0 : 3.8;

  // Natural warm flame flicker and subtle breeze sway
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (lightRef.current) {
      const flicker = 1.0 + Math.sin(t * 11.3 + seed) * 0.08 + Math.sin(t * 17.7 + seed) * 0.05 + Math.sin(t * 29.1 + seed) * 0.03;
      lightRef.current.intensity = baseIntensity * flicker;
    }
    if (hanging && lanternGroupRef.current) {
      lanternGroupRef.current.rotation.z = Math.sin(t * 1.4 + seed) * 0.025;
      lanternGroupRef.current.rotation.x = Math.cos(t * 1.1 + seed) * 0.02;
    }
  });

  const coreY = (hanging ? 0.0625 : 0) + 0.22;

  return (
    <group position={position}>
      {/* Hanging Chain links */}
      {hanging && Array.from({ length: chainLinks }).map((_, i) => (
        <mesh
          key={i}
          position={[0, (i + 0.5) * 0.5, 0]}
          geometry={chainGeo}
          material={chainMat}
        />
      ))}

      <group ref={lanternGroupRef}>
        {/* Canonical Mojang Geometry (Cage, Cap, Loop Handle) */}
        <mesh geometry={lanternGeo} material={lanternMat} castShadow receiveShadow />

        {/* Emissive Core inside */}
        <mesh position={[0, coreY, 0]}>
          <boxGeometry args={[0.22, 0.28, 0.22]} />
          <meshBasicMaterial color={lightColor} />
        </mesh>

        {/* Real warm dynamic point light with organic flicker */}
        <pointLight
          ref={lightRef}
          position={[0, coreY, 0]}
          color={lightColor}
          intensity={baseIntensity}
          distance={11}
          decay={2}
          castShadow
        />
      </group>
    </group>
  );
};

/**
 * Exact Vanilla Lily Pad: 14x14 px flat quad resting 1/64m above water
 */
export const VanillaLilyPad: React.FC<{
  position: [number, number, number];
  rotationY?: number;
}> = ({ position, rotationY = 0 }) => {
  const tex = useMemo(() => {
    const l = new THREE.TextureLoader();
    const t = l.load('/texturepack/assets/minecraft/textures/block/lily_pad.png');
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rotationY]}>
      <planeGeometry args={[0.875, 0.875]} />
      <meshStandardMaterial
        map={tex}
        color="#32883a"
        transparent
        alphaTest={0.5}
        depthWrite
        roughness={1.0}
        metalness={0.0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/**
 * Hanging Cave Vines with glowing Amber Glow Berries
 */
export const VanillaCaveVines: React.FC<{
  position: [number, number, number];
  segments?: number;
  hasBerries?: boolean;
}> = ({ position, segments = 3, hasBerries = true }) => {
  const litTex = useMemo(() => {
    const l = new THREE.TextureLoader();
    const t = l.load('/texturepack/assets/minecraft/textures/block/cave_vines_lit.png');
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const plantTex = useMemo(() => {
    const l = new THREE.TextureLoader();
    const t = l.load('/texturepack/assets/minecraft/textures/block/cave_vines.png');
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  return (
    <group position={position}>
      {Array.from({ length: segments }).map((_, i) => {
        const isTip = i === segments - 1;
        const useLit = hasBerries && (i === 1 || isTip);
        const tex = useLit ? litTex : plantTex;
        const segY = -i * 0.9;

        return (
          <group key={i} position={[0, segY, 0]}>
            {/* Crossed quads for vine stem */}
            <mesh>
              <planeGeometry args={[0.9, 0.9]} />
              <meshStandardMaterial map={tex} transparent alphaTest={0.5} depthWrite side={THREE.DoubleSide} roughness={1} />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[0.9, 0.9]} />
              <meshStandardMaterial map={tex} transparent alphaTest={0.5} depthWrite side={THREE.DoubleSide} roughness={1} />
            </mesh>

            {/* Glowing warm point light on berry clusters */}
            {useLit && (
              <pointLight position={[0, 0, 0]} color="#FF9E00" intensity={1.8} distance={6} decay={2} />
            )}
          </group>
        );
      })}
    </group>
  );
};

/**
 * Hanging Cave Wall Vines (Clinging to stone bricks)
 */
export const VanillaWallVines: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
}> = ({ position, rotation = [0, 0, 0], width = 1, height = 3 }) => {
  const vineTex = useMemo(() => {
    const l = new THREE.TextureLoader();
    const t = l.load('/texturepack/assets/minecraft/textures/block/vine.png');
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(width, height);
    return t;
  }, [width, height]);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={vineTex}
        color="#48b518"
        transparent
        alphaTest={0.5}
        depthWrite
        roughness={1}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/**
 * Volumetric God Ray with exponential vertical dissipation & soft radial falloff (BSL/Complementary look)
 */
export const VolumetricGodRay: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  opacity?: number;
}> = ({
  position,
  rotation = [0.25, 0, -0.15],
  scale = [2.2, 1.2, 2.2],
  color = '#FFF8D6',
  opacity = 0.26,
}) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const godRayShader = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vLocalPosition;
        void main() {
          vLocalPosition = position;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uTime;
        varying vec3 vWorldPosition;
        varying vec3 vLocalPosition;

        void main() {
          // Soft radial falloff from beam axis
          float radius = length(vLocalPosition.xz) / 1.0;
          float radial = smoothstep(1.0, 0.05, radius);

          // Exponential vertical falloff (strongest at ceiling opening, soft at floor)
          float normY = clamp((vLocalPosition.y + 5.0) / 10.0, 0.0, 1.0);
          float vertical = pow(normY, 0.7) * smoothstep(0.0, 0.2, normY);

          // Living atmospheric light drift
          float drift = 0.9 + 0.1 * sin(vLocalPosition.y * 2.5 - uTime * 1.8) * cos(vLocalPosition.x * 2.5 + uTime * 1.2);

          float a = radial * vertical * uOpacity * drift;
          vec3 col = mix(uColor, vec3(1.0, 0.95, 0.78), normY * 0.4);
          gl_FragColor = vec4(col * a, a);
        }
      `,
    });
  }, [color, opacity]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <boxGeometry args={[1.8, 10, 1.8]} />
        <primitive object={godRayShader} ref={matRef} attach="material" />
      </mesh>
    </group>
  );
};

/**
 * Exact Vanilla Wooden Fence Post & Connecting Rails
 */
export const VanillaWoodenFence: React.FC<{
  position: [number, number, number];
  woodType?: 'oak' | 'dark_oak' | 'spruce';
  connectX?: boolean;
  connectZ?: boolean;
}> = ({ position, woodType = 'dark_oak', connectX = false, connectZ = false }) => {
  const plankTex = `${woodType}_planks`;
  const postGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 0.25,
      height: 1.0,
      depth: 0.25,
      textures: plankTex
    });
  }, [plankTex]);

  const railGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 0.125,
      height: 0.1875,
      depth: 0.75,
      textures: plankTex
    });
  }, [plankTex]);

  return (
    <group position={position}>
      {/* 4x16x4 px Center Post */}
      <mesh position={[0, 0.5, 0]} geometry={postGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

      {/* Crossrails in Z direction */}
      {connectZ && (
        <>
          <mesh position={[0, 0.375, 0.4375]} geometry={railGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />
          <mesh position={[0, 0.75, 0.4375]} geometry={railGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />
        </>
      )}

      {/* Crossrails in X direction */}
      {connectX && (
        <group rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0.375, 0.4375]} geometry={railGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />
          <mesh position={[0, 0.75, 0.4375]} geometry={railGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />
        </group>
      )}
    </group>
  );
};

/**
 * Iconic Foreground Carriage Lamp Post (Reference Match)
 * - Stack of stone bricks / cobblestone base pedestal
 * - Dark oak post
 * - Carriage lantern housing on top with glowing amber windows and warm point light
 */
export const VanillaLampPost: React.FC<{
  position: [number, number, number];
  height?: number;
}> = ({ position, height = 2.4 }) => {
  const stoneGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 0.875,
      height: 0.625,
      depth: 0.875,
      textures: 'stone_bricks'
    });
  }, []);

  const postGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 0.3125,
      height: height - 0.625,
      depth: 0.3125,
      textures: 'dark_oak_log'
    });
  }, [height]);

  const capGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 0.6875,
      height: 0.1875,
      depth: 0.6875,
      textures: 'dark_oak_planks'
    });
  }, []);

  const strutGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 0.08,
      height: 0.625,
      depth: 0.08,
      textures: 'dark_oak_planks',
    });
  }, []);

  const roofGeo1 = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 0.65,
      height: 0.125,
      depth: 0.65,
      textures: 'dark_oak_planks',
    });
  }, []);

  const roofGeo2 = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 0.4,
      height: 0.08,
      depth: 0.4,
      textures: 'dark_oak_planks',
    });
  }, []);

  const lanternY = height + 0.35;

  return (
    <group position={position}>
      {/* 1. Stone Brick Base Pedestal */}
      <mesh position={[0, 0.625 / 2, 0]} geometry={stoneGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

      {/* 2. Dark Oak Log Post */}
      <mesh position={[0, 0.625 + (height - 0.625) / 2, 0]} geometry={postGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

      {/* 3. Lantern Housing Mount Cap */}
      <mesh position={[0, height, 0]} geometry={capGeo} material={vanillaAtlas.getSolidMaterial()} castShadow />

      {/* 4. Large Carriage Lantern Housing */}
      <group position={[0, lanternY, 0]}>
        {/* Amber Glowing Core Windows */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.625, 0.5]} />
          <meshStandardMaterial
            color="#FFA834"
            emissive="#FF8B1F"
            emissiveIntensity={3.2}
            roughness={0.9}
          />
        </mesh>

        {/* 4 Corner Dark Oak Struts */}
        {[-0.22, 0.22].map((cx) =>
          [-0.22, 0.22].map((cz) => (
            <mesh key={`${cx}_${cz}`} position={[cx, 0, cz]} geometry={strutGeo} material={vanillaAtlas.getSolidMaterial()} castShadow />
          ))
        )}

        {/* Stepped Dark Oak Roof Cap */}
        <mesh position={[0, 0.35, 0]} geometry={roofGeo1} material={vanillaAtlas.getSolidMaterial()} castShadow />
        <mesh position={[0, 0.44, 0]} geometry={roofGeo2} material={vanillaAtlas.getSolidMaterial()} castShadow />

        {/* Ring handle on top */}
        <mesh position={[0, 0.52, 0]}>
          <boxGeometry args={[0.15, 0.08, 0.05]} />
          <meshStandardMaterial color="#1A1816" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Warm dynamic point light illuminating garden & player */}
        <pointLight position={[0, 0, 0]} color="#FFAE38" intensity={5.2} distance={14} decay={2} castShadow />
      </group>
    </group>
  );
};

/**
 * Canonical Vanilla Sunflower
 * 2-block high flower with angled golden flower head facing the sun
 */
export const VanillaSunflower: React.FC<{
  position: [number, number, number];
  rotationY?: number;
}> = ({ position, rotationY = 0 }) => {
  const frontTex = useMemo(() => {
    const l = new THREE.TextureLoader();
    const t = l.load('/texturepack/assets/minecraft/textures/block/sunflower_front.png');
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const bottomTex = useMemo(() => {
    const l = new THREE.TextureLoader();
    const t = l.load('/texturepack/assets/minecraft/textures/block/sunflower_bottom.png');
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const topTex = useMemo(() => {
    const l = new THREE.TextureLoader();
    const t = l.load('/texturepack/assets/minecraft/textures/block/sunflower_top.png');
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Lower stem crossed quads */}
      <mesh position={[0, 0.5, 0]}>
        <planeGeometry args={[0.8, 1.0]} />
        <meshStandardMaterial map={bottomTex} transparent alphaTest={0.5} depthWrite side={THREE.DoubleSide} roughness={1} />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 1.0]} />
        <meshStandardMaterial map={bottomTex} transparent alphaTest={0.5} depthWrite side={THREE.DoubleSide} roughness={1} />
      </mesh>

      {/* Upper stem crossed quads */}
      <mesh position={[0, 1.35, 0]}>
        <planeGeometry args={[0.8, 0.7]} />
        <meshStandardMaterial map={topTex} transparent alphaTest={0.5} depthWrite side={THREE.DoubleSide} roughness={1} />
      </mesh>

      {/* Sunflower angled face disk facing the sun */}
      <mesh position={[0, 1.45, 0.2]} rotation={[-0.35, 0, 0]}>
        <planeGeometry args={[0.85, 0.85]} />
        <meshStandardMaterial map={frontTex} transparent alphaTest={0.5} depthWrite side={THREE.DoubleSide} roughness={1} />
      </mesh>
    </group>
  );
};

/**
 * Crossed Quads Wildflower / Tall Grass / Fern
 */
export const VanillaCrossedPlant: React.FC<{
  position: [number, number, number];
  type?: 'dandelion' | 'poppy' | 'oxeye_daisy' | 'cornflower' | 'allium' | 'fern' | 'short_grass';
  scale?: number;
}> = ({ position, type = 'dandelion', scale = 1.0 }) => {
  const tex = useMemo(() => {
    const l = new THREE.TextureLoader();
    const t = l.load(`/texturepack/assets/minecraft/textures/block/${type}.png`);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [type]);

  const isGreenPlant = type === 'fern' || type === 'short_grass';

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial
          map={tex}
          color={isGreenPlant ? '#79c05a' : '#ffffff'}
          transparent
          alphaTest={0.5}
          depthWrite
          side={THREE.DoubleSide}
          roughness={1}
        />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[0, -Math.PI / 4, 0]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial
          map={tex}
          color={isGreenPlant ? '#79c05a' : '#ffffff'}
          transparent
          alphaTest={0.5}
          depthWrite
          side={THREE.DoubleSide}
          roughness={1}
        />
      </mesh>
    </group>
  );
};

/**
 * Distant Village House on the Right Shore (Exact Reference Match)
 * Built with dark oak logs, oak planks, cobblestone base, and pitched stepped roof
 */
export const VillageCottageHouse: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  width?: number;
  depth?: number;
}> = ({ position, rotationY = 0, width = 4, depth = 5 }) => {
  const foundationGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width,
      height: 1.0,
      depth,
      textures: 'cobblestone',
    });
  }, [width, depth]);

  const wallsGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: width - 0.2,
      height: 2.0,
      depth: depth - 0.2,
      textures: 'oak_planks',
    });
  }, [width, depth]);

  const roofEavesGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: width + 0.8,
      height: 0.6,
      depth: depth + 0.8,
      textures: 'dark_oak_planks',
    });
  }, [width, depth]);

  const roofMidGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: width - 0.6,
      height: 0.6,
      depth: depth + 0.8,
      textures: 'dark_oak_planks',
    });
  }, [width, depth]);

  const roofRidgeGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: width - 1.8,
      height: 0.5,
      depth: depth + 0.8,
      textures: 'dark_oak_planks',
    });
  }, [width, depth]);

  const mat = vanillaAtlas.getSolidMaterial();

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Cobblestone Foundation */}
      <mesh position={[0, 0.5, 0]} geometry={foundationGeo} material={mat} castShadow receiveShadow />

      {/* Oak Plank Walls */}
      <mesh position={[0, 2.0, 0]} geometry={wallsGeo} material={mat} castShadow receiveShadow />

      {/* Glowing Warm Window */}
      <mesh position={[0, 2.0, depth / 2 + 0.05]}>
        <boxGeometry args={[1.0, 1.0, 0.1]} />
        <meshStandardMaterial color="#FFB03B" emissive="#FF8A00" emissiveIntensity={2.5} />
      </mesh>
      <pointLight position={[0, 2.0, depth / 2 + 0.5]} color="#FF9E2A" intensity={1.8} distance={8} decay={2} />

      {/* Stepped Pitched Roof */}
      <group position={[0, 3.2, 0]}>
        <mesh position={[0, 0.3, 0]} geometry={roofEavesGeo} material={mat} castShadow />
        <mesh position={[0, 0.8, 0]} geometry={roofMidGeo} material={mat} castShadow />
        <mesh position={[0, 1.3, 0]} geometry={roofRidgeGeo} material={mat} castShadow />
      </group>
    </group>
  );
};

/**
 * Canonical Tall Vanilla Spruce Tree (Tiered conical evergreen with air gaps)
 */
export const TallSpruceTree: React.FC<{
  position?: [number, number, number];
  trunkHeight?: number;
}> = ({ position = [0, 0, 0], trunkHeight = 10 }) => {
  const leafBlocks = useMemo(() => {
    const blocks: [number, number, number][] = [];
    const topY = trunkHeight;

    // Bare trunk at bottom: Y = 0, 1, 2 (no leaves)

    // Tier 1 (Y = topY - 7): 5x5 plus cross
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (Math.abs(x) === 2 && Math.abs(z) === 2) continue;
        if (x === 0 && z === 0) continue;
        blocks.push([x, topY - 7, z]);
      }
    }

    // Tier 2 (Y = topY - 6): 3x3 plus cross
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        if (Math.abs(x) === 1 && Math.abs(z) === 1) continue;
        if (x === 0 && z === 0) continue;
        blocks.push([x, topY - 6, z]);
      }
    }

    // Tier 3 (Y = topY - 5): 5x5 plus cross
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (Math.abs(x) === 2 && Math.abs(z) === 2) continue;
        if (x === 0 && z === 0) continue;
        blocks.push([x, topY - 5, z]);
      }
    }

    // Tier 4 (Y = topY - 4): 3x3 plus cross
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        if (Math.abs(x) === 1 && Math.abs(z) === 1) continue;
        if (x === 0 && z === 0) continue;
        blocks.push([x, topY - 4, z]);
      }
    }

    // Tier 5 (Y = topY - 3): 3x3 plus cross
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        if (Math.abs(x) === 1 && Math.abs(z) === 1) continue;
        if (x === 0 && z === 0) continue;
        blocks.push([x, topY - 3, z]);
      }
    }

    // Tier 6 (Y = topY - 2): plus shape
    blocks.push([1, topY - 2, 0]);
    blocks.push([-1, topY - 2, 0]);
    blocks.push([0, topY - 2, 1]);
    blocks.push([0, topY - 2, -1]);

    // Tier 7 (Y = topY - 1): plus shape
    blocks.push([1, topY - 1, 0]);
    blocks.push([-1, topY - 1, 0]);
    blocks.push([0, topY - 1, 1]);
    blocks.push([0, topY - 1, -1]);

    // Pinnacle Tip (Y = topY, topY + 1): 1 leaf cube
    blocks.push([0, topY, 0]);
    blocks.push([0, topY + 1, 0]);

    return blocks;
  }, [trunkHeight]);

  return (
    <group position={position}>
      {/* Stacked 1x1x1 Spruce Log Trunk */}
      {Array.from({ length: trunkHeight }).map((_, i) => (
        <VoxelBlock
          key={`log_${i}`}
          position={[0, i + 0.5, 0]}
          type="spruce_log"
          sideType="spruce_log"
          topType="spruce_log_top"
          bottomType="spruce_log_top"
        />
      ))}

      {/* 1x1x1 Spruce Leaves */}
      {leafBlocks.map(([lx, ly, lz], i) => (
        <VoxelBlock
          key={`leaf_${i}`}
          position={[lx, ly + 0.5, lz]}
          type="spruce_leaves"
        />
      ))}
    </group>
  );
};

/**
 * Foreground Water Cattail Reeds (Exact Reference Match)
 * Brown pixel heads with cream/white tips on green stalk
 */
export const VanillaCattails: React.FC<{
  position: [number, number, number];
  height?: number;
}> = ({ position, height = 1.6 }) => {
  return (
    <group position={position}>
      {/* Green Reeds Stalk (Crossed Quads) */}
      <mesh position={[0, height * 0.4, 0]}>
        <planeGeometry args={[0.35, height * 0.8]} />
        <meshStandardMaterial color="#4A7528" roughness={1.0} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, height * 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.35, height * 0.8]} />
        <meshStandardMaterial color="#4A7528" roughness={1.0} side={THREE.DoubleSide} />
      </mesh>

      {/* Brown Fuzzy Cattail Head */}
      <mesh position={[0, height * 0.72, 0]} castShadow>
        <boxGeometry args={[0.16, 0.42, 0.16]} />
        <meshStandardMaterial color="#5C361A" roughness={1.0} />
      </mesh>

      {/* Fluffy Cream Tip on Top */}
      <mesh position={[0, height * 0.72 + 0.24, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.12]} />
        <meshStandardMaterial color="#E0D2B4" roughness={1.0} />
      </mesh>
    </group>
  );
};

/**
 * Overhanging Leaf Canopy in Top-Left Foreground Corner (Reference Match)
 * Shows large crisp 16x16 pixel texture framing the camera view
 */
export const OverhangingCanopy: React.FC<{
  position?: [number, number, number];
}> = ({ position = [-2.2, 2.8, 3.8] }) => {
  return (
    <group position={position}>
      <VoxelBlock position={[0, 0, 0]} type="spruce_leaves" />
      <VoxelBlock position={[1, 0, 0]} type="spruce_leaves" />
      <VoxelBlock position={[0, -1, 0]} type="spruce_leaves" />
      <VoxelBlock position={[1, -1, 0]} type="spruce_leaves" />
      <VoxelBlock position={[0, 0, -1]} type="spruce_leaves" />
      <VoxelBlock position={[-1, 0, 0]} type="spruce_leaves" />
      <VoxelBlock position={[2, 0, 0]} type="spruce_leaves" />
      <VoxelBlock position={[1, -2, 0]} type="spruce_leaves" />
    </group>
  );
};
