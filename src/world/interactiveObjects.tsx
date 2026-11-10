import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { sounds } from '../audio/soundManager';
import { Interactable } from '../interaction/Interactable';
import { useStore } from '../store';
import { vanillaAtlas } from './VanillaTextureAtlas';

/**
 * Helper to create crisp NearestFilter entity texture
 */
function createEntityTexture(name: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  return vanillaAtlas.getStandaloneTexture(`${name}_${width}x${height}`, (ctx) => {
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
    sounds.playChestOpen();
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
      scale={0.5}
      onClick={toggleChest}
    >
      {/* Chest Base (14x10x14 voxel box) */}
      <mesh position={[0, 0.4, 0]} material={chestWoodMaterial} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.8, 1.6]} />
      </mesh>

      {/* Base Inner Dark Hole */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.4, 0.7, 1.4]} />
        <meshBasicMaterial color="#111111" />
      </mesh>

      {/* Chest Animated Lid (Hinged at back z=-0.7, y=0.8) */}
      <group ref={lidRef} position={[0, 0.8, -0.7]}>
        {/* Lid Top Box (14x5x14 voxel box) centered at z=+0.7 relative to hinge */}
        <mesh position={[0, 0.2, 0.7]} material={chestWoodMaterial} castShadow>
          <boxGeometry args={[1.6, 0.4, 1.6]} />
        </mesh>
        {/* Silver Latch at front (2x4x1 voxel box) */}
        <mesh position={[0, 0.05, 1.55]} material={latchMaterial} castShadow>
          <boxGeometry args={[0.2, 0.35, 0.1]} />
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

  // Obsidian base material
  const obsidianBaseMaterial = useMemo(() => {
    const tex = createEntityTexture('enchant_obsidian', 16, 16, (ctx) => {
      const obs = ['#151020', '#1c152d', '#110c1c', '#271d3f'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = obs[(x * 19 + y * 13) % obs.length];
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

  // Red velvet cloth top
  const clothMaterial = useMemo(() => {
    const tex = createEntityTexture('enchant_cloth', 16, 16, (ctx) => {
      const reds = ['#8f1c1c', '#a82424', '#781515'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = reds[(x * 5 + y * 7) % reds.length];
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

  return (
    <Interactable
      id="prop_enchanting_table"
      name="Enchanting Table"
      category="PROP"
      position={position}
      onClick={handleTableClick}
    >
      {/* Obsidian Table Base (3/4 block high = 0.75) */}
      <mesh position={[0, 0.375, 0]} material={obsidianBaseMaterial} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.75, 1.5]} />
      </mesh>

      {/* Red Diamond Velvet Cloth Top */}
      <mesh position={[0, 0.76, 0]} material={clothMaterial}>
        <boxGeometry args={[1.4, 0.04, 1.4]} />
      </mesh>

      {/* 4 Diamond Corners */}
      {[
        [-0.65, 0.65, -0.65],
        [0.65, 0.65, -0.65],
        [-0.65, 0.65, 0.65],
        [0.65, 0.65, 0.65],
      ].map(([cx, cy, cz], idx) => (
        <mesh key={idx} position={[cx, cy, cz]}>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshBasicMaterial color="#55FFFF" />
        </mesh>
      ))}

      {/* Purple Mystical Point Light */}
      <pointLight color="#B388FF" intensity={3.5} distance={12} decay={2} position={[0, 1.5, 0]} />

      {/* Floating Open Book */}
      <group
        ref={bookRef}
        position={[0, 1.3, 0]}
        scale={0.18}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 3.2, 0.4]} />
          <meshBasicMaterial color="#881B1B" />
        </mesh>

        <group ref={leftPageRef} position={[-0.3, 0, 0]} rotation={[0, -0.4, 0]}>
          <mesh position={[-1.2, 0, 0]}>
            <boxGeometry args={[2.4, 3.0, 0.15]} />
            <meshBasicMaterial color="#F3E5C8" />
          </mesh>
        </group>

        <group ref={rightPageRef} position={[0.3, 0, 0]} rotation={[0, 0.4, 0]}>
          <mesh position={[1.2, 0, 0]}>
            <boxGeometry args={[2.4, 3.0, 0.15]} />
            <meshBasicMaterial color="#F3E5C8" />
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

  // Campfire log bark material
  const logMaterial = useMemo(() => {
    const tex = createEntityTexture('campfire_log', 16, 16, (ctx) => {
      const bark = ['#46351d', '#584425', '#675230', '#3c2c16'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = bark[(x * 3 + y * 7) % bark.length];
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
    sounds.playClick();
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
      {/* 4 Wooden Logs Base */}
      <mesh position={[0, 0.12, 0.4]} rotation={[0, 0, Math.PI / 2]} material={logMaterial} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
      </mesh>
      <mesh position={[0, 0.12, -0.4]} rotation={[0, 0, Math.PI / 2]} material={logMaterial} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
      </mesh>
      <mesh position={[0.4, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={logMaterial} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
      </mesh>
      <mesh position={[-0.4, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={logMaterial} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
      </mesh>

      {/* Animated Fire Flame Voxels */}
      {lit && (
        <>
          <group ref={fireRef} position={[0, 0.3, 0]}>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.5, 0.6, 0.5]} />
              <meshBasicMaterial color="#FF6600" />
            </mesh>
            <mesh position={[0, 0.25, 0]}>
              <boxGeometry args={[0.3, 0.7, 0.3]} />
              <meshBasicMaterial color="#FFDD00" />
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

  // Bedrock texture
  const bedrockMaterial = useMemo(() => {
    const tex = createEntityTexture('crystal_bedrock', 16, 16, (ctx) => {
      const palette = ['#161616', '#262626', '#353535', '#0d0d0d'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[(x * 11 + y * 17) % palette.length];
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
      <mesh position={[0, 0.1, 0]} material={bedrockMaterial}>
        <boxGeometry args={[1.6, 0.2, 1.6]} />
      </mesh>

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
            <cylinderGeometry args={[0.15, 0.15, 30, 8]} />
            <meshBasicMaterial color="#CC44FF" transparent opacity={0.7} />
          </mesh>
          <pointLight color="#D670D6" intensity={4} distance={20} decay={2} position={[0, 2, 0]} />
        </>
      )}
    </Interactable>
  );
};
