import React from 'react';
import { useStore } from '../store';
import { sounds } from '../audio/soundManager';

export const EdgeArrows: React.FC = () => {
  const currentScene = useStore((s) => s.currentScene);
  const nextScene = useStore((s) => s.nextScene);
  const prevScene = useStore((s) => s.prevScene);
  const isTransitioning = useStore((s) => s.isTransitioning);

  const handlePrev = () => {
    if (isTransitioning || currentScene <= 0) return;
    sounds.playSceneTransition();
    prevScene();
  };

  const handleNext = () => {
    if (isTransitioning || currentScene >= 8) return;
    sounds.playSceneTransition();
    nextScene();
  };

  return (
    <>
      {/* Left Edge Arrow */}
      {currentScene > 0 && (
        <button
          onClick={handlePrev}
          aria-label="Previous Scene"
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 border-2 border-black/40"
        >
          <svg className="w-5 h-5 -translate-x-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right Edge Arrow */}
      {currentScene < 8 && (
        <button
          onClick={handleNext}
          aria-label="Next Scene"
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 border-2 border-black/40"
        >
          <svg className="w-5 h-5 translate-x-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </>
  );
};
