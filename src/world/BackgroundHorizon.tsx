import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore, BIOMES } from '../store';
import { vanillaAtlas } from './VanillaTextureAtlas';

/**
 * Universal Background Horizon & Sky Dome with Vanilla Minecraft Square Sun & Moon
 * Ensures 100% raycast coverage and authentic vanilla sky appearance.
 */
export const BackgroundHorizon: React.FC = () => {
  const currentScene = useStore((s) => s.currentScene);
  const inGameTime = useStore((s) => s.inGameTime);
  const biome = BIOMES[currentScene] || BIOMES[0];

  const isTheEnd = currentScene === 8; // Scene 9: The End

  // Parse hour from "HH:MM"
  const hour = useMemo(() => {
    if (!inGameTime) return 12;
    const parts = inGameTime.split(':');
    return parseInt(parts[0], 10) + (parseInt(parts[1] || '0', 10) / 60);
  }, [inGameTime]);

  const isNight = hour < 6 || hour > 18;

  // Vanilla Square Sun Texture (32x32 NearestFilter)
  const sunMaterial = useMemo(() => {
    const tex = vanillaAtlas.getStandaloneTexture('vanilla_sun', (ctx) => {
      ctx.canvas.width = 32;
      ctx.canvas.height = 32;
      ctx.imageSmoothingEnabled = false;

      // Outer glow square
      ctx.fillStyle = '#FFE259';
      ctx.fillRect(0, 0, 32, 32);
      // Mid golden yellow square
      ctx.fillStyle = '#FFF275';
      ctx.fillRect(4, 4, 24, 24);
      // Core bright warm white square
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(8, 8, 16, 16);
    });

    return new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Vanilla Square Moon Texture (32x32 NearestFilter)
  const moonMaterial = useMemo(() => {
    const tex = vanillaAtlas.getStandaloneTexture('vanilla_moon', (ctx) => {
      ctx.canvas.width = 32;
      ctx.canvas.height = 32;
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = '#C8CFD6';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#E8F0F8';
      ctx.fillRect(4, 4, 24, 24);
      // Craters
      ctx.fillStyle = '#9FA8B0';
      ctx.fillRect(8, 8, 6, 6);
      ctx.fillRect(18, 14, 8, 8);
      ctx.fillRect(10, 20, 5, 5);
    });

    return new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  // The End Purple Void Sky Texture
  const endSkyMaterial = useMemo(() => {
    const tex = vanillaAtlas.getStandaloneTexture('vanilla_end_sky', (ctx) => {
      ctx.canvas.width = 16;
      ctx.canvas.height = 16;
      ctx.imageSmoothingEnabled = false;
      const purples = ['#170b24', '#26133a', '#0d0615', '#331a4e'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = purples[(x * 7 + y * 13) % purples.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);

    return new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  const handleSkyClick = () => {
    sounds.playWobble(520);
    useStore.getState().recordDiscovery(`sky_horizon_${currentScene}`, 'SKY', `Distant ${biome.name} Sky`);
  };

  // Sun / Moon trajectory angle
  const sunAngle = ((hour - 6) / 24) * Math.PI * 2;
  const sunX = Math.cos(sunAngle) * 35;
  const sunY = Math.sin(sunAngle) * 35;

  return (
    <Interactable
      id={`sky_horizon_${currentScene}`}
      name={`Distant Horizon (${biome.name})`}
      category="SKY"
      tooltip="Too far to reach"
      onClick={handleSkyClick}
    >
      {/* Sky Sphere */}
      <mesh position={[0, 0, -10]}>
        <sphereGeometry args={[45, 16, 16]} />
        {isTheEnd ? (
          <primitive object={endSkyMaterial} attach="material" />
        ) : (
          <meshBasicMaterial
            color={biome.skyColor}
            side={THREE.BackSide}
            depthWrite={false}
          />
        )}
      </mesh>

      {/* Vanilla Square Sun (Outdoor daytime) */}
      {!isTheEnd && !isNight && (
        <mesh position={[sunX * 0.5, Math.max(12, sunY), -25]} material={sunMaterial}>
          <planeGeometry args={[7, 7]} />
        </mesh>
      )}

      {/* Vanilla Square Moon (Outdoor nighttime) */}
      {!isTheEnd && isNight && (
        <mesh position={[-sunX * 0.5, Math.max(12, -sunY), -25]} material={moonMaterial}>
          <planeGeometry args={[6, 6]} />
        </mesh>
      )}
    </Interactable>
  );
};
