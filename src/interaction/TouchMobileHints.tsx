import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { sounds } from '../audio/soundManager';

export const TouchMobileHints: React.FC = () => {
  const [isTouch, setIsTouch] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const resetWorld = useStore((s) => s.resetWorld);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      setIsTouch(true);
    }
  }, []);

  if (!isTouch || dismissed) return null;

  return (
    <aside
      aria-label="Touch Controls"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-black/75 border border-[#55FF55] px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-pixel text-mc-village shadow-lg animate-pulse pointer-events-auto"
    >
      <span>👉 Tap: React • Hold: Mine • Swipe: Biomes</span>
      <button
        onClick={() => {
          sounds.playClick();
          resetWorld();
        }}
        className="px-1.5 py-0.5 bg-[#222] border border-[#55FF55] text-white hover:bg-[#333]"
      >
        Reset World
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-400 hover:text-white ml-1"
        title="Dismiss Hint"
      >
        ✕
      </button>
    </aside>
  );
};
