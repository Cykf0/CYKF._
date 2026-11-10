import React from 'react';
import { useStore } from '../store';

export const AdvancementToast: React.FC = () => {
  const toastMessage = useStore((s) => s.toastMessage);

  if (!toastMessage) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#212121] border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-b-[#000000] border-r-[#000000] p-3 shadow-2xl font-pixel select-none animate-slide-in"
    >
      <div className="w-9 h-9 bg-[#111111] border border-[#555] flex items-center justify-center">
        <img
          src={`/items/${toastMessage.icon || 'diamond'}.png`}
          alt="icon"
          className="w-7 h-7 pixelated"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
      <div className="flex flex-col">
        <div className="text-[11px] text-[#FFFF55] font-bold tracking-wider uppercase">
          {toastMessage.title}
        </div>
        <div className="text-[10px] text-white">
          {toastMessage.desc}
        </div>
      </div>
    </aside>
  );
};
