import React, { useEffect, useState } from 'react';
import { content } from '../content';
import { useStore } from '../store';
import { sounds } from '../audio/soundManager';

export const Scene06AdvancementsPanel: React.FC = () => {
  const setScene = useStore((s) => s.setScene);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(true);
      sounds.playToastJingle();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Pop-up Minecraft Advancement Toast */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#242428] border-2 border-[#FFAA00] p-3 shadow-2xl animate-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="w-8 h-8 bg-black/60 border border-[#FFAA00] flex items-center justify-center font-pixel text-xs text-[#FFAA00]">
            ★
          </div>
          <div>
            <div className="font-pixel text-[9px] text-[#FFAA00] uppercase tracking-wider">
              Advancement Made!
            </div>
            <div className="font-pixel text-[11px] text-white mt-0.5">
              Deep Dark Explorer
            </div>
          </div>
        </div>
      )}

      {/* Main Panel on the Right Side (per Reference) */}
      <div className="absolute top-[16%] right-[6%] z-30 w-[380px] sm:w-[440px] mc-panel p-5 select-none pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h2 className="font-pixel text-sm text-white tracking-wider">
            Advancements
          </h2>
          <span className="font-pixel text-[9px] text-mc-deepdark">
            4 / 5 Complete
          </span>
        </div>

        {/* Advancements List */}
        <div className="mt-4 space-y-3">
          {content.advancements.map((adv) => {
            return (
              <div
                key={adv.id}
                className={`p-3 rounded-[2px] flex items-start gap-3 border transition-colors ${
                  adv.completed
                    ? 'bg-black/40 border-white/10 hover:border-mc-deepdark/50'
                    : 'bg-black/20 border-white/5 opacity-50'
                }`}
              >
                {/* Gold Framed Icon Box */}
                <div
                  className={`w-9 h-9 flex items-center justify-center border-2 font-pixel text-xs shrink-0 ${
                    adv.completed
                      ? 'border-[#FFAA00] bg-black/60 text-[#FFAA00]'
                      : 'border-gray-600 bg-black/40 text-gray-500'
                  }`}
                >
                  {adv.completed ? '✔' : '🔒'}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-pixel text-[11px] text-white">
                      {adv.title}
                    </h3>
                    {adv.completed && (
                      <span className="font-pixel text-[10px] text-mc-village">
                        ✔
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-gray-300 mt-1 leading-relaxed">
                    {adv.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Button */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => {
              sounds.playClick();
              setScene(7); // Lush Caves Connect
            }}
            className="px-4 py-2 mc-button font-pixel text-xs tracking-wider"
          >
            Send a Message →
          </button>
          <span className="font-pixel text-[9px] text-gray-400">
            Ancient City Y=-52
          </span>
        </div>
      </div>
    </>
  );
};
