import React from 'react';
import { content } from '../content';
import { useStore } from '../store';
import { sounds } from '../audio/soundManager';
import confetti from 'canvas-confetti';

export const Scene09EndPanel: React.FC = () => {
  const respawnToStart = useStore((s) => s.respawnToStart);
  const [isOpen, setIsOpen] = React.useState(true);

  const handleRespawn = () => {
    sounds.playPortalWarp();
    respawnToStart();
  };

  const handleFireworks = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          sounds.playClick();
          setIsOpen(true);
        }}
        className="absolute top-[18%] left-1/2 -translate-x-1/2 z-30 mc-button px-4 py-1.5 font-pixel text-xs text-white/90 hover:text-white flex items-center gap-2 pointer-events-auto shadow-lg"
        title="Open Victory Plaque"
      >
        <span>📜 The End</span>
        <span className="text-[10px] text-[#FFAA00]">▶</span>
      </button>
    );
  }

  return (
    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 z-30 max-w-lg text-center select-none pointer-events-auto flex flex-col items-center relative">
      {/* Small Corner Close Button */}
      <button
        onClick={() => {
          sounds.playClick();
          setIsOpen(false);
        }}
        className="absolute -top-3 -right-6 w-5 h-5 mc-button font-pixel text-[10px] text-gray-300 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
        title="Close"
      >
        ✕
      </button>

      {/* Small Caps Header */}
      <div className="font-pixel text-[11px] text-[#D8B4FE] tracking-[0.3em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {content.endPoem.title}
      </div>

      {/* Big Title */}
      <h1 className="font-pixel text-4xl sm:text-5xl font-black text-white mt-3 tracking-wider drop-shadow-[0_4px_0_#000000] [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000]">
        {content.endPoem.subtitle}
      </h1>

      {/* Quote */}
      <div className="mt-6 font-pixel text-xs text-[#E9D5FF] leading-relaxed max-w-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] space-y-2">
        <p>You reached the end of the world.</p>
        <p>But every world has another seed.</p>
        <p className="text-white font-semibold">Go build something nobody expects.</p>
      </div>

      {/* Respawn Button */}
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={handleRespawn}
          className="px-6 py-2.5 mc-button font-pixel text-xs tracking-wider uppercase"
        >
          {content.endPoem.respawnButtonText}
        </button>

        <button
          onClick={handleFireworks}
          title="Celebration fireworks"
          className="px-3 py-2.5 mc-button font-pixel text-xs"
        >
          ✨
        </button>
      </div>
    </div>
  );
};
