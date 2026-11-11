import React from 'react';
import { useStore } from '../store';
import { content } from '../content';
import { sounds } from '../audio/soundManager';

export const Scene01TitleMenu: React.FC = () => {
  const setScene = useStore((s) => s.setScene);
  const setTitleScreen = useStore((s) => s.setTitleScreen);
  const setShowIntroGreeting = useStore((s) => s.setShowIntroGreeting);
  const [isOpen, setIsOpen] = React.useState(true);

  const handleNav = (index: number) => {
    sounds.playClick();
    setScene(index);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          sounds.playClick();
          setIsOpen(true);
        }}
        className="absolute top-[18%] left-[6%] z-30 mc-button px-3 py-1.5 font-pixel text-xs text-white/90 hover:text-white flex items-center gap-2 pointer-events-auto shadow-lg"
        title="Open Navigation Menu"
      >
        <span>☰ Menu</span>
        <span className="text-[10px] text-[#FFAA00]">▶</span>
      </button>
    );
  }

  return (
    <div className="absolute top-[18%] left-[8%] z-30 max-w-md select-none pointer-events-auto">
      {/* Big Minecraft-style Pixel Brand Logo with Close Button */}
      <div className="relative mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-pixel text-4xl sm:text-5xl font-black tracking-wider text-white drop-shadow-[0_4px_0_#000000] [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,0_5px_15px_rgba(0,0,0,0.8)]">
            {content.brand}
          </h1>
          <div className="mt-2 font-pixel text-[11px] text-[#FFAA00] tracking-widest uppercase drop-shadow-[0_2px_0_#000]">
            The Developer Archive • {content.owner}
          </div>
        </div>

        {/* Small Corner Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsOpen(false);
          }}
          className="w-5 h-5 mc-button font-pixel text-[10px] text-gray-300 hover:text-white flex items-center justify-center shrink-0 cursor-pointer mt-1"
          title="Close Menu"
        >
          ✕
        </button>
      </div>

      {/* Minecraft Style Button Column */}
      <div className="flex flex-col gap-2.5 w-64 sm:w-72">
        <button
          onClick={() => {
            sounds.playClick();
            setShowIntroGreeting(true);
          }}
          className="w-full py-3 px-4 mc-button font-pixel text-xs tracking-wider uppercase text-left flex items-center justify-between group"
        >
          <span className="text-mc-village">👋 Cykf's Intro</span>
          <span className="text-mc-village opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
        </button>

        <button
          onClick={() => handleNav(1)}
          className="w-full py-3 px-4 mc-button font-pixel text-xs tracking-wider uppercase text-left flex items-center justify-between group"
        >
          <span>Player Profile</span>
          <span className="text-mc-cherry opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
        </button>

        <button
          onClick={() => handleNav(3)}
          className="w-full py-3 px-4 mc-button font-pixel text-xs tracking-wider uppercase text-left flex items-center justify-between group"
        >
          <span>Loot Chest (Builds)</span>
          <span className="text-[#FFAA00] opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
        </button>

        <button
          onClick={() => handleNav(6)}
          className="w-full py-3 px-4 mc-button font-pixel text-xs tracking-wider uppercase text-left flex items-center justify-between group"
        >
          <span>Villager's Trades</span>
          <span className="text-mc-village opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setTitleScreen(true);
          }}
          className="w-full py-2.5 px-4 mc-button font-pixel text-[11px] tracking-wider uppercase text-left text-gray-300 hover:text-white flex items-center justify-between group"
        >
          <span>⌂ Title Screen</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
        </button>
      </div>

      {/* Hint text with high contrast and 1px dark text shadow */}
      <div className="mt-4 text-gray-200 font-pixel tracking-wider text-xs drop-shadow-[0_2px_0_#000] [text-shadow:1px_1px_0_#000]">
        Press [1-9] to warp biomes · [E] Inventory · [F3] Debug
      </div>
    </div>
  );
};
