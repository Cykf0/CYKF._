import React, { useEffect, useState } from 'react';
import { useStore, BIOMES } from '../store';
import { content } from '../content';

export const TopLeftInfo: React.FC = () => {
  const currentScene = useStore((s) => s.currentScene);
  const biome = BIOMES[currentScene] || BIOMES[0];

  // Ticking in-game clock
  const [minutes, setMinutes] = useState(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setMinutes((m) => (m + 1) % 60);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const displayTime = `${biome.time.split(':')[0]}:${minutes < 10 ? '0' + minutes : minutes}`;

  return (
    <div className="fixed top-5 left-6 z-40 select-none pointer-events-auto font-pixel text-xs tracking-wider">
      {/* Brand & Version */}
      <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-2">
        <span className="text-[#FFFFFF]">{content.brand}</span>
        <span className="text-[#AAAAAA] text-[10px]">{content.version}</span>
      </div>

      {/* Biome Name with Biome Color */}
      <div className="mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <span className="text-[#AAAAAA]">Biome: </span>
        <span style={{ color: biome.color }} className="font-semibold">
          {biome.name}
        </span>
      </div>

      {/* In-game Day & Clock */}
      <div className="mt-1 text-[#CCCCCC] text-[10px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        Day {biome.day} · {displayTime}
      </div>
    </div>
  );
};
