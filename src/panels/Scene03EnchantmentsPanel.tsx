import React, { useState } from 'react';
import { content, SkillItem } from '../content';
import { sounds } from '../audio/soundManager';

export const Scene03EnchantmentsPanel: React.FC = () => {
  const [hoveredSkill, setHoveredSkill] = useState<SkillItem | null>(null);

  return (
    <div className="absolute top-[14%] left-[6%] z-30 w-[380px] sm:w-[440px] mc-panel p-5 select-none pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h2 className="font-pixel text-sm text-white tracking-wider flex items-center gap-2">
          <span>Enchantments</span>
        </h2>
        <span className="font-pixel text-[9px] text-mc-stronghold uppercase">
          Table Tier 30
        </span>
      </div>

      {/* 7 Skill Rows */}
      <div className="mt-4 space-y-2.5">
        {content.skills.map((skill) => {
          const isHovered = hoveredSkill?.id === skill.id;

          return (
            <div
              key={skill.id}
              onMouseEnter={() => {
                sounds.playHotbarTick();
                setHoveredSkill(skill);
              }}
              onMouseLeave={() => setHoveredSkill(null)}
              className={`p-2 transition-all rounded-[2px] cursor-pointer flex items-center justify-between gap-3 ${
                isHovered
                  ? 'bg-purple-900/40 border border-purple-500/50 shadow-[0_0_15px_rgba(179,136,255,0.2)]'
                  : 'bg-black/30 border border-white/5 hover:border-white/20'
              }`}
            >
              {/* Roman Numeral Level */}
              <span className="font-pixel text-[11px] text-[#FFAA00] font-bold w-6 text-center">
                {skill.romanLevel}
              </span>

              {/* Skill Name */}
              <span className="font-pixel text-[11px] text-gray-200 flex-1 truncate">
                {skill.name}
              </span>

              {/* Gradient Progress Bar */}
              <div className="w-32 sm:w-40 h-2 bg-black/70 border border-white/10 overflow-hidden rounded-[1px] p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-[#00E5FF] to-[#B388FF] transition-all duration-500"
                  style={{ width: `${skill.percentage}%` }}
                />
              </div>

              {/* Percentage */}
              <span className="font-pixel text-[10px] text-gray-400 w-8 text-right">
                {skill.percentage}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Helper Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-gray-400 font-pixel tracking-wider text-center">
        {hoveredSkill ? (
          <span className="text-[#FFDD55]">
            Level {hoveredSkill.romanLevel} · Mastered {hoveredSkill.name} ({hoveredSkill.percentage}%)
          </span>
        ) : (
          <span>Hover an enchantment to inspect it</span>
        )}
      </div>
    </div>
  );
};
