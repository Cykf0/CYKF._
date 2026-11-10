import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EnchantingTable3D } from '../world/interactiveObjects';
import {
  DustMotes,
  CharacterContactShadow,
} from '../world/EnvironmentEffects';
import { PlayerModel } from '../player/PlayerModel';
import {
  VanillaLantern,
  VolumetricGodRay,
} from '../world/VoxelStructures';
import {
  ArcaneEnchantingDais,
} from '../world/VoxelArchitecture';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';
import {
  createVoxelTerrainGeometry,
  createVanillaBlockGeometry,
} from '../world/VanillaBlockGeometry';
import { vanillaAtlas } from '../world/VanillaTextureAtlas';

/**
 * Authentic Standard Galactic Alphabet (SGA) Floating Runes
 * Streaming from surrounding bookshelves towards the enchanting book.
 */
const FloatingSGARunes: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate 4 authentic glowing SGA rune textures
  const runeTextures = useMemo(() => {
    const glyphs = ['ᔑ', '∷', 'ᒷ', '⎓', 'ʖ', 'ᓵ', '↸'];
    return glyphs.map((char) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, 64, 64);
      ctx.fillStyle = '#00FFFF';
      ctx.shadowColor = '#E879F9';
      ctx.shadowBlur = 8;
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 32, 32);

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.LinearFilter;
      return tex;
    });
  }, []);

  const spriteMaterials = useMemo(() => {
    return runeTextures.map((tex) =>
      new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        color: '#E0AAFF',
      })
    );
  }, [runeTextures]);

  // Particle states for 30 streaming runes
  const particles = useMemo(() => {
    const count = 28;
    const items = [];
    for (let i = 0; i < count; i++) {
      // Pick random bookshelf origin: back wall, left wall, or right wall
      const wall = Math.floor(Math.random() * 3);
      let sx = 0;
      let sy = 0.8 + Math.random() * 2.2;
      let sz = 0;

      if (wall === 0) {
        // Back wall
        sx = (Math.random() - 0.5) * 4.6;
        sz = -2.4 + (Math.random() - 0.5) * 0.4;
      } else if (wall === 1) {
        // Left wall
        sx = -2.3 + (Math.random() - 0.5) * 0.4;
        sz = -2.2 + Math.random() * 2.2;
      } else {
        // Right wall
        sx = 2.3 + (Math.random() - 0.5) * 0.4;
        sz = -2.2 + Math.random() * 2.2;
      }

      items.push({
        start: new THREE.Vector3(sx, sy, sz),
        target: new THREE.Vector3(0, 1.7, -0.5),
        current: new THREE.Vector3(sx, sy, sz),
        progress: Math.random(),
        speed: 0.22 + Math.random() * 0.25,
        wobblePhase: Math.random() * Math.PI * 2,
        matIndex: Math.floor(Math.random() * spriteMaterials.length),
      });
    }
    return items;
  }, [spriteMaterials.length]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.progress += p.speed * delta;
      if (p.progress >= 1.0) {
        p.progress = 0;
        // Re-randomize start on bookshelf
        const wall = Math.floor(Math.random() * 3);
        if (wall === 0) {
          p.start.set((Math.random() - 0.5) * 4.6, 0.8 + Math.random() * 2.2, -2.4);
        } else if (wall === 1) {
          p.start.set(-2.3, 0.8 + Math.random() * 2.2, -2.2 + Math.random() * 2.2);
        } else {
          p.start.set(2.3, 0.8 + Math.random() * 2.2, -2.2 + Math.random() * 2.2);
        }
      }

      // Smooth quadratic bezier or curved path towards the enchanting table book
      const pr = p.progress;
      p.current.lerpVectors(p.start, p.target, pr);
      // Floating sinusoidal arc
      p.current.y += Math.sin(pr * Math.PI) * 0.45;
      p.current.x += Math.cos(t * 2 + p.wobblePhase) * 0.08 * (1 - pr);
      p.current.z += Math.sin(t * 2 + p.wobblePhase) * 0.08 * (1 - pr);

      const sprite = groupRef.current.children[i] as THREE.Sprite;
      if (sprite) {
        sprite.position.copy(p.current);
        // Fade in from shelf, fade out into book
        const alpha = Math.sin(pr * Math.PI);
        sprite.scale.setScalar(0.24 + alpha * 0.12);
        (sprite.material as THREE.SpriteMaterial).opacity = Math.max(0.1, alpha * 0.95);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, idx) => (
        <sprite key={idx} material={spriteMaterials[p.matIndex]} />
      ))}
    </group>
  );
};

