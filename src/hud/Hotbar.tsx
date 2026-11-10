import React, { useEffect, useState } from 'react';
import { useStore, BIOMES } from '../store';
import {
  GrassBlockIcon,
  EnchantedBookIcon,
  ChestIcon,
  CraftingTableIcon,
  NetherStarIcon,
  EmeraldIcon,
  BookAndQuillIcon,
  EnderEyeIcon
} from './PixelIcons';
import { sounds } from '../audio/soundManager';
import { loadAndProcessSkin } from '../player/SkinTexture';
import { content } from '../content';

export const Hotbar: React.FC = () => {
  const currentScene = useStore((s) => s.currentScene);
  const setScene = useStore((s) => s.setScene);
  const isTransitioning = useStore((s) => s.isTransitioning);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  useEffect(() => {
    loadAndProcessSkin(content.skinPath, content.skinModel)
      .then((data) => setAvatarUrl(data.avatarUrl))
      .catch(() => {});
  }, []);

  const handleSelect = (idx: number) => {
    if (idx === currentScene || isTransitioning) return;
    sounds.playHotbarTick();
    setScene(idx);
  };

  const slotTooltips = [
    '1: Village Sunrise',
    '2: Player Profile',
    '3: Enchantments',
    '4: Completed Builds',
    '5: The Journey',
    '6: Advancements',
    '7: Villager Trades',
    '8: Let\'s Connect',
    '9: The End'
  ];

  return (
    <div className="flex flex-col items-center gap-2 select-none pointer-events-auto">
      {/* 9-Slot Hotbar Frame */}
      <div className="relative flex items-center bg-[#8f8f8f]/80 p-[2px] border-2 border-t-[#c6c6c6] border-l-[#c6c6c6] border-b-[#373737] border-r-[#373737] shadow-2xl">
        {BIOMES.map((biome, idx) => {
          const isSelected = currentScene === idx;

          return (
            <div
              key={biome.id}
              onClick={() => handleSelect(idx)}
              onMouseEnter={() => setHoveredSlot(idx)}
              onMouseLeave={() => setHoveredSlot(null)}
              className={`relative w-11 h-11 flex items-center justify-center cursor-pointer transition-transform duration-100 ${
                isSelected
                  ? 'scale-[1.08] z-20 border-[3px] border-white bg-black/60 shadow-lg'
                  : 'bg-[#2b2b2b]/90 border border-[#3b3b3b] hover:bg-[#3d3d3d]'
              }`}
            >
              {/* Corner Slot Number */}
              <span className="absolute top-[2px] left-[3px] font-pixel text-[8px] text-[#AAAAAA] leading-none pointer-events-none">
                {idx + 1}
              </span>

              {/* Slot Icon */}
              <div className="w-7 h-7 flex items-center justify-center pointer-events-none">
                {idx === 0 && <GrassBlockIcon className="w-6 h-6" />}
                {idx === 1 && (
                  avatarUrl ? (
                    <img src={avatarUrl} alt="Cykf" className="w-6 h-6 pixelated rounded-[1px]" />
                  ) : (
                    <div className="w-6 h-6 bg-[#ffeedd] border border-black flex items-center justify-center font-pixel text-[8px] text-black">
                      C
                    </div>
                  )
                )}
                {idx === 2 && <EnchantedBookIcon className="w-6 h-6" />}
                {idx === 3 && <ChestIcon className="w-6 h-6" />}
                {idx === 4 && <CraftingTableIcon className="w-6 h-6" />}
                {idx === 5 && <NetherStarIcon className="w-6 h-6" />}
                {idx === 6 && <EmeraldIcon className="w-6 h-6" />}
                {idx === 7 && <BookAndQuillIcon className="w-6 h-6" />}
                {idx === 8 && <EnderEyeIcon className="w-6 h-6" />}
              </div>

              {/* Tooltip on hover */}
              {hoveredSlot === idx && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#100f1c]/95 border border-[#4d4870] px-2 py-1 font-pixel text-[9px] text-[#e0b0ff] shadow-xl pointer-events-none z-30">
                  {slotTooltips[idx]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Dots (9 dots) */}
      <div className="flex items-center gap-2 mt-0.5">
        {BIOMES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            aria-label={`Go to scene ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-150 ${
              currentScene === i
                ? 'bg-white scale-125 ring-2 ring-black/80'
                : 'bg-white/40 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Key hint line */}
      <div className="font-pixel text-[8px] text-white/50 tracking-wider">
        [1-9] Biome | [A/D] Move | [F] Front Cam | [M] Sound
      </div>
    </div>
  );
};
