import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
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
  const groupRef = useRef<THREE.Group>(null);

  const isTheEnd = currentScene === 8; // Scene 9: The End

  // Keep sky dome centered on camera
  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.position.copy(camera.position);
    }
  });

  // Parse hour from "HH:MM"
  const hour = useMemo(() => {
    if (!inGameTime) return 12;
    const parts = inGameTime.split(':');
    return parseInt(parts[0], 10) + (parseInt(parts[1] || '0', 10) / 60);
  }, [inGameTime]);

  const isNight = hour < 6 || hour > 18;

  // Vanilla Square Sun Texture (32x32 NearestFilter)
  const sunMaterial = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/texturepack/assets/minecraft/textures/environment/celestial/sun.png', (loadedTex) => {
      loadedTex.magFilter = THREE.NearestFilter;
      loadedTex.minFilter = THREE.NearestFilter;
      loadedTex.generateMipmaps = false;
      loadedTex.colorSpace = THREE.SRGBColorSpace;
      loadedTex.needsUpdate = true;
    });
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.colorSpace = THREE.SRGBColorSpace;

    return new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Vanilla Square Moon Texture (32x32 NearestFilter)
  const moonMaterial = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/texturepack/assets/minecraft/textures/environment/celestial/moon/full_moon.png', (loadedTex) => {
      loadedTex.magFilter = THREE.NearestFilter;
      loadedTex.minFilter = THREE.NearestFilter;
      loadedTex.generateMipmaps = false;
      loadedTex.colorSpace = THREE.SRGBColorSpace;
      loadedTex.needsUpdate = true;
    });
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.colorSpace = THREE.SRGBColorSpace;

    return new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  // The End Purple Void Sky Texture
  const endSkyMaterial = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/texturepack/assets/minecraft/textures/environment/end_sky.png', (loadedTex) => {
      loadedTex.magFilter = THREE.NearestFilter;
      loadedTex.minFilter = THREE.NearestFilter;
      loadedTex.generateMipmaps = false;
      loadedTex.wrapS = THREE.RepeatWrapping;
      loadedTex.wrapT = THREE.RepeatWrapping;
      loadedTex.repeat.set(16, 16);
      loadedTex.colorSpace = THREE.SRGBColorSpace;
      loadedTex.needsUpdate = true;
    });
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    tex.colorSpace = THREE.SRGBColorSpace;

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
      <group ref={groupRef}>
        {/* Sky Sphere */}
        <mesh position={[0, 0, 0]}>
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
      </group>
    </Interactable>
  );
};
