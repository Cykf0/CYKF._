import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { sounds } from '../audio/soundManager';
import { Interactable } from '../interaction/Interactable';
import { useStore } from '../store';
import { vanillaAtlas } from './VanillaTextureAtlas';
import { textureManager } from './TextureManager';
import { createVanillaBlockGeometry } from './VanillaBlockGeometry';

/**
 * Helper to create crisp NearestFilter entity texture
 */
function createEntityTexture(name: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  return vanillaAtlas.getStandaloneTexture(`${name}_${width}x${height}`, (ctx: CanvasRenderingContext2D) => {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx);
  });
}

/**
 * 3D Interactive Minecraft Chest with animated open lid & authentic vanilla texture
 */
export const Chest3D: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  initiallyOpen?: boolean;
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0], initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const lidRef = useRef<THREE.Group>(null);

  // Vanilla Chest Texture (Wood planks + dark iron bands)
  const chestWoodMaterial = useMemo(() => {
    const tex = createEntityTexture('chest_wood', 16, 16, (ctx) => {
      const wood = ['#a06935', '#8b562b', '#724420', '#b87c44'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const isIron = y === 0 || y === 15 || x === 0 || x === 15;
          ctx.fillStyle = isIron ? '#2b2621' : wood[(x * 7 + y * 13) % wood.length];
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

  // Silver Latch Material
  const latchMaterial = useMemo(() => {
    const tex = createEntityTexture('chest_latch', 4, 8, (ctx) => {
      const silver = ['#e6e6e6', '#cccccc', '#999999', '#777777'];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 4; x++) {
          ctx.fillStyle = (y >= 4) ? '#333333' : silver[(x + y) % silver.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.8,
      metalness: 0.2,
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
      {/* Chest Base (14x10x14 voxel box = 0.875 x 0.625 x 0.875) */}
      <mesh position={[0, 0.3125, 0]} material={chestWoodMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.875, 0.625, 0.875]} />
      </mesh>

      {/* Base Inner Dark Hole */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.75, 0.55, 0.75]} />
        <meshBasicMaterial color="#111111" />
      </mesh>

      {/* Chest Animated Lid (Hinged at back z=-0.4375, y=0.625) */}
      <group ref={lidRef} position={[0, 0.625, -0.4375]}>
        {/* Lid Top Box (14x5x14 voxel box = 0.875 x 0.3125 x 0.875) */}
        <mesh position={[0, 0.15625, 0.4375]} material={chestWoodMaterial} castShadow>
          <boxGeometry args={[0.875, 0.3125, 0.875]} />
        </mesh>
        {/* Silver Latch at front (2x4x1 voxel box = 0.125 x 0.25 x 0.0625) */}
        <mesh position={[0, 0.02, 0.875 + 0.03125]} material={latchMaterial} castShadow>
          <boxGeometry args={[0.125, 0.25, 0.0625]} />
        </mesh>
      </group>
    </Interactable>
  );
};

/**
 * 3D Enchanting Table with Floating Spellbook and Glyph Particles
 */
export const EnchantingTable3D: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  const bookRef = useRef<THREE.Group>(null);
  const leftPageRef = useRef<THREE.Group>(null);
  const rightPageRef = useRef<THREE.Group>(null);
  const glyphsRef = useRef<THREE.Points>(null);

  // Exact Mojang Enchanting Table block geometry (12/16m = 0.75m high)
  const tableGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 1.0,
      height: 12 / 16,
      depth: 1.0,
      textures: {
        top: 'enchanting_table_top',
        side: 'enchanting_table_side',
        bottom: 'enchanting_table_bottom',
      },
    });
  }, []);

  // Generate glyph particle positions
  const glyphParticles = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 1.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.5 + Math.random() * 1.8;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (bookRef.current) {
      bookRef.current.position.y = 1.3 + Math.sin(t * 2) * 0.08;
      bookRef.current.rotation.y = t * 0.5;
    }
    if (leftPageRef.current && rightPageRef.current) {
      leftPageRef.current.rotation.y = -0.4 + Math.sin(t * 4) * 0.05;
      rightPageRef.current.rotation.y = 0.4 - Math.sin(t * 4) * 0.05;
    }
    if (glyphsRef.current) {
      glyphsRef.current.rotation.y = t * 0.2;
    }
  });

  const handleTableClick = () => {
    sounds.playEnchantChime();
    useStore.getState().recordDiscovery('prop_enchanting_table', 'PROP', 'Enchanting Table');
  };

  // Authentic Minecraft Open Book Materials
  const pageMaterial = useMemo(() => {
    const tex = vanillaAtlas.getStandaloneTexture('enchanting_table_book_page', (ctx) => {
      ctx.fillStyle = '#F5EBE0';
      ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = '#CDB49B';
      ctx.lineWidth = 2;
      ctx.strokeRect(3, 3, 58, 58);
      ctx.fillStyle = '#8E24AA';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('ᔑ ʖ ᓵ ↸', 6, 16);
      ctx.fillText('ᒷ ⎓ ᡤ ㄏ', 6, 28);
      ctx.fillText('╎ ㄐ ꖌ ꖎ', 6, 40);
      ctx.fillText('ᒲ リ 𝙹 ∷', 6, 52);
    });
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.85,
      metalness: 0.0,
    });
  }, []);

  const leatherCoverMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#6E1B1B',
      roughness: 0.8,
      metalness: 0.05,
    });
  }, []);

  return (
    <Interactable
      id="prop_enchanting_table"
      name="Enchanting Table"
      category="PROP"
      position={position}
      onClick={handleTableClick}
    >
      {/* Exact 12/16 (0.75m) Canonical Minecraft Enchanting Table */}
      <mesh position={[0, 0.375, 0]} geometry={tableGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

      {/* Purple Mystical Point Light */}
      <pointLight color="#B388FF" intensity={3.5} distance={12} decay={2} position={[0, 1.5, 0]} />

      {/* Floating Open Book */}
      <group
        ref={bookRef}
        position={[0, 1.3, 0]}
        scale={0.18}
      >
        {/* Leather Spine */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 3.2, 0.4]} />
          <meshStandardMaterial color="#4A0E0E" roughness={0.8} />
        </mesh>

        {/* Left Page & Leather Backing */}
        <group ref={leftPageRef} position={[-0.25, 0, 0]} rotation={[0, -0.4, 0]}>
          {/* Leather Cover */}
          <mesh position={[-1.2, 0, -0.06]} material={leatherCoverMaterial}>
            <boxGeometry args={[2.4, 3.1, 0.06]} />
          </mesh>
          {/* Inscribed Page */}
          <mesh position={[-1.2, 0, 0.02]} material={pageMaterial}>
            <boxGeometry args={[2.3, 2.9, 0.08]} />
          </mesh>
        </group>

        {/* Right Page & Leather Backing */}
        <group ref={rightPageRef} position={[0.25, 0, 0]} rotation={[0, 0.4, 0]}>
          {/* Leather Cover */}
          <mesh position={[1.2, 0, -0.06]} material={leatherCoverMaterial}>
            <boxGeometry args={[2.4, 3.1, 0.06]} />
          </mesh>
          {/* Inscribed Page */}
          <mesh position={[1.2, 0, 0.02]} material={pageMaterial}>
            <boxGeometry args={[2.3, 2.9, 0.08]} />
          </mesh>
        </group>
      </group>

      {/* Hovering Arcane Glyph Particles */}
      <points ref={glyphsRef} position={[0, 0.5, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[glyphParticles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#CC66FF" transparent opacity={0.85} />
      </points>
    </Interactable>
  );
};

/**
 * 3D Campfire with animated fire and smoke particles (Snowy Peaks Scene)
 */
export const Campfire3D: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  const fireRef = useRef<THREE.Group>(null);
  const smokeRef = useRef<THREE.Points>(null);
  const [lit, setLit] = useState(true);

  // Canonical Campfire Log Texture
  const logMaterial = useMemo(() => {
    const tex = textureManager.getTexture('/texturepack/assets/minecraft/textures/block/campfire_log.png');
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 1.0,
      metalness: 0.0,
    });
  }, []);

  // Canonical Campfire Fire Texture (16x16 static frame)
  const fireMaterial = useMemo(() => {
    const tex = textureManager.getStaticFrame('/texturepack/assets/minecraft/textures/block/campfire_fire.png', 0);
    return new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.2,
      side: THREE.DoubleSide,
    });
  }, []);

  const ashMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1a1816',
      roughness: 1.0,
      metalness: 0.0,
    });
  }, []);

  // Smoke particles
  const smokeParticles = useMemo(() => {
    const count = 25;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 1] = 0.5 + (i / count) * 4.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (fireRef.current && lit) {
      fireRef.current.scale.y = 0.9 + Math.sin(t * 12) * 0.15;
    }
    if (smokeRef.current && lit) {
      const positions = smokeRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 25; i++) {
        positions[i * 3 + 1] += 0.02;
        positions[i * 3] += Math.sin(t + i) * 0.005;
        if (positions[i * 3 + 1] > 5) {
          positions[i * 3 + 1] = 0.5;
          positions[i * 3] = (Math.random() - 0.5) * 0.3;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        }
      }
      smokeRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const toggleCampfire = () => {
    if (lit) {
      sounds.playClick();
    } else {
      sounds.playFire();
    }
    setLit(!lit);
    useStore.getState().recordDiscovery('light_campfire_toggle', 'LIGHT_SOURCE', 'Campfire Flame');
  };

  return (
    <Interactable
      id="light_campfire"
      name="Cozy Campfire"
      category="LIGHT_SOURCE"
      position={position}
      onClick={toggleCampfire}
    >
      {/* Dark Ash Bed inside */}
      <mesh position={[0, 0.04, 0]} material={ashMaterial} receiveShadow>
        <boxGeometry args={[0.75, 0.08, 0.75]} />
      </mesh>

      {/* 4 Wooden Logs Base (2 bottom X-aligned, 2 top Z-aligned) */}
      <mesh position={[0, 0.1, 0.3]} material={logMaterial} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.2, 0.2]} />
      </mesh>
      <mesh position={[0, 0.1, -0.3]} material={logMaterial} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.2, 0.2]} />
      </mesh>
      <mesh position={[0.3, 0.2, 0]} material={logMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.2, 1.0]} />
      </mesh>
      <mesh position={[-0.3, 0.2, 0]} material={logMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.2, 1.0]} />
      </mesh>

      {/* Animated Fire Flame Quads */}
      {lit && (
        <>
          <group ref={fireRef} position={[0, 0.25, 0]}>
            <mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
              <planeGeometry args={[0.75, 0.75]} />
              <primitive object={fireMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 0.3, 0]} rotation={[0, -Math.PI / 4, 0]}>
              <planeGeometry args={[0.75, 0.75]} />
              <primitive object={fireMaterial} attach="material" />
            </mesh>
          </group>

          {/* Warm Fire Point Light */}
          <pointLight color="#FF9933" intensity={3.5} distance={15} decay={2} position={[0, 0.8, 0]} />

          {/* Rising Smoke Particles */}
          <points ref={smokeRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[smokeParticles, 3]}
              />
            </bufferGeometry>
            <pointsMaterial size={0.18} color="#DCDCDC" transparent opacity={0.65} />
          </points>
        </>
      )}
    </Interactable>
  );
};

