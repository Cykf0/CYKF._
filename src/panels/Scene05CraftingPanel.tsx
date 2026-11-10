import React, { useState } from 'react';
import { content } from '../content';
import { sounds } from '../audio/soundManager';

export const Scene05CraftingPanel: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="absolute top-[15%] left-[6%] z-30 w-[420px] sm:w-[480px] mc-panel p-5 select-none pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h2 className="font-pixel text-sm text-white tracking-wider">
          Crafting - The Journey
        </h2>
        <span className="font-pixel text-[9px] text-mc-snowy">
          3 Recipes
        </span>
      </div>

      {/* 3 Recipe Rows */}
      <div className="mt-4 space-y-4">
        {content.journey.map((item, idx) => {
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.id}
              onMouseEnter={() => {
                sounds.playHotbarTick();
                setHoveredIdx(idx);
              }}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-3 transition-all rounded-[2px] flex items-start gap-4 ${
                isHovered
                  ? 'bg-blue-950/40 border border-blue-400/40'
                  : 'bg-black/30 border border-white/5'
              }`}
            >
              {/* 3 Input Slots */}
              <div className="flex items-center gap-1">
                {item.ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 flex items-center justify-center border text-[9px] font-pixel ${
                      isHovered
                        ? 'bg-[#3b3b44] border-mc-snowy text-white'
                        : 'bg-[#222226] border-white/15 text-gray-400'
                    }`}
                  >
                    {ing[0].toUpperCase()}
                  </div>
                ))}
              </div>

              {/* Crafting Arrow */}
              <div className="pt-1.5 font-pixel text-xs text-gray-400">
                →
              </div>

              {/* Result Details */}
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-[9px] text-[#70C5FF] tracking-wider uppercase">
                  {item.date}
                </div>
                <h3 className="font-pixel text-[11px] text-white mt-1 leading-snug">
                  {item.title}
                </h3>
                <p className="font-body text-xs text-gray-300 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-pixel text-[9px] text-gray-400">
        <span>Snowy Vista Altitude: Y=128</span>
        <span>Campfire Lit</span>
      </div>
    </div>
  );
};
