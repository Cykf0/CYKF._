import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { sounds } from '../audio/soundManager';
import { content } from '../content';

const SPLASHES = [
  "B.Tech Freshman & Builder!",
  "Saksham's Portfolio!",
  "100% Genuine Voxels!",
  "Welcome to Cykf._!",
  "Press [1-9] to warp biomes!",
  "Shader pack enabled!",
  "Try opening the chests!",
  "Crafting tables really work!",
  "Explore all 9 biomes!",
  "BSL / Complementary vibes!",
  "No smooth spheres allowed!",
  "May contain redstone!"
];

export const MinecraftHomeScreen: React.FC = () => {
  const isTitleScreen = useStore((s) => s.isTitleScreen);
  const setTitleScreen = useStore((s) => s.setTitleScreen);
  const setShowIntroGreeting = useStore((s) => s.setShowIntroGreeting);
  const setScene = useStore((s) => s.setScene);
  const quality = useStore((s) => s.quality);
  const setQuality = useStore((s) => s.setQuality);
  const isMuted = useStore((s) => s.isMuted);
  const toggleMute = useStore((s) => s.toggleMute);
  const setToastMessage = useStore((s) => s.setToastMessage);
  const setOptionsModalOpen = useStore((s) => s.setOptionsModalOpen);

  const [splashIndex, setSplashIndex] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);

  useEffect(() => {
    setSplashIndex(Math.floor(Math.random() * SPLASHES.length));
  }, []);

  if (!isTitleScreen) return null;

  const handleStartSingleplayer = () => {
    sounds.playClick();
    setTitleScreen(false);
    setScene(0);
    setShowIntroGreeting(true);

    setTimeout(() => {
      sounds.playLevelUp();
      setToastMessage({
        title: 'The Developer Archive',
        desc: 'Welcome to Cykf._ by Saksham Panwar!',
        icon: 'diamond_sword'
      });
    }, 600);
  };

  const handleMultiplayer = () => {
    sounds.playClick();
    setTitleScreen(false);
    setScene(7); // Scene 8 (Let's Connect)
  };

  const handleModsOrProjects = () => {
    sounds.playClick();
    setTitleScreen(false);
    setScene(3); // Scene 4 (Projects & Builds Loot Chest)
  };

  const handleProfile = () => {
    sounds.playClick();
    setTitleScreen(false);
    setScene(1); // Scene 2 (Player Profile)
  };

  return (
    <div
      role="region"
      aria-label="Minecraft Home Screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between py-8 px-4 select-none font-pixel pointer-events-auto bg-black/25 backdrop-blur-[1px]"
    >
      {/* Top Title Section */}
      <div className="relative mt-4 sm:mt-8 flex flex-col items-center text-center">
        {/* Authentic Minecraft-style 3D Pixel Stone Title */}
        <div className="relative inline-flex flex-col items-center">
          <h1 className="font-pixel text-5xl sm:text-7xl md:text-8xl font-black tracking-widest text-[#D4D4D4] drop-shadow-[0_8px_0_#000] [text-shadow:4px_4px_0_#2B2B2B,6px_6px_0_#151515,0_8px_20px_rgba(0,0,0,0.9),-2px_-2px_0_#555,2px_-2px_0_#555,-2px_2px_0_#555,2px_2px_0_#555]">
            CYKF
          </h1>

          {/* Subtitle: "A portfolio of ideas, experiments, and things I've built." */}
          <div className="mt-1 font-pixel text-[10px] sm:text-xs text-gray-300 tracking-wide drop-shadow-[0_2px_0_#000] max-w-sm sm:max-w-md text-center">
            A portfolio of ideas, experiments, and things I've built.
          </div>
        </div>
      </div>

      {/* Main Buttons Column (Exact Minecraft Main Menu Width & Layout) */}
      <div className="flex flex-col items-center gap-2.5 w-full max-w-[340px] sm:max-w-[400px] my-auto">
        {/* Singleplayer (Enters Forgotten Kingdom with Intro) */}
        <button
          onClick={handleStartSingleplayer}
          className="w-full py-2.5 sm:py-3 px-4 mc-button font-pixel text-xs sm:text-sm tracking-wider uppercase text-center text-gray-200 hover:text-white transition-colors"
        >
          Singleplayer (Enter World)
        </button>

        {/* Multiplayer (Connect / Server List) */}
        <button
          onClick={handleMultiplayer}
          className="w-full py-2.5 sm:py-3 px-4 mc-button font-pixel text-xs sm:text-sm tracking-wider uppercase text-center text-gray-200 hover:text-white transition-colors"
        >
          Multiplayer (Let's Connect)
        </button>

        {/* Projects / Builds */}
        <button
          onClick={handleModsOrProjects}
          className="w-full py-2.5 sm:py-3 px-4 mc-button font-pixel text-xs sm:text-sm tracking-wider uppercase text-center text-gray-200 hover:text-white transition-colors"
        >
          Projects & Builds
        </button>

        {/* Bottom Dual Row: [ Options... ] [ Quit Game ] with flanking icon buttons */}
        <div className="flex items-center gap-2 w-full">
          {/* Profile Shortcut */}
          <button
            onClick={handleProfile}
            className="w-10 h-10 sm:h-11 mc-button font-pixel text-sm flex items-center justify-center text-gray-200 hover:text-white"
            title="Player Profile (Cykf_)"
          >
            👤
          </button>

          {/* Options Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setOptionsModalOpen(true);
            }}
            className="flex-1 py-2.5 sm:py-3 px-3 mc-button font-pixel text-xs sm:text-sm tracking-wider uppercase text-center text-gray-200 hover:text-white"
          >
            Options...
          </button>

          {/* Quit Game Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowQuitModal(true);
            }}
            className="flex-1 py-2.5 sm:py-3 px-3 mc-button font-pixel text-xs sm:text-sm tracking-wider uppercase text-center text-gray-200 hover:text-white"
          >
            Quit Game
          </button>

          {/* Globe / Audio Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              toggleMute();
            }}
            className="w-10 h-10 sm:h-11 mc-button font-pixel text-sm flex items-center justify-center text-gray-200 hover:text-white"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      {/* Footer Info (Minecraft Bottom Corners) */}
      <div className="w-full flex items-end justify-between text-[10px] sm:text-xs text-gray-300 font-pixel tracking-wider drop-shadow-[0_1px_0_#000]">
        <div>
          <span>Created by Saksham Panwar</span>
        </div>
        <div className="flex flex-col items-end">
          {/* Yellow Bouncing Splash Text (In Right Down Corner, Small) */}
          <div
            className="mb-1 text-[#FFFF00] font-pixel text-[9px] sm:text-[10px] font-bold drop-shadow-[0_2px_0_#3f3f00] [text-shadow:1px_1px_0_#000] animate-bounce whitespace-nowrap transform -rotate-6 hover:scale-110 transition-transform cursor-pointer"
            onClick={() => setSplashIndex((splashIndex + 1) % SPLASHES.length)}
            title="Click for another splash!"
          >
            {SPLASHES[splashIndex]}
          </div>
          <span>© Cykf._</span>
        </div>
      </div>



      {/* Quit Confirmation Easter Egg Modal */}
      {showQuitModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-[2px] font-pixel p-4"
        >
          <div className="w-full max-w-sm bg-[#2b2b2b] border-2 border-t-[#555] border-l-[#555] border-b-[#111] border-r-[#111] p-6 text-center shadow-2xl">
            <h3 className="text-base text-[#FFAA00] mb-2 drop-shadow-[0_2px_0_#000]">
              Leaving so soon?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              You haven't explored all 9 biomes yet! There are hidden chests, custom shaders, and interactive crafting stations waiting for you.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowQuitModal(false);
                  handleStartSingleplayer();
                }}
                className="flex-1 py-2 mc-button text-xs uppercase text-mc-village"
              >
                Stay & Explore
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowQuitModal(false);
                }}
                className="flex-1 py-2 mc-button text-xs uppercase text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
