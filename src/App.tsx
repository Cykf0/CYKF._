import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore, BIOMES } from './store';
import { SceneManager } from './world/SceneManager';
import { sounds } from './audio/soundManager';
import { content } from './content';

// HUD
import { TopLeftInfo } from './hud/TopLeftInfo';
import { StatusBars } from './hud/StatusBars';
import { Hotbar } from './hud/Hotbar';
import { EdgeArrows } from './hud/EdgeArrows';

// Panels
import { Scene01TitleMenu } from './panels/Scene01TitleMenu';
import { Scene02ProfilePanel } from './panels/Scene02ProfilePanel';
import { Scene03EnchantmentsPanel } from './panels/Scene03EnchantmentsPanel';
import { Scene04ChestPanel } from './panels/Scene04ChestPanel';
import { Scene05CraftingPanel } from './panels/Scene05CraftingPanel';
import { Scene06AdvancementsPanel } from './panels/Scene06AdvancementsPanel';
import { Scene07TradesPanel } from './panels/Scene07TradesPanel';
import { Scene08ConnectPanel } from './panels/Scene08ConnectPanel';
import { Scene09EndPanel } from './panels/Scene09EndPanel';

// Loading Screen
const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 250);
          return 100;
        }
        return p + Math.floor(Math.random() * 25) + 10;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#16131b] flex flex-col items-center justify-center select-none font-pixel">
      {/* Brand Title */}
      <h1 className="text-3xl sm:text-4xl text-white tracking-widest drop-shadow-[0_4px_0_#000]">
        {content.brand}
      </h1>
      <div className="mt-2 text-xs text-mc-village">
        Generating Terrain & Biomes...
      </div>

      {/* Minecraft-style Loading Progress Bar */}
      <div className="mt-8 w-64 sm:w-80 h-5 bg-[#2b2b2b] border-2 border-t-[#555] border-l-[#555] border-b-[#111] border-r-[#111] p-[2px]">
        <div
          className="h-full bg-gradient-to-r from-[#44DD44] to-[#77FF55] transition-all duration-150"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      <div className="mt-4 text-[10px] text-gray-400">
        Loading Player: {content.mcUsername} ({progress}%)
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [isLoading, setIsLoading] = useState(!searchParams?.has('skipLoading'));
  const currentScene = useStore((s) => s.currentScene);
  const isMuted = useStore((s) => s.isMuted);
  const toggleMute = useStore((s) => s.toggleMute);
  const quality = useStore((s) => s.quality);
  const setQuality = useStore((s) => s.setQuality);

  // Background audio unlock on click
  const handleUserClick = () => {
    sounds.unlock();
  };

  return (
    <main
      onClick={handleUserClick}
      className="relative w-screen h-screen bg-[#09070f] text-white select-none overflow-hidden font-body"
    >
      {/* Initial Minecraft Loading Screen */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Top Left Global Info */}
      <TopLeftInfo />

      {/* Top Right Quick Controls (Mute / Quality) */}
      <header className="fixed top-5 right-6 z-40 flex items-center gap-2 select-none pointer-events-auto">
        {/* Quality Toggle */}
        <button
          onClick={() => {
            sounds.playClick();
            setQuality(quality === 'high' ? 'med' : quality === 'med' ? 'low' : 'high');
          }}
          className="px-2.5 py-1.5 mc-button font-pixel text-[9px] uppercase tracking-wider"
          title="Toggle Rendering Quality"
        >
          {quality} Q
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={() => {
            sounds.playClick();
            toggleMute();
          }}
          className={`px-2.5 py-1.5 mc-button font-pixel text-[9px] uppercase tracking-wider ${
            isMuted ? 'text-red-400' : 'text-mc-village'
          }`}
          title="Toggle SFX Mute [M]"
        >
          {isMuted ? '🔇 Muted' : '🔊 Sound'}
        </button>
      </header>

      {/* Edge Navigation Arrow Buttons */}
      <EdgeArrows />

      {/* 3D Real-time Scene Viewport */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas
          shadows={quality !== 'low'}
          gl={{
            preserveDrawingBuffer: true,
            antialias: quality === 'high',
            powerPreference: 'high-performance'
          }}
          camera={{ position: [0, 2.2, 5.8], fov: 45 }}
          className="w-full h-full"
        >
          <color attach="background" args={[BIOMES[currentScene]?.skyColor || '#140A22']} />
          <Suspense fallback={null}>
            <SceneManager />
          </Suspense>
        </Canvas>
      </div>

      {/* Active Scene UI Panels */}
      <section aria-live="polite">
        {currentScene === 0 && <Scene01TitleMenu />}
        {currentScene === 1 && <Scene02ProfilePanel />}
        {currentScene === 2 && <Scene03EnchantmentsPanel />}
        {currentScene === 3 && <Scene04ChestPanel />}
        {currentScene === 4 && <Scene05CraftingPanel />}
        {currentScene === 5 && <Scene06AdvancementsPanel />}
        {currentScene === 6 && <Scene07TradesPanel />}
        {currentScene === 7 && <Scene08ConnectPanel />}
        {currentScene === 8 && <Scene09EndPanel />}
      </section>

      {/* Bottom Center Global HUD (Status Bars + 9-slot Hotbar) */}
      <nav aria-label="Minecraft Hotbar" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1.5 pointer-events-none">
        <StatusBars />
        <Hotbar />
      </nav>
    </main>
  );
};

export default App;
