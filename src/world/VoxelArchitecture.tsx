import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { vanillaAtlas } from './VanillaTextureAtlas';
import { textureManager } from './TextureManager';
import {
  createVanillaBlockGeometry,
  createVoxelTerrainGeometry,
  createVoxelPathGeometry,
} from './VanillaBlockGeometry';
import { VoxelBlock, VanillaLantern, VanillaWoodenFence } from './VoxelStructures';

// =============================================================================
// 1. MEDIEVAL KINGDOM ARCHITECTURE (Scene 1)
// =============================================================================

/**
 * Distant Medieval Fortress / Castle
 * Grand silhouette on the horizon: 4 crenellated corner towers, massive curtain wall,
 * central keep with pitched roofs, and flying banners.
 */
export const MedievalCastleDistance: React.FC<{
  position?: [number, number, number];
  scale?: number;
}> = ({ position = [0, 0, 0], scale = 1.0 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Central Great Keep */}
      <mesh
        position={[0, 6.0, 0]}
        geometry={createVanillaBlockGeometry({
          width: 8.0,
          height: 12.0,
          depth: 7.0,
          textures: 'stone_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Keep High Pitched Roof (Dark Oak) */}
      <mesh
        position={[0, 13.5, 0]}
        geometry={createVanillaBlockGeometry({
          width: 8.4,
          height: 3.5,
          depth: 7.4,
          textures: 'dark_oak_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Main Keep Turret Spire */}
      <mesh
        position={[0, 16.5, 0]}
        geometry={createVanillaBlockGeometry({
          width: 2.4,
          height: 3.0,
          depth: 2.4,
          textures: 'spruce_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Left Front Tower */}
      <mesh
        position={[-6.0, 6.5, 4.0]}
        geometry={createVanillaBlockGeometry({
          width: 3.6,
          height: 13.0,
          depth: 3.6,
          textures: {
            top: 'stone_bricks',
            bottom: 'cobblestone',
            north: 'stone_bricks',
            south: 'mossy_stone_bricks',
            east: 'cracked_stone_bricks',
            west: 'stone_bricks',
          },
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />
      {/* Left Tower Conical/Pitched Roof */}
      <mesh
        position={[-6.0, 14.5, 4.0]}
        geometry={createVanillaBlockGeometry({
          width: 4.2,
          height: 3.2,
          depth: 4.2,
          textures: 'dark_oak_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Right Front Tower */}
      <mesh
        position={[6.0, 6.5, 4.0]}
        geometry={createVanillaBlockGeometry({
          width: 3.6,
          height: 13.0,
          depth: 3.6,
          textures: 'stone_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />
      <mesh
        position={[6.0, 14.5, 4.0]}
        geometry={createVanillaBlockGeometry({
          width: 4.2,
          height: 3.2,
          depth: 4.2,
          textures: 'dark_oak_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Left Back Tower */}
      <mesh
        position={[-6.0, 8.0, -5.0]}
        geometry={createVanillaBlockGeometry({
          width: 3.6,
          height: 16.0,
          depth: 3.6,
          textures: 'stone_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
      <mesh
        position={[-6.0, 17.5, -5.0]}
        geometry={createVanillaBlockGeometry({
          width: 4.2,
          height: 3.5,
          depth: 4.2,
          textures: 'dark_oak_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Right Back Tower */}
      <mesh
        position={[6.0, 8.0, -5.0]}
        geometry={createVanillaBlockGeometry({
          width: 3.6,
          height: 16.0,
          depth: 3.6,
          textures: 'stone_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
      <mesh
        position={[6.0, 17.5, -5.0]}
        geometry={createVanillaBlockGeometry({
          width: 4.2,
          height: 3.5,
          depth: 4.2,
          textures: 'dark_oak_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Front Connecting Curtain Wall with Battlements */}
      <mesh
        position={[0, 4.5, 4.0]}
        geometry={createVanillaBlockGeometry({
          width: 8.8,
          height: 9.0,
          depth: 1.8,
          textures: 'stone_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Gatehouse Arch Opening */}
      <mesh
        position={[0, 1.8, 4.1]}
        geometry={createVanillaBlockGeometry({
          width: 2.8,
          height: 3.6,
          depth: 2.0,
          textures: 'iron_block',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Glowing Warm Watch Windows in the distance */}
      <pointLight position={[0, 10.0, 4.2]} color="#FFAA33" intensity={2.0} distance={15} />
      <pointLight position={[-6.0, 12.0, 4.2]} color="#FFAA33" intensity={1.5} distance={12} />
      <pointLight position={[6.0, 12.0, 4.2]} color="#FFAA33" intensity={1.5} distance={12} />
    </group>
  );
};

/**
 * Working Medieval Windmill with Rotating Sails
 * Solid stone cylinder base, timber upper floor, and 4 rotating canvas sails
 */
export const MedievalWindmill: React.FC<{
  position?: [number, number, number];
  rotationY?: number;
}> = ({ position = [0, 0, 0], rotationY = 0 }) => {
  const sailsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (sailsRef.current) {
      sailsRef.current.rotation.z += delta * 0.45;
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Cobblestone Sturdy Base */}
      <mesh
        position={[0, 2.0, 0]}
        geometry={createVanillaBlockGeometry({
          width: 4.0,
          height: 4.0,
          depth: 4.0,
          textures: {
            top: 'stone_bricks',
            bottom: 'cobblestone',
            north: 'cobblestone',
            south: 'mossy_cobblestone',
            east: 'cobblestone',
            west: 'cracked_stone_bricks',
          },
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Timber-framed Mid Section */}
      <mesh
        position={[0, 5.0, 0]}
        geometry={createVanillaBlockGeometry({
          width: 3.4,
          height: 3.0,
          depth: 3.4,
          textures: 'oak_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Dark Oak Conical Roof Cap */}
      <mesh
        position={[0, 7.2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 3.8,
          height: 1.6,
          depth: 3.8,
          textures: 'dark_oak_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Rotating Sails Hub */}
      <group position={[0, 5.5, 1.85]}>
        {/* Axle pin */}
        <mesh
          position={[0, 0, 0.15]}
          geometry={createVanillaBlockGeometry({
            width: 0.6,
            height: 0.6,
            depth: 0.4,
            textures: 'dark_oak_log',
          })}
          material={vanillaAtlas.getSolidMaterial()}
        />

        {/* 4 Rotating Sails Group */}
        <group ref={sailsRef}>
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
            <group key={i} rotation={[0, 0, angle]}>
              {/* Wooden Spar Arm */}
              <mesh
                position={[0, 2.8, 0]}
                geometry={createVanillaBlockGeometry({
                  width: 0.25,
                  height: 5.6,
                  depth: 0.2,
                  textures: 'oak_log',
                })}
                material={vanillaAtlas.getSolidMaterial()}
              />
              {/* White Wool Sail Blade */}
              <mesh
                position={[0.45, 3.2, 0.05]}
                geometry={createVanillaBlockGeometry({
                  width: 0.8,
                  height: 3.6,
                  depth: 0.08,
                  textures: 'white_wool',
                })}
                material={vanillaAtlas.getSolidMaterial()}
              />
            </group>
          ))}
        </group>
      </group>
    </group>
  );
};

/**
 * Authentic Stone & Wooden Village Bridge spanning the river
 */
export const StoneArchBridge: React.FC<{
  position?: [number, number, number];
  length?: number;
  width?: number;
}> = ({ position = [0, 0, 0], length = 8.0, width = 3.0 }) => {
  return (
    <group position={position}>
      {/* Bridge Roadway Deck */}
      <mesh
        position={[0, 0.7, 0]}
        geometry={createVanillaBlockGeometry({
          width: width,
          height: 0.6,
          depth: length,
          textures: {
            top: 'stone_bricks',
            bottom: 'cobblestone',
            north: 'stone_bricks',
            south: 'stone_bricks',
            east: 'stone_bricks',
            west: 'stone_bricks',
          },
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Support Pier 1 */}
      <mesh
        position={[0, -0.8, -length * 0.25]}
        geometry={createVanillaBlockGeometry({
          width: width + 0.4,
          height: 2.6,
          depth: 1.6,
          textures: 'mossy_stone_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Support Pier 2 */}
      <mesh
        position={[0, -0.8, length * 0.25]}
        geometry={createVanillaBlockGeometry({
          width: width + 0.4,
          height: 2.6,
          depth: 1.6,
          textures: 'mossy_stone_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Left Fence Railing */}
      {[-length * 0.35, -length * 0.12, length * 0.12, length * 0.35].map((z, i) => (
        <VanillaWoodenFence key={`fence-l-${i}`} position={[-width / 2 + 0.2, 1.3, z]} />
      ))}

      {/* Right Fence Railing */}
      {[-length * 0.35, -length * 0.12, length * 0.12, length * 0.35].map((z, i) => (
        <VanillaWoodenFence key={`fence-r-${i}`} position={[width / 2 - 0.2, 1.3, z]} />
      ))}

      {/* Bridge Lanterns */}
      <VanillaLantern position={[-width / 2 + 0.2, 1.8, 0]} hanging={false} />
      <VanillaLantern position={[width / 2 - 0.2, 1.8, 0]} hanging={false} />
    </group>
  );
};

// =============================================================================
// 2. GIANT FANTASY TREES & NATURE ARCHITECTURE (Scene 2)
// =============================================================================

/**
 * Colossal Ancient Fantasy Tree
 * Thick 2x2 or 3x3 twisting trunk, protruding root buttresses, wide arching branches,
 * and dense layered leaf canopy clusters.
 */
export const ColossalFantasyTree: React.FC<{
  position?: [number, number, number];
  height?: number;
  leafType?: 'oak_leaves' | 'spruce_leaves' | 'cherry_leaves';
  logType?: 'oak_log' | 'spruce_log' | 'cherry_log';
}> = ({
  position = [0, 0, 0],
  height = 9.0,
  leafType = 'spruce_leaves',
  logType = 'spruce_log',
}) => {
  const canopyRef = useRef<THREE.Group>(null);
  const swaySeed = useMemo(() => Math.random() * 20, []);

  // Subtle organic wind sway for high canopy
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (canopyRef.current) {
      canopyRef.current.rotation.z = Math.sin(t * 1.1 + swaySeed) * 0.012;
      canopyRef.current.rotation.x = Math.cos(t * 0.85 + swaySeed) * 0.01;
    }
  });

  return (
    <group position={position}>
      {/* Massive 2x2 Trunk */}
      <mesh
        position={[0, height / 2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 2.0,
          height: height,
          depth: 2.0,
          textures: logType,
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Buttress Roots radiating at base */}
      <mesh
        position={[1.2, 0.6, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.0,
          height: 1.2,
          depth: 1.6,
          textures: logType,
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
      <mesh
        position={[-1.2, 0.6, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.0,
          height: 1.2,
          depth: 1.6,
          textures: logType,
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
      <mesh
        position={[0, 0.6, 1.2]}
        geometry={createVanillaBlockGeometry({
          width: 1.6,
          height: 1.2,
          depth: 1.0,
          textures: logType,
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Wind-Swaying Layered Canopy */}
      <group ref={canopyRef}>
        {/* Tier 1 Canopy (Lower broad layer) */}
        <mesh
          position={[0, height - 2.5, 0]}
          geometry={createVanillaBlockGeometry({
            width: 7.0,
            height: 2.0,
            depth: 7.0,
            textures: leafType,
          })}
          material={vanillaAtlas.getCutoutMaterial()}
          castShadow
        />

        {/* Tier 2 Canopy (Mid tier) */}
        <mesh
          position={[0, height - 0.5, 0]}
          geometry={createVanillaBlockGeometry({
            width: 5.4,
            height: 2.0,
            depth: 5.4,
            textures: leafType,
          })}
          material={vanillaAtlas.getCutoutMaterial()}
          castShadow
        />

        {/* Tier 3 Canopy (Top spire tier) */}
        <mesh
          position={[0, height + 1.2, 0]}
          geometry={createVanillaBlockGeometry({
            width: 3.4,
            height: 2.0,
            depth: 3.4,
            textures: leafType,
          })}
          material={vanillaAtlas.getCutoutMaterial()}
          castShadow
        />

        {/* Crown Tip */}
        <mesh
          position={[0, height + 2.5, 0]}
          geometry={createVanillaBlockGeometry({
            width: 1.6,
            height: 1.4,
            depth: 1.6,
            textures: leafType,
          })}
          material={vanillaAtlas.getCutoutMaterial()}
        />
      </group>
    </group>
  );
};

/**
 * Giant Red and Brown Mushrooms (Scene 2)
 */
export const GiantMushroom: React.FC<{
  position?: [number, number, number];
  type?: 'red' | 'brown';
  height?: number;
}> = ({ position = [0, 0, 0], type = 'red', height = 4.5 }) => {
  return (
    <group position={position}>
      {/* Mushroom White Stem */}
      <mesh
        position={[0, height / 2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.0,
          height: height,
          depth: 1.0,
          textures: 'mushroom_stem',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Mushroom Cap */}
      {type === 'red' ? (
        // Red spotted box cap with overhang
        <mesh
          position={[0, height + 0.8, 0]}
          geometry={createVanillaBlockGeometry({
            width: 3.6,
            height: 2.0,
            depth: 3.6,
            textures: 'red_mushroom_block',
          })}
          material={vanillaAtlas.getSolidMaterial()}
          castShadow
        />
      ) : (
        // Brown flat umbrella cap
        <mesh
          position={[0, height + 0.4, 0]}
          geometry={createVanillaBlockGeometry({
            width: 4.5,
            height: 0.8,
            depth: 4.5,
            textures: 'brown_mushroom_block',
          })}
          material={vanillaAtlas.getSolidMaterial()}
          castShadow
        />
      )}
    </group>
  );
};

// =============================================================================
// 3. ARCANE LIBRARY VAULT & CATWALKS (Scene 3)
// =============================================================================

/**
 * Multi-story Vaulted Stone Arch with Grand Bookshelf Arrays
 */
export const ArcaneLibraryCatwalk: React.FC<{
  position?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
}> = ({ position = [0, 0, 0], width = 8.0, height = 7.0, depth = 10.0 }) => {
  return (
    <group position={position}>
      {/* Back Wall of 3-story Bookshelves */}
      <mesh
        position={[0, height / 2, -depth / 2 + 0.5]}
        geometry={createVanillaBlockGeometry({
          width: width,
          height: height,
          depth: 1.0,
          textures: 'bookshelf',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Left Wall of Bookshelves */}
      <mesh
        position={[-width / 2 + 0.5, height / 2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.0,
          height: height,
          depth: depth - 1.0,
          textures: 'bookshelf',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Second-story Wooden Balcony / Catwalk Deck */}
      <mesh
        position={[0, 3.5, 0]}
        geometry={createVanillaBlockGeometry({
          width: width - 2.0,
          height: 0.4,
          depth: 1.5,
          textures: 'dark_oak_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Gothic Stone Pillars flanking corners */}
      <mesh
        position={[-width / 2 + 0.5, height / 2, -depth / 2 + 0.5]}
        geometry={createVanillaBlockGeometry({
          width: 1.4,
          height: height + 0.5,
          depth: 1.4,
          textures: 'chiseled_stone_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
      <mesh
        position={[width / 2 - 0.5, height / 2, -depth / 2 + 0.5]}
        geometry={createVanillaBlockGeometry({
          width: 1.4,
          height: height + 0.5,
          depth: 1.4,
          textures: 'chiseled_stone_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* High Ribbed Stone Ceiling Arch */}
      <mesh
        position={[0, height + 0.5, 0]}
        geometry={createVanillaBlockGeometry({
          width: width + 1.0,
          height: 1.0,
          depth: depth,
          textures: 'deepslate_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
    </group>
  );
};

// =============================================================================
// 4. MINESHAFT COMPLEX ARCHITECTURE (Scene 4)
// =============================================================================

/**
 * Mineshaft Support Arch & Railway Tracks
 */
export const MineshaftSupportArch: React.FC<{
  position?: [number, number, number];
  width?: number;
  height?: number;
}> = ({ position = [0, 0, 0], width = 3.2, height = 3.6 }) => {
  return (
    <group position={position}>
      {/* Left Post */}
      <mesh
        position={[-width / 2, height / 2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 0.5,
          height: height,
          depth: 0.5,
          textures: 'dark_oak_log',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Right Post */}
      <mesh
        position={[width / 2, height / 2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 0.5,
          height: height,
          depth: 0.5,
          textures: 'dark_oak_log',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Top Crossbeam */}
      <mesh
        position={[0, height - 0.25, 0]}
        geometry={createVanillaBlockGeometry({
          width: width + 0.6,
          height: 0.5,
          depth: 0.5,
          textures: 'dark_oak_log',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Wooden Ties on ground */}
      <mesh
        position={[0, 0.05, 0]}
        geometry={createVanillaBlockGeometry({
          width: 2.2,
          height: 0.1,
          depth: 0.4,
          textures: 'dark_oak_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
    </group>
  );
};

// =============================================================================
// 5. ANCIENT CITY / DEEP DARK PILLARS & PORTAL FRAME (Scene 6)
// =============================================================================

/**
 * Monumental Ancient City Portal Frame & Sculk Pillars
 */
export const AncientCityPortalFrame: React.FC<{
  position?: [number, number, number];
  scale?: number;
}> = ({ position = [0, 0, 0], scale = 1.0 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Left Reinforced Deepslate Pillar */}
      <mesh
        position={[-4.5, 6.0, 0]}
        geometry={createVanillaBlockGeometry({
          width: 2.2,
          height: 12.0,
          depth: 2.2,
          textures: 'deepslate_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Right Reinforced Deepslate Pillar */}
      <mesh
        position={[4.5, 6.0, 0]}
        geometry={createVanillaBlockGeometry({
          width: 2.2,
          height: 12.0,
          depth: 2.2,
          textures: 'deepslate_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Top Lintel Arch */}
      <mesh
        position={[0, 11.5, 0]}
        geometry={createVanillaBlockGeometry({
          width: 11.2,
          height: 2.2,
          depth: 2.4,
          textures: 'deepslate',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Base Stepped Threshold with Sculk Veins */}
      <mesh
        position={[0, 0.6, 0]}
        geometry={createVanillaBlockGeometry({
          width: 11.2,
          height: 1.2,
          depth: 3.0,
          textures: {
            top: 'sculk',
            bottom: 'deepslate',
            north: 'sculk',
            south: 'sculk',
            east: 'deepslate',
            west: 'deepslate',
          },
        })}
        material={vanillaAtlas.getSolidMaterial()}
        receiveShadow
      />

      {/* Eerie Glowing Cyan Void Center */}
      <mesh position={[0, 6.0, 0]}>
        <planeGeometry args={[6.8, 9.6]} />
        <meshBasicMaterial
          color="#001824"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Cyan Sculk Soul Glow */}
      <pointLight position={[0, 6.0, 1.2]} color="#00E5FF" intensity={3.5} distance={18} decay={2} />
    </group>
  );
};

// =============================================================================
// 6. END CITY TOWERS & CHORUS FORESTS (Scene 9)
// =============================================================================

/**
 * Floating End Island with Purpur Tower and Chorus Plant
 */
export const EndCityTowerStructure: React.FC<{
  position?: [number, number, number];
  height?: number;
}> = ({ position = [0, 0, 0], height = 11.0 }) => {
  return (
    <group position={position}>
      {/* Purpur Block Shaft */}
      <mesh
        position={[0, height / 2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 3.6,
          height: height,
          depth: 3.6,
          textures: 'purpur_block',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Overhanging Stepped Room at Top */}
      <mesh
        position={[0, height + 1.6, 0]}
        geometry={createVanillaBlockGeometry({
          width: 5.4,
          height: 3.2,
          depth: 5.4,
          textures: 'purpur_pillar',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Stepped Roof Cornice */}
      <mesh
        position={[0, height + 3.6, 0]}
        geometry={createVanillaBlockGeometry({
          width: 6.2,
          height: 0.8,
          depth: 6.2,
          textures: 'purpur_block',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Glowing End Rod Spire at Roof Corner */}
      <mesh position={[2.5, height + 4.5, 2.5]}>
        <boxGeometry args={[0.2, 1.6, 0.2]} />
        <meshBasicMaterial color="#FFFDE8" />
      </mesh>
      <pointLight position={[2.5, height + 4.5, 2.5]} color="#FFF8DC" intensity={1.8} distance={8} />
    </group>
  );
};

/**
 * Branching Chorus Plant Structure
 */
export const ChorusPlantTree: React.FC<{
  position?: [number, number, number];
  height?: number;
}> = ({ position = [0, 0, 0], height = 5.0 }) => {
  return (
    <group position={position}>
      {/* Central Stem */}
      <mesh
        position={[0, height / 2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 0.8,
          height: height,
          depth: 0.8,
          textures: 'chorus_plant',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Left Branch */}
      <mesh
        position={[-0.8, height - 1.5, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.0,
          height: 0.8,
          depth: 0.8,
          textures: 'chorus_plant',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
      <mesh
        position={[-1.2, height - 0.7, 0]}
        geometry={createVanillaBlockGeometry({
          width: 0.8,
          height: 1.2,
          depth: 0.8,
          textures: 'chorus_plant',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
      {/* Left Purple Chorus Flower */}
      <mesh
        position={[-1.2, height + 0.3, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.0,
          height: 1.0,
          depth: 1.0,
          textures: 'chorus_flower',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Right Branch & Top Flower */}
      <mesh
        position={[0.8, height - 0.5, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.0,
          height: 0.8,
          depth: 0.8,
          textures: 'chorus_plant',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
      {/* Top Center Chorus Flower */}
      <mesh
        position={[0, height + 0.7, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.1,
          height: 1.1,
          depth: 1.1,
          textures: 'chorus_flower',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
    </group>
  );
};

// =============================================================================
// 7. MORE ENVIRONMENT ARCHITECTURAL LANDMARKS
// =============================================================================

/**
 * Woodland Hunter's Cabin (Scene 2)
 */
export const HunterCabin: React.FC<{
  position?: [number, number, number];
  rotationY?: number;
}> = ({ position = [0, 0, 0], rotationY = 0 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Stone Foundation */}
      <mesh
        position={[0, 0.4, 0]}
        geometry={createVanillaBlockGeometry({
          width: 4.5,
          height: 0.8,
          depth: 5.5,
          textures: {
            top: 'mossy_cobblestone',
            bottom: 'cobblestone',
            north: 'cobblestone',
            south: 'mossy_cobblestone',
            east: 'cobblestone',
            west: 'cobblestone',
          },
        })}
        material={vanillaAtlas.getSolidMaterial()}
        receiveShadow
      />

      {/* Spruce Log Corner Posts */}
      {[-1.8, 1.8].map((x) =>
        [-2.3, 2.3].map((z) => (
          <mesh
            key={`post-${x}-${z}`}
            position={[x, 2.0, z]}
            geometry={createVanillaBlockGeometry({
              width: 0.8,
              height: 2.8,
              depth: 0.8,
              textures: 'spruce_log',
            })}
            material={vanillaAtlas.getSolidMaterial()}
            castShadow
          />
        ))
      )}

      {/* Spruce Plank Walls */}
      <mesh
        position={[0, 2.0, 0]}
        geometry={createVanillaBlockGeometry({
          width: 3.8,
          height: 2.6,
          depth: 4.8,
          textures: 'spruce_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Dark Oak Pitched Shingle Roof */}
      <mesh
        position={[0, 3.8, 0]}
        geometry={createVanillaBlockGeometry({
          width: 4.8,
          height: 1.4,
          depth: 5.8,
          textures: 'dark_oak_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Cobblestone Chimney */}
      <mesh
        position={[1.5, 4.2, -1.2]}
        geometry={createVanillaBlockGeometry({
          width: 0.8,
          height: 2.5,
          depth: 0.8,
          textures: 'cobblestone',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Door cutout / entry */}
      <mesh
        position={[0, 1.6, 2.45]}
        geometry={createVanillaBlockGeometry({
          width: 1.0,
          height: 1.8,
          depth: 0.2,
          textures: 'dark_oak_log',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Warm Fireplace Glow through Windows */}
      <pointLight position={[0, 1.8, 0]} color="#FFAA33" intensity={2.0} distance={8} />
    </group>
  );
};

/**
 * Hollow Ancient Fallen Log with Moss and Polypore Mushrooms (Scene 2)
 */
export const AncientFallenLog: React.FC<{
  position?: [number, number, number];
  rotationY?: number;
  length?: number;
}> = ({ position = [0, 0, 0], rotationY = 0, length = 5.0 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Horizontal Fallen Trunk */}
      <mesh
        position={[0, 0.6, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.4,
          height: 1.2,
          depth: length,
          textures: 'spruce_log',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Shelf Mushrooms clinging to log */}
      <mesh
        position={[0.75, 0.7, 0.5]}
        geometry={createVanillaBlockGeometry({
          width: 0.4,
          height: 0.15,
          depth: 0.6,
          textures: 'brown_mushroom_block',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
      <mesh
        position={[-0.75, 0.5, -0.8]}
        geometry={createVanillaBlockGeometry({
          width: 0.4,
          height: 0.15,
          depth: 0.5,
          textures: 'red_mushroom_block',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
    </group>
  );
};

/**
 * Raised Octagonal Arcane Enchanting Dais (Scene 3)
 */
export const ArcaneEnchantingDais: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Lower Platform Tier (Stone Bricks & Deepslate) */}
      <mesh
        position={[0, 0.25, 0]}
        geometry={createVanillaBlockGeometry({
          width: 5.6,
          height: 0.5,
          depth: 5.6,
          textures: {
            top: 'chiseled_stone_bricks',
            bottom: 'stone_bricks',
            north: 'stone_bricks',
            south: 'stone_bricks',
            east: 'stone_bricks',
            west: 'stone_bricks',
          },
        })}
        material={vanillaAtlas.getSolidMaterial()}
        receiveShadow
      />

      {/* Upper Obsidian Altar Tier */}
      <mesh
        position={[0, 0.65, 0]}
        geometry={createVanillaBlockGeometry({
          width: 3.8,
          height: 0.4,
          depth: 3.8,
          textures: 'obsidian',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        receiveShadow
      />

      {/* Moss & Runecraft Carpet Inset */}
      <mesh
        position={[0, 0.88, 0]}
        geometry={createVanillaBlockGeometry({
          width: 2.8,
          height: 0.08,
          depth: 2.8,
          textures: 'moss_block',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        receiveShadow
      />
    </group>
  );
};

/**
 * Minecart on Rails (Scene 4)
 */
export const MinecartOnRails: React.FC<{
  position?: [number, number, number];
  rotationY?: number;
}> = ({ position = [0, 0, 0], rotationY = 0 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Rail Ties on ground */}
      <mesh
        position={[0, 0.05, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.4,
          height: 0.08,
          depth: 2.5,
          textures: 'rail',
        })}
        material={vanillaAtlas.getCutoutMaterial()}
      />

      {/* Minecart Metal Tub */}
      <mesh
        position={[0, 0.45, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.0,
          height: 0.6,
          depth: 1.3,
          textures: 'iron_block',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Loot Chest Inside Cart */}
      <mesh
        position={[0, 0.85, 0]}
        geometry={createVanillaBlockGeometry({
          width: 0.75,
          height: 0.6,
          depth: 0.75,
          textures: 'oak_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />
    </group>
  );
};

/**
 * Lava Cascade & Pool (Scene 4) with authentic pixel-art lava texture and obsidian rim
 */
export const LavaCascade: React.FC<{
  position?: [number, number, number];
  width?: number;
  length?: number;
}> = ({ position = [0, 0, 0], width = 3.5, length = 4.5 }) => {
  const lavaTex = useMemo(() => {
    const t = textureManager.getStaticFrame('/texturepack/assets/minecraft/textures/block/lava_still.png', 0);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(width, length);
    return t;
  }, [width, length]);

  const lavaMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: lavaTex,
      emissive: new THREE.Color('#FF5500'),
      emissiveMap: lavaTex,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.1,
    });
  }, [lavaTex]);

  const rimGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: width + 0.8,
      height: 0.35,
      depth: length + 0.8,
      textures: 'obsidian',
    });
  }, [width, length]);

  return (
    <group position={position}>
      {/* Obsidian Rim */}
      <mesh
        position={[0, 0.175, 0]}
        geometry={rimGeo}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Textured Glowing Molten Lava Liquid */}
      <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, length]} />
        <primitive object={lavaMat} attach="material" />
      </mesh>

      {/* Lava Ambient Fire Light */}
      <pointLight position={[0, 1.2, 0]} color="#FF6600" intensity={3.8} distance={14} decay={2} />
    </group>
  );
};

/**
 * Alpine Mountain Cabin (Scene 5)
 */
export const AlpineMountainCabin: React.FC<{
  position?: [number, number, number];
  rotationY?: number;
}> = ({ position = [0, 0, 0], rotationY = 0 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Stone Foundation */}
      <mesh
        position={[0, 0.5, 0]}
        geometry={createVanillaBlockGeometry({
          width: 4.8,
          height: 1.0,
          depth: 5.8,
          textures: 'stone_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        receiveShadow
      />

      {/* Dark Oak Walls */}
      <mesh
        position={[0, 2.2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 4.2,
          height: 2.6,
          depth: 5.2,
          textures: 'spruce_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Heavy Snow-Covered Steep Roof */}
      <mesh
        position={[0, 4.2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 5.4,
          height: 1.8,
          depth: 6.4,
          textures: {
            top: 'snow',
            bottom: 'dark_oak_planks',
            north: 'snow',
            south: 'snow',
            east: 'snow',
            west: 'snow',
          },
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Smoking Stone Chimney */}
      <mesh
        position={[1.5, 4.8, 1.0]}
        geometry={createVanillaBlockGeometry({
          width: 0.9,
          height: 2.2,
          depth: 0.9,
          textures: 'stone_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Warm Fireplace Glow Through Windows */}
      <pointLight position={[0, 2.0, 0]} color="#FF9933" intensity={2.6} distance={10} />
    </group>
  );
};

/**
 * Jagged Glacial Ice Pinnacle (Scene 5)
 */
export const GlacialIcePinnacle: React.FC<{
  position?: [number, number, number];
  height?: number;
}> = ({ position = [0, 0, 0], height = 7.0 }) => {
  return (
    <group position={position}>
      {/* Packed Ice Base */}
      <mesh
        position={[0, height * 0.35, 0]}
        geometry={createVanillaBlockGeometry({
          width: 2.4,
          height: height * 0.7,
          depth: 2.4,
          textures: 'packed_ice',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Translucent Blue Ice Tip */}
      <mesh
        position={[0, height * 0.8, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.4,
          height: height * 0.45,
          depth: 1.4,
          textures: 'blue_ice',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />
    </group>
  );
};

/**
 * Sculk-Infected Ruined Pillar (Scene 6)
 */
export const SculkRuinedPillar: React.FC<{
  position?: [number, number, number];
  height?: number;
}> = ({ position = [0, 0, 0], height = 8.0 }) => {
  return (
    <group position={position}>
      {/* Deepslate Bricks Core */}
      <mesh
        position={[0, height / 2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.8,
          height: height,
          depth: 1.8,
          textures: {
            top: 'sculk',
            bottom: 'deepslate',
            north: 'deepslate_bricks',
            south: 'sculk',
            east: 'deepslate_bricks',
            west: 'sculk',
          },
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Sculk Catalyst Growth at Base */}
      <mesh
        position={[0, 0.6, 0]}
        geometry={createVanillaBlockGeometry({
          width: 2.8,
          height: 1.2,
          depth: 2.8,
          textures: {
            top: 'sculk_catalyst_top',
            bottom: 'deepslate',
            north: 'sculk_catalyst_side',
            south: 'sculk_catalyst_side',
            east: 'sculk_catalyst_side',
            west: 'sculk_catalyst_side',
          },
        })}
        material={vanillaAtlas.getSolidMaterial()}
        receiveShadow
      />

      {/* Bioluminescent Cyan Sculk Light */}
      <pointLight position={[0, 1.2, 0]} color="#00E5FF" intensity={2.2} distance={8} decay={2} />
    </group>
  );
};

/**
 * Soul Fire Altar (Scene 6)
 */
export const SoulFireAltar: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Deepslate Pedestal */}
      <mesh
        position={[0, 0.4, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.6,
          height: 0.8,
          depth: 1.6,
          textures: 'chiseled_deepslate',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Authentic Minecraft Soul Fire Flames (Crossed Diagonal Planes with NearestFilter) */}
      <group position={[0, 1.15, 0]}>
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <planeGeometry args={[0.85, 0.9]} />
          <meshStandardMaterial
            map={textureManager.getStaticFrame('/texturepack/assets/minecraft/textures/block/soul_fire_0.png', 0)}
            transparent
            alphaTest={0.1}
            depthWrite={false}
            side={THREE.DoubleSide}
            emissive="#00FFFF"
            emissiveIntensity={1.5}
            emissiveMap={textureManager.getStaticFrame('/texturepack/assets/minecraft/textures/block/soul_fire_0.png', 0)}
          />
        </mesh>
        <mesh rotation={[0, -Math.PI / 4, 0]}>
          <planeGeometry args={[0.85, 0.9]} />
          <meshStandardMaterial
            map={textureManager.getStaticFrame('/texturepack/assets/minecraft/textures/block/soul_fire_0.png', 0)}
            transparent
            alphaTest={0.1}
            depthWrite={false}
            side={THREE.DoubleSide}
            emissive="#00FFFF"
            emissiveIntensity={1.5}
            emissiveMap={textureManager.getStaticFrame('/texturepack/assets/minecraft/textures/block/soul_fire_0.png', 0)}
          />
        </mesh>
      </group>
      <pointLight position={[0, 1.3, 0]} color="#00E5FF" intensity={3.5} distance={10} decay={2} />
    </group>
  );
};

/**
 * Detailed Furnished 2-Story Village Home (Scene 7)
 */
export const FurnishedVillageHome: React.FC<{
  position?: [number, number, number];
  rotationY?: number;
}> = ({ position = [0, 0, 0], rotationY = 0 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Ground Floor Living Room & Kitchen */}
      <mesh
        position={[0, 1.5, 0]}
        geometry={createVanillaBlockGeometry({
          width: 6.2,
          height: 3.0,
          depth: 6.2,
          textures: {
            top: 'oak_planks',
            bottom: 'cobblestone',
            north: 'oak_planks',
            south: 'oak_planks',
            east: 'oak_planks',
            west: 'oak_planks',
          },
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Second Floor Bedroom & Library */}
      <mesh
        position={[0, 4.2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 5.6,
          height: 2.6,
          depth: 5.6,
          textures: 'oak_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Dark Oak Gable Roof */}
      <mesh
        position={[0, 6.2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 6.6,
          height: 1.8,
          depth: 6.6,
          textures: 'dark_oak_planks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Stone Brick Fireplace Chimney */}
      <mesh
        position={[2.2, 4.0, 1.5]}
        geometry={createVanillaBlockGeometry({
          width: 1.0,
          height: 6.5,
          depth: 1.0,
          textures: 'stone_bricks',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
      />

      {/* Cozy Golden Hearth Light */}
      <pointLight position={[0, 1.5, 0]} color="#FFAA33" intensity={2.8} distance={9} />
      <pointLight position={[0, 4.2, 0]} color="#FFBB44" intensity={2.2} distance={8} />
    </group>
  );
};

/**
 * Fenced Village Farmland with Irrigation (Scene 7)
 */
export const VillageFarmland: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Farmland Bed */}
      <mesh
        position={[0, 0.4, 0]}
        geometry={createVanillaBlockGeometry({
          width: 4.5,
          height: 0.8,
          depth: 4.5,
          textures: {
            top: 'farmland',
            bottom: 'dirt',
            north: 'dirt',
            south: 'dirt',
            east: 'dirt',
            west: 'dirt',
          },
        })}
        material={vanillaAtlas.getSolidMaterial()}
        receiveShadow
      />

      {/* Water Irrigation Center */}
      <mesh position={[0, 0.82, 0]}>
        <planeGeometry args={[1.0, 1.0]} />
        <meshBasicMaterial color="#3FA8A0" side={THREE.DoubleSide} />
      </mesh>

      {/* Wheat & Carrot Crops */}
      {[-1.2, 1.2].map((x) =>
        [-1.2, 1.2].map((z) => (
          <mesh
            key={`crop-${x}-${z}`}
            position={[x, 0.95, z]}
            geometry={createVanillaBlockGeometry({
              width: 0.8,
              height: 0.5,
              depth: 0.8,
              textures: 'wheat_stage7',
            })}
            material={vanillaAtlas.getCutoutMaterial()}
          />
        ))
      )}

      {/* Composter & Barrel at Corner */}
      <mesh
        position={[2.4, 0.9, 2.4]}
        geometry={createVanillaBlockGeometry({
          width: 0.8,
          height: 0.9,
          depth: 0.8,
          textures: {
            top: 'composter_top',
            bottom: 'composter_side',
            north: 'composter_side',
            south: 'composter_side',
            east: 'composter_side',
            west: 'composter_side',
          },
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
    </group>
  );
};

/**
 * Cascading Subterranean Waterfall (Scene 8)
 */
export const LushCavernWaterfall: React.FC<{
  position?: [number, number, number];
  height?: number;
}> = ({ position = [0, 0, 0], height = 7.0 }) => {
  return (
    <group position={position}>
      {/* Water Sheet */}
      <mesh position={[0, height / 2, 0]}>
        <planeGeometry args={[2.4, height]} />
        <meshBasicMaterial
          color="#48CAE4"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mossy Ledges Framing the Waterfall */}
      <mesh
        position={[-1.6, height / 2, -0.2]}
        geometry={createVanillaBlockGeometry({
          width: 0.9,
          height: height,
          depth: 1.2,
          textures: 'moss_block',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
      <mesh
        position={[1.6, height / 2, -0.2]}
        geometry={createVanillaBlockGeometry({
          width: 0.9,
          height: height,
          depth: 1.2,
          textures: 'moss_block',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />
    </group>
  );
};

/**
 * Glowing Amethyst Geode Chamber (Scene 8)
 */
export const AmethystGeodeChamber: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Outer Calcite / Basalt Shell */}
      <mesh
        position={[0, 2.0, 0]}
        geometry={createVanillaBlockGeometry({
          width: 4.8,
          height: 4.0,
          depth: 4.8,
          textures: 'deepslate',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Inner Amethyst Block Lining */}
      <mesh
        position={[0, 2.0, 0]}
        geometry={createVanillaBlockGeometry({
          width: 3.8,
          height: 3.2,
          depth: 3.8,
          textures: 'amethyst_block',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Crystal Clusters */}
      <mesh position={[0, 2.0, 0]}>
        <boxGeometry args={[0.9, 1.4, 0.9]} />
        <meshBasicMaterial color="#BF55EC" />
      </mesh>

      {/* Purple Crystal Glow */}
      <pointLight position={[0, 2.2, 0]} color="#B388FF" intensity={3.5} distance={9} decay={2} />
    </group>
  );
};

/**
 * Obsidian Monolith with Spinning End Crystal (Scene 9)
 */
export const ObsidianPillarWithCrystal: React.FC<{
  position?: [number, number, number];
  height?: number;
}> = ({ position = [0, 0, 0], height = 11.0 }) => {
  const crystalRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group position={position}>
      {/* Monumental Obsidian Shaft */}
      <mesh
        position={[0, height / 2, 0]}
        geometry={createVanillaBlockGeometry({
          width: 2.4,
          height: height,
          depth: 2.4,
          textures: 'obsidian',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        castShadow
        receiveShadow
      />

      {/* Bedrock Top Cap */}
      <mesh
        position={[0, height + 0.3, 0]}
        geometry={createVanillaBlockGeometry({
          width: 2.6,
          height: 0.6,
          depth: 2.6,
          textures: 'bedrock',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Spinning End Crystal */}
      <group ref={crystalRef} position={[0, height + 1.8, 0]}>
        <mesh>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshBasicMaterial color="#E879F9" wireframe={false} />
        </mesh>
        <mesh rotation={[0.5, 0.5, 0.5]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* Vertical Laser Beam to Void */}
      <mesh position={[0, height + 8.0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 14, 8]} />
        <meshBasicMaterial color="#E066FF" transparent opacity={0.65} />
      </mesh>

      {/* Purple Void Crystal Light */}
      <pointLight position={[0, height + 2.0, 0]} color="#D670D6" intensity={4.5} distance={16} decay={2} />
    </group>
  );
};

/**
 * Central Bedrock Exit Portal Fountain (Scene 9)
 */
export const EndExitPortalFountain: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Octagonal Bedrock Basin Rim */}
      <mesh
        position={[0, 0.4, 0]}
        geometry={createVanillaBlockGeometry({
          width: 5.6,
          height: 0.8,
          depth: 5.6,
          textures: 'bedrock',
        })}
        material={vanillaAtlas.getSolidMaterial()}
        receiveShadow
      />

      {/* Central Bedrock Pillar */}
      <mesh
        position={[0, 2.5, 0]}
        geometry={createVanillaBlockGeometry({
          width: 1.2,
          height: 4.2,
          depth: 1.2,
          textures: 'bedrock',
        })}
        material={vanillaAtlas.getSolidMaterial()}
      />

      {/* Black Starry Void Portal Pool */}
      <mesh position={[0, 0.85, 0]}>
        <planeGeometry args={[4.2, 4.2]} />
        <meshBasicMaterial color="#000208" side={THREE.DoubleSide} />
      </mesh>

      {/* 4 Torches on Bedrock Pillar */}
      <mesh position={[0, 4.8, 0]}>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <meshBasicMaterial color="#FFAA33" />
      </mesh>
      <pointLight position={[0, 5.0, 0]} color="#FFAA33" intensity={3.0} distance={10} />
    </group>
  );
};

