import React from 'react';
import { useStore } from '../store';
import { sounds } from '../audio/soundManager';
import { content } from '../content';

export const VillageIntroDialog: React.FC = () => {
  const showIntro = useStore((s) => s.showIntroGreeting);
  const setShowIntro = useStore((s) => s.setShowIntroGreeting);
  const setTitleScreen = useStore((s) => s.setTitleScreen);
  const setScene = useStore((s) => s.setScene);
  const currentScene = useStore((s) => s.currentScene);

  if (!showIntro || currentScene !== 0) return null;

  return (
    <div
      role="region"
      aria-label="Cykf Intro Dialogue"
      className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl select-none font-pixel pointer-events-auto"
    >
      <div className="bg-[#1f1a24]/95 border-2 border-t-[#665577] border-l-[#665577] border-b-[#110e14] border-r-[#110e14] p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
        {/* Speaker Nameplate & Title */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#3b3247]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#332244] border border-[#775599] flex items-center justify-center text-base">
              👋
            </div>
            <div>
              <div className="text-[#FFDD55] text-xs sm:text-sm font-bold tracking-wider drop-shadow-[0_1px_0_#000]">
                {content.owner} ({content.mcUsername})
              </div>
              <div className="text-[10px] text-gray-400">
                B.Tech 1st Year Student · Creative Developer
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setShowIntro(false);
            }}
            className="w-6 h-6 mc-button text-xs flex items-center justify-center text-gray-300 hover:text-white"
            title="Close Dialogue [Esc]"
          >
            ✕
          </button>
        </div>

        {/* Intro Message */}
        <div className="text-xs sm:text-sm text-gray-200 leading-relaxed drop-shadow-[0_1px_0_#000] mb-4 space-y-2">
          <p className="text-sm sm:text-base font-bold text-[#FFAA00] tracking-wide">
            "Hi.... 👋
          </p>
          <p>
            this is the devlopers archive welcome and nice to meet you! :)
          </p>
          <p className="text-gray-300 text-[11px] sm:text-xs">
            I'm <span className="text-[#55FF55] font-semibold">{content.owner}</span> (aka <span className="text-[#55FFFF] font-semibold">{content.mcUsername}</span>) — a B.Tech 1st year student & passionate developer crafting interactive 3D voxel experiences with Three.js, modern web projects, and exploring computer science.
          </p>
          <p className="text-gray-400 text-[11px] sm:text-xs">
            Feel free to look around, inspect my projects in the chests, or press <span className="text-[#FFAA00] font-bold">[1-9]</span> on your hotbar to journey through all 9 biomes!"
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#3b3247]">
          <button
            onClick={() => {
              sounds.playClick();
              setShowIntro(false);
            }}
            className="px-3.5 py-1.5 mc-button text-xs text-mc-village hover:text-white flex-1 min-w-[120px] text-center uppercase"
          >
            Explore Archive
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setShowIntro(false);
              setScene(1);
            }}
            className="px-3 py-1.5 mc-button text-xs text-gray-200 hover:text-white flex-1 min-w-[110px] text-center uppercase"
          >
            Player Profile
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setShowIntro(false);
              setScene(3);
            }}
            className="px-3 py-1.5 mc-button text-xs text-gray-200 hover:text-white flex-1 min-w-[110px] text-center uppercase"
          >
            Loot Chests
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setShowIntro(false);
              setTitleScreen(true);
            }}
            className="px-2.5 py-1.5 mc-button text-[10px] text-gray-400 hover:text-white text-center uppercase"
            title="Return to Main Menu"
          >
            Title Menu
          </button>
        </div>
      </div>
    </div>
  );
};
