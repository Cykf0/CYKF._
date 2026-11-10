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
  const popHeart = useStore((s) => s.popHeart);
  const eatFood = useStore((s) => s.eatFood);

  const handleHeartClick = (i: number) => {
    sounds.playBlockHit('wood');
    popHeart();
    useStore.getState().recordDiscovery(`ui_heart_${i}`, 'UI', `Heart ${i + 1} Pop`);
  };

  const handleHungerClick = (i: number) => {
    sounds.playEat();
    eatFood();
    useStore.getState().recordDiscovery(`ui_hunger_${i}`, 'UI', `Hunger Drumstick ${i + 1}`);
  };

  const handleXpClick = () => {
    sounds.playXpOrb();
    addXp(1);
    useStore.getState().recordDiscovery('ui_xp_bar', 'UI', 'Experience Bar Level Up');
  };

  return (
    <div className="flex flex-col items-center gap-1 select-none pointer-events-auto">
      {/* Hearts & Hunger Row (Matches 364px hotbar width exactly) */}
      <div className="w-[364px] flex items-center justify-between px-[2px]">
        {/* 10 Interactive Hearts (Left) */}
        <div className={`flex items-center gap-[2px] transition-all ${isHurt ? 'brightness-200 scale-105' : ''}`}>
          {Array.from({ length: 10 }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleHeartClick(i)}
              className="cursor-pointer hover:scale-125 transition-transform"
              title={`Heart ${i + 1} (Click to pop!)`}
            >
              <HeartIcon filled={i < hearts} className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* 10 Interactive Hunger Drumsticks (Right) */}
        <div className="flex items-center gap-[2px]">
          {Array.from({ length: 10 }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleHungerClick(i)}
              className="cursor-pointer hover:scale-125 transition-transform"
              title={`Hunger ${i + 1} (Click to eat!)`}
            >
              <HungerIcon filled={i < hunger} className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Experience Bar & Level Number */}
      <div
        onClick={handleXpClick}
        title="Experience Bar (Click to gain XP!)"
        className="relative w-[364px] cursor-pointer group flex flex-col items-center"
      >
        {/* Level Number */}
        <div className="font-pixel text-[11px] text-[#80FF20] font-bold mb-0.5 tracking-wider drop-shadow-[0_2px_0_#000000] [text-shadow:1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000] group-hover:scale-110 transition-transform">
          {xpLevel}
        </div>

        {/* Bar Track (182px * 2 = 364px) */}
        <div className="w-full h-[6px] bg-[#1a2d12] border border-black overflow-hidden p-0">
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