export const Scene03Enchantments: React.FC = () => {
  const setActiveGui = useStore((s) => s.setActiveGui);

  // 1. Tiled Stone & Deepslate Library Floor
  const floorGeo = useMemo(() => {
    return createVoxelTerrainGeometry(28, 28, {
      top: 'chiseled_stone_bricks',
      side: 'stone_bricks',
      bottom: 'stone',
    }, 1.2);
  }, []);

  // 2. Heavy Subterranean Bedrock Base (Strictly at y <= -1.1 to prevent Z-fighting)
  const bedrockBaseGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 32,
      height: 3,
      depth: 32,
      textures: 'bedrock',
    });
  }, []);

  // 3. Fully Enclosed Vaulted Library Walls & Ceiling
  const backWallGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 28,
      height: 12,
      depth: 2.5,
      textures: 'stone_bricks',
    });
  }, []);

  const leftWallGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 2.5,
      height: 12,
      depth: 28,
      textures: 'deepslate_bricks',
    });
  }, []);

  const rightWallGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 2.5,
      height: 12,
      depth: 28,
      textures: 'deepslate_bricks',
    });
  }, []);

  const ceilingGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 28,
      height: 2.0,
      depth: 28,
      textures: 'deepslate_bricks',
    });
  }, []);

  // 4. Authentic Minecraft Level 30 Bookshelf Setup Geometries
  const backBookshelfGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 5.2,
      height: 3.0,
      depth: 1.0,
      textures: 'bookshelf',
    });
  }, []);

  const sideBookshelfGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 1.0,
      height: 3.0,
      depth: 3.2,
      textures: 'bookshelf',
    });
  }, []);

  const shelfCapGeo = useMemo(() => {
    return createVanillaBlockGeometry({
      width: 1.2,
      height: 0.3,
      depth: 1.2,
      textures: 'dark_oak_planks',
    });
  }, []);

  return (
    <group>
      {/* ----------------------------------------------------------------------- */}
      {/* 1. ATMOSPHERE & SHADER-PACK LIGHTING (Arcane Purple & Warm Candlelight) */}
      {/* ----------------------------------------------------------------------- */}

      {/* Deep Arcane Midnight Purple Fog */}
      <fog attach="fog" args={['#140A26', 10, 32]} />

      {/* Ambient Fill: Moody Deep Violet */}
      <ambientLight intensity={0.42} color="#4A2A6B" />

      {/* Directional Vault Light casting soft shadows */}
      <directionalLight
        position={[-5, 10, 4]}
        intensity={1.6}
        color="#B388FF"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      />

      {/* Warm Golden Candle & Lantern Point Lights on the Bookshelves */}
      <pointLight position={[0, 2.5, -0.5]} color="#FFAA33" intensity={2.6} distance={9} />
      <pointLight position={[-2.4, 3.6, 0.4]} color="#FFAA33" intensity={2.4} distance={7} />
      <pointLight position={[2.4, 3.6, 0.4]} color="#FFAA33" intensity={2.4} distance={7} />
      <pointLight position={[0, 3.6, -2.4]} color="#FFAA33" intensity={2.2} distance={7} />

      {/* Arcane Purple Rune Glow */}
      <pointLight position={[0, 1.8, -0.5]} color="#D670D6" intensity={3.5} distance={6} decay={2} />

      {/* Volumetric Magical Light Shaft */}
      <VolumetricGodRay
        position={[0, 6.0, -0.5]}
        rotation={[0.1, 0, 0]}
        scale={[2.2, 4.5, 2.2]}
        color="#D670D6"
        opacity={0.3}
      />

      {/* Floating Arcane Dust Motes */}
      <DustMotes count={75} area={[16, 7, 16]} color="#C4B5FD" size={0.065} />

      {/* ----------------------------------------------------------------------- */}
      {/* 2. SUBTERRANEAN FOUNDATION & ENCLOSED LIBRARY HALL (Zero Z-Fighting)     */}
      {/* ----------------------------------------------------------------------- */}

      {/* Bedrock Foundation safely positioned underneath floor (Top at y = -1.1) */}
      <mesh position={[0, -2.6, 0]} geometry={bedrockBaseGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* Tiled Floor (Surface flush at y=0.0) */}
      <mesh position={[0, 0, 0]} geometry={floorGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* Vaulted Ceiling */}
      <mesh position={[0, 9.5, 0]} geometry={ceilingGeo} material={vanillaAtlas.getSolidMaterial()} />

      {/* Enclosed Hall Walls */}
      <mesh position={[0, 4.5, -8.5]} geometry={backWallGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[-12.5, 4.5, 0]} geometry={leftWallGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />
      <mesh position={[12.5, 4.5, 0]} geometry={rightWallGeo} material={vanillaAtlas.getSolidMaterial()} receiveShadow />

      {/* ----------------------------------------------------------------------- */}
      {/* 3. AUTHENTIC MINECRAFT LEVEL 30 BOOKSHELF LIBRARY ENCLOSURE             */}
      {/* ----------------------------------------------------------------------- */}
      <group position={[0, 0, -0.5]}>
        {/* Back Wall of Bookshelves (3 blocks high, flush at y=0.0) */}
        <mesh position={[0, 1.5, -2.4]} geometry={backBookshelfGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

        {/* Left Wall of Bookshelves (3 blocks high, flush at y=0.0) */}
        <mesh position={[-2.4, 1.5, -0.9]} geometry={sideBookshelfGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

        {/* Right Wall of Bookshelves (3 blocks high, flush at y=0.0) */}
        <mesh position={[2.4, 1.5, -0.9]} geometry={sideBookshelfGeo} material={vanillaAtlas.getSolidMaterial()} castShadow receiveShadow />

        {/* Corner Pillars & Decorative Caps */}
        <mesh position={[-2.4, 3.15, 0.4]} geometry={shelfCapGeo} material={vanillaAtlas.getSolidMaterial()} />
        <mesh position={[2.4, 3.15, 0.4]} geometry={shelfCapGeo} material={vanillaAtlas.getSolidMaterial()} />
        <mesh position={[-2.4, 3.15, -2.4]} geometry={shelfCapGeo} material={vanillaAtlas.getSolidMaterial()} />
        <mesh position={[2.4, 3.15, -2.4]} geometry={shelfCapGeo} material={vanillaAtlas.getSolidMaterial()} />

        {/* Authentic Minecraft Lanterns sitting on Bookshelf Corners */}
        <VanillaLantern position={[-2.4, 3.3, 0.4]} hanging={false} />
        <VanillaLantern position={[2.4, 3.3, 0.4]} hanging={false} />
        <VanillaLantern position={[0, 3.0, -2.4]} hanging={false} />

        {/* Grand Background Library Catwalk (Far wall at z = -6.5, not obstructing the altar) */}
        <mesh
          position={[0, 2.5, -7.0]}
          geometry={createVanillaBlockGeometry({
            width: 18,
            height: 5.0,
            depth: 1.2,
            textures: 'bookshelf',
          })}
          material={vanillaAtlas.getSolidMaterial()}
          castShadow
          receiveShadow
        />
      </group>

      {/* ----------------------------------------------------------------------- */}
      {/* 4. CENTRAL ENCHANTING SANCTUARY & STREAMING SGA RUNES                   */}
      {/* ----------------------------------------------------------------------- */}
      <group position={[0, 0, -0.5]}>
        <ArcaneEnchantingDais position={[0, 0, 0]} />

        {/* Interactive 3D Enchanting Table (Rests flush on dais altar top y=0.85) */}
        <Interactable
          id="scene03_enchanting_table"
          name="Arcane Enchanting Table (Tier 30)"
          category="PROP"
          tooltip="Click to inspect Tech Skills & Enchantments"
          onClick={() => {
            sounds.playEnchantChime();
            setActiveGui('enchanting');
            useStore.getState().recordDiscovery('scene03_enchanting_table', 'PROP', 'Enchantment Codex');
          }}
        >
          <group position={[0, 0.85, 0]}>
            <EnchantingTable3D position={[0, 0, 0]} />
          </group>
        </Interactable>

        {/* Authentic Floating SGA Runes Streaming from Bookshelves into Book */}
        <FloatingSGARunes />
      </group>

      {/* Hanging Iron Chains & Glowing Ceiling Lanterns */}
      <group position={[-2.5, 7.5, -1.0]}>
        <VanillaLantern position={[0, 0, 0]} hanging={true} chainLinks={3} />
      </group>
      <group position={[2.5, 7.5, -1.0]}>
        <VanillaLantern position={[0, 0, 0]} hanging={true} chainLinks={3} />
      </group>

      {/* ----------------------------------------------------------------------- */}
      {/* 5. PLAYER MODEL: Cykf_ Studying the Glyphs (Flush on Floor y=0.0)       */}
      {/* ----------------------------------------------------------------------- */}
      <React.Suspense fallback={null}>
        <Interactable
          id="scene03_player_cykf"
          name="Cykf_ (Grand Enchanter)"
          category="PLAYER"
          onClick={() => {
            sounds.playClick();
            useStore.getState().recordDiscovery('scene03_player_cykf', 'PLAYER', 'Arcane Scholar');
          }}
        >
          <group position={[1.5, 0.0, 0.8]} rotation={[0, -0.4, 0]}>
            <PlayerModel
              pose="idle"
              heldItem="enchanted-book"
              scale={0.065}
            />
            <CharacterContactShadow position={[0, 0.005, 0]} opacity={0.7} scale={1.8} />
          </group>
        </Interactable>
      </React.Suspense>
    </group>
  );
};
