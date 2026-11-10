import React from 'react';
import { useStore } from '../store';
import { content } from '../content';
import { sounds } from '../audio/soundManager';

export const Scene01TitleMenu: React.FC = () => {
  const setScene = useStore((s) => s.setScene);

  const handleNav = (index: number) => {
    sounds.playClick();
    setScene(index);
  };

  return (
    <div className="absolute top-[18%] left-[8%] z-30 max-w-md select-none pointer-events-auto">
      {/* Big Minecraft-style Pixel Brand Logo */}
      <div className="relative mb-6">
        <h1 className="font-pixel text-4xl sm:text-5xl font-black tracking-wider text-white drop-shadow-[0_4px_0_#000000] [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,0_5px_15px_rgba(0,0,0,0.8)]">
          {content.brand}
        </h1>
        <div className="mt-2 font-pixel text-[11px] text-[#FFAA00] tracking-widest uppercase drop-shadow-[0_2px_0_#000]">
          Interactive 3D Portfolio
        </div>
      </div>

      {/* Minecraft Main-Menu Style Button Column */}
      <div className="flex flex-col gap-2.5 w-64 sm:w-72">
        <button
          onClick={() => handleNav(1)}
          className="w-full py-3 px-4 mc-button font-pixel text-xs tracking-wider uppercase text-left flex items-center justify-between group"
        >
          <span>Enter World</span>
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
          onClick={() => handleNav(6)}
          className="w-full py-3 px-4 mc-button font-pixel text-xs tracking-wider uppercase text-left flex items-center justify-between group"
        >
          <span>Villager's Trades</span>
          <span className="text-mc-village opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
        </button>

        <button
          onClick={() => handleNav(7)}
          className="w-full py-3 px-4 mc-button font-pixel text-xs tracking-wider uppercase text-left flex items-center justify-between group"
        >
          <span>Let's Connect</span>
          <span className="text-[#FFAA00] opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
        </button>
      </div>

      {/* Hint text */}
      <div className="mt-4 text-xs text-gray-400 font-pixel tracking-wider text-[9px]">
        Press [1-9] to warp · Click buttons to explore
      </div>
    </div>
  );
};