/**
 * 3D End Crystal with Spinning Cubes and Purple Laser (The End Scene)
 */
export const EndCrystal3D: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  const outerCubeRef = useRef<THREE.Mesh>(null);
  const innerCubeRef = useRef<THREE.Mesh>(null);
  const [active, setActive] = useState(true);

  // Bedrock base geometry with canonical texture
  const bedrockGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 1.6,
      height: 0.2,
      depth: 1.6,
      textures: 'bedrock',
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (outerCubeRef.current) {
      outerCubeRef.current.rotation.x = t * 1.2;
      outerCubeRef.current.rotation.y = t * 0.8;
    }
    if (innerCubeRef.current) {
      innerCubeRef.current.rotation.x = -t * 1.5;
      innerCubeRef.current.rotation.y = -t * 1.0;
    }
  });

  const toggleCrystal = () => {
    sounds.playWobble(660);
    setActive(!active);
    useStore.getState().recordDiscovery('light_end_crystal', 'LIGHT_SOURCE', 'Ender Crystal Beam');
  };

  return (
    <Interactable
      id="light_end_crystal"
      name="Ender Crystal"
      category="LIGHT_SOURCE"
      position={position}
      onClick={toggleCrystal}
    >
      {/* Bedrock Base Plate */}
      <mesh position={[0, 0.1, 0]} geometry={bedrockGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* Outer Glass Cube */}
      <mesh ref={outerCubeRef} position={[0, 1.2, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} />
      </mesh>

      {/* Inner Glowing Purple Crystal Cube */}
      <mesh ref={innerCubeRef} position={[0, 1.2, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshBasicMaterial color="#CC44FF" />
      </mesh>

      {/* Vertical Purple Beacon Beam into sky */}
      {active && (
        <>
          <mesh position={[0, 15, 0]}>
            <boxGeometry args={[0.3, 30, 0.3]} />
            <meshBasicMaterial color="#CC44FF" transparent opacity={0.7} />
          </mesh>
          <pointLight color="#D670D6" intensity={4} distance={20} decay={2} position={[0, 2, 0]} />
        </>
      )}
    </Interactable>
  );
};

/**
 * 3D Crafting Table with authentic top, front, and side oak textures
 */
export const CraftingTable3D: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const geo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 1,
      height: 1,
      depth: 1,
      textures: {
        top: 'crafting_table_top',
        side: 'crafting_table_side',
        north: 'crafting_table_side',
        bottom: 'oak_planks',
      },
    });
  }, []);

  return (
    <Interactable
      id="prop_crafting_table"
      name="Artisan Crafting Table"
      category="PROP"
      position={position}
      rotation={rotation}
      onClick={() => {
        sounds.playCraft();
        useStore.getState().setActiveGui('crafting');
      }}
    >
      <mesh position={[0, 0.5, 0]} geometry={geo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />
    </Interactable>
  );
};

