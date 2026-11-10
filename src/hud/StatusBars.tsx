import React from 'react';
import { useStore } from '../store';
import { HeartIcon, HungerIcon } from './PixelIcons';
import { sounds } from '../audio/soundManager';

export const StatusBars: React.FC = () => {
  const hearts = useStore((s) => s.hearts);
  const hunger = useStore((s) => s.hunger);
  const xpLevel = useStore((s) => s.xpLevel);
  const xpProgress = useStore((s) => s.xpProgress);
  const isHurt = useStore((s) => s.isHurt);
  const addXp = useStore((s) => s.addXp);

  const handleXpClick = () => {
    sounds.playXpOrb();
    addXp(1);
  };

  return (
    <div className="flex flex-col items-center gap-1 select-none pointer-events-auto">
      {/* Hearts & Hunger Row */}
      <div className="w-[382px] flex items-center justify-between px-1">
        {/* 10 Hearts (Left) */}
        <div className={`flex items-center gap-1 transition-all ${isHurt ? 'brightness-200 scale-105' : ''}`}>
          {Array.from({ length: 10 }).map((_, i) => (
            <HeartIcon key={i} filled={i < hearts} className="w-3 h-3" />
          ))}
        </div>

        {/* 10 Hunger Drumsticks (Right) */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <HungerIcon key={i} className="w-3 h-3" />
          ))}
        </div>
      </div>

      {/* Experience Bar & Level Number */}
      <div
        onClick={handleXpClick}
        title="Click for XP Orb!"
        className="relative w-[382px] cursor-pointer group flex flex-col items-center"
      >
        {/* Level Number */}
        <div className="font-pixel text-[11px] text-[#80FF20] font-bold mb-0.5 tracking-wider drop-shadow-[0_2px_0_#000000] [text-shadow:1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000]">
          {xpLevel}
        </div>

        {/* Bar Track */}
        <div className="w-full h-[5px] bg-[#1a2d12] border border-black/80 rounded-[1px] overflow-hidden p-[1px]">
          {/* Green Bar Fill */}
          <div
            className="h-full bg-gradient-to-r from-[#55FF55] to-[#80FF20] transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, xpProgress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
