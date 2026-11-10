import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore, BIOMES } from '../store';
import { sounds } from '../audio/soundManager';

// 9 Scenes
import { Scene01Title } from '../scenes/Scene01Title';
import { Scene02Profile } from '../scenes/Scene02Profile';
import { Scene03Enchantments } from '../scenes/Scene03Enchantments';
import { Scene04Chest } from '../scenes/Scene04Chest';
import { Scene05Crafting } from '../scenes/Scene05Crafting';
import { Scene06Advancements } from '../scenes/Scene06Advancements';
import { Scene07Trades } from '../scenes/Scene07Trades';
import { Scene08Connect } from '../scenes/Scene08Connect';
import { Scene09End } from '../scenes/Scene09End';

// Per-scene camera configurations
const CAMERA_PRESETS: { pos: [number, number, number]; target: [number, number, number]; fov: number }[] = [
  // Scene 1: Title (Village Sunrise)
  { pos: [0, 2.2, 5.8], target: [0.8, 1.2, 0], fov: 45 },
  // Scene 2: Profile (Cherry Grove)
  { pos: [0, 1.8, 5.2], target: [0.8, 1.1, 0], fov: 44 },
  // Scene 3: Enchantments (Stronghold)
  { pos: [-0.4, 2.0, 5.0], target: [0.9, 1.2, 0], fov: 45 },
  // Scene 4: Chest (Mineshaft)
  { pos: [-0.3, 1.9, 5.4], target: [0.9, 1.0, 0], fov: 45 },
  // Scene 5: Crafting (Snowy Peaks)
  { pos: [-0.2, 2.4, 5.5], target: [0.8, 1.3, -3], fov: 46 },
  // Scene 6: Advancements (Deep Dark)
  { pos: [0, 2.2, 5.6], target: [-0.6, 1.2, -2], fov: 45 },
  // Scene 7: Trades (Village Interior)
  { pos: [-0.4, 1.8, 4.8], target: [0.6, 1.1, 0], fov: 44 },
  // Scene 8: Connect (Lush Caves)
  { pos: [-0.4, 1.9, 5.2], target: [0.8, 1.1, 0], fov: 45 },
  // Scene 9: The End
  { pos: [0, 2.4, 6.2], target: [0.6, 1.5, 0], fov: 46 },
];

export const SceneManager: React.FC = () => {
  const currentScene = useStore((s) => s.currentScene);
  const nextScene = useStore((s) => s.nextScene);
  const prevScene = useStore((s) => s.prevScene);
  const setScene = useStore((s) => s.setScene);
  const frontCameraView = useStore((s) => s.frontCameraView);
  const toggleFrontCamera = useStore((s) => s.toggleFrontCamera);
  const toggleMute = useStore((s) => s.toggleMute);

  const { camera } = useThree();
  const currentTarget = useRef(new THREE.Vector3(0, 1.2, 0));

  // Sync with browser hash routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const found = BIOMES.findIndex((b) => b.hash === hash);
      if (found !== -1 && found !== currentScene) {
        setScene(found);
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash(); // initial sync

    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentScene, setScene]);

  // Global Keyboard & Interaction Controls
  useEffect(() => {
    let lastScroll = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // First interaction unlocks Web Audio API
      sounds.unlock();

      // Number keys 1-9
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < BIOMES.length) {
          sounds.playHotbarTick();
          setScene(idx);
        }
      }

      // Arrows / A / D
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        sounds.playHotbarTick();
        nextScene();
      }
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        sounds.playHotbarTick();
        prevScene();
      }

      // 'F' key toggles front camera easter egg
      if (e.key.toLowerCase() === 'f') {
        toggleFrontCamera();
      }

      // 'M' key toggles mute
      if (e.key.toLowerCase() === 'm') {
        toggleMute();
      }
    };

    // Scroll wheel navigation (debounced)
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScroll < 600) return;
      if (Math.abs(e.deltaY) > 35) {
        lastScroll = now;
        if (e.deltaY > 0) nextScene();
        else prevScene();
      }
    };

    // Mobile touch swipe
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff < 0) nextScene();
        else prevScene();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('click', () => sounds.unlock(), { once: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [nextScene, prevScene, setScene, toggleFrontCamera, toggleMute]);

  // Smooth Camera transition and mouse parallax
  useFrame((state, delta) => {
    const preset = CAMERA_PRESETS[currentScene] || CAMERA_PRESETS[0];
    const mouse = state.pointer; // [-1, 1]

    let desiredPos = new THREE.Vector3(...preset.pos);
    let desiredTarget = new THREE.Vector3(...preset.target);

    // Front Camera Easter Egg view
    if (frontCameraView) {
      desiredPos.set(0, 1.2, 3.2);
      desiredTarget.set(0, 1.1, 0);
    } else {
      // Subtle cursor parallax
      desiredPos.x += mouse.x * 0.35;
      desiredPos.y += mouse.y * 0.25;
    }

    // Smooth lerp camera position
    camera.position.lerp(desiredPos, 4 * delta);
    currentTarget.current.lerp(desiredTarget, 4 * delta);
    camera.lookAt(currentTarget.current);
  });

  return (
    <group key={currentScene}>
      {currentScene === 0 && <Scene01Title />}
      {currentScene === 1 && <Scene02Profile />}
      {currentScene === 2 && <Scene03Enchantments />}
      {currentScene === 3 && <Scene04Chest />}
      {currentScene === 4 && <Scene05Crafting />}
      {currentScene === 5 && <Scene06Advancements />}
      {currentScene === 6 && <Scene07Trades />}
      {currentScene === 7 && <Scene08Connect />}
      {currentScene === 8 && <Scene09End />}
    </group>
  );
};