/**
 * 3D Sculk Catalyst Block with authentic top and side textures
 */
export const SculkCatalyst3D: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  const geo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 1,
      height: 1,
      depth: 1,
      textures: {
        top: 'sculk_catalyst_top',
        side: 'sculk_catalyst_side',
        bottom: 'sculk_catalyst_side',
      },
    });
  }, []);

  return (
    <Interactable
      id="prop_sculk_catalyst"
      name="Sculk Catalyst"
      category="PROP"
      position={position}
      onClick={() => {
        sounds.playEndermanVwoop();
        useStore.getState().recordDiscovery('sculk_catalyst', 'PROP', 'Soul Catalyst Pulse');
      }}
    >
      <mesh position={[0, 0.5, 0]} geometry={geo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />
      <pointLight position={[0, 1.2, 0]} color="#00FFFF" intensity={2.2} distance={8} decay={2} />
    </Interactable>
  );
};

/**
 * 3D Sculk Shrieker Block with authentic top, side, and soul horns
 */
export const SculkShrieker3D: React.FC<{
  position?: [number, number, number];
  active?: boolean;
}> = ({ position = [0, 0, 0], active = false }) => {
  const baseGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 1,
      height: 0.5,
      depth: 1,
      textures: {
        top: 'sculk_shrieker_top',
        side: 'sculk_shrieker_side',
        bottom: 'deepslate',
      },
    });
  }, []);

  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} geometry={baseGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />
      {/* 4 Corner Bone Horns */}
      {[
        [-0.35, 0.65, -0.35],
        [0.35, 0.65, -0.35],
        [-0.35, 0.65, 0.35],
        [0.35, 0.65, 0.35],
      ].map(([hx, hy, hz], i) => (
        <mesh key={i} position={[hx, hy, hz]}>
          <boxGeometry args={[0.15, 0.35, 0.15]} />
          <meshStandardMaterial color="#E8F4F8" roughness={0.3} />
        </mesh>
      ))}
      {/* Central Soul Core */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.4, 0.2, 0.4]} />
        <meshStandardMaterial
          color="#00FFFF"
          emissive="#00E5FF"
          emissiveIntensity={active ? 4.5 : 2.0}
        />
      </mesh>
      <pointLight position={[0, 0.8, 0]} color="#00FFFF" intensity={active ? 5.0 : 2.5} distance={10} decay={2} />
    </group>
  );
};
