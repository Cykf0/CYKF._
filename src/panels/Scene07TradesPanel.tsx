import React, { useState } from 'react';
import { content } from '../content';
import { EmeraldIcon, ItemIcon } from '../hud/PixelIcons';
import { useStore } from '../store';
import { sounds } from '../audio/soundManager';

export const Scene07TradesPanel: React.FC<{ onMakeOffer?: () => void }> = ({ onMakeOffer }) => {
  const setScene = useStore((s) => s.setScene);
  const [hoveredTrade, setHoveredTrade] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleOfferClick = () => {
    sounds.playClick();
    if (onMakeOffer) {
      onMakeOffer();
    } else {
      setScene(7); // Go to Connect
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          sounds.playVillagerHmm();
          setIsOpen(true);
        }}
        className="absolute top-[14%] left-[4%] z-30 mc-button px-3 py-1.5 font-pixel text-xs text-white/90 hover:text-white flex items-center gap-2 pointer-events-auto shadow-lg"
        title="Open Villager Trades"
      >
        <span>🌾 Villager Trades</span>
        <span className="text-[10px] text-emerald-400">▶</span>
      </button>
    );
  }

  return (
    <div className="absolute top-[14%] left-[4%] sm:left-[6%] z-30 w-[390px] sm:w-[460px] mc-panel p-4 sm:p-5 select-none pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h2 className="font-pixel text-sm text-white tracking-wider">
          Villager Trades
        </h2>
        <div className="flex items-center gap-3">
          <span className="font-pixel text-[9px] text-gray-400">
            {content.tradeLevelText}
          </span>
          {/* Small Corner Close Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsOpen(false);
            }}
            className="w-5 h-5 mc-button font-pixel text-[10px] text-gray-300 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 4 Trade Rows */}
      <div className="mt-4 space-y-2.5">
        {content.trades.map((trade) => {
          const isHovered = hoveredTrade === trade.id;

          return (
            <div
              key={trade.id}
              onMouseEnter={() => {
                sounds.playHotbarTick();
                setHoveredTrade(trade.id);
              }}
              onMouseLeave={() => setHoveredTrade(null)}
              className={`p-2.5 rounded-[2px] flex items-center justify-between gap-3 border transition-colors ${
                isHovered
                  ? 'bg-emerald-950/40 border-emerald-500/50'
                  : 'bg-black/30 border-white/5 hover:border-white/20'
              }`}
            >
              {/* Cost: Emerald Icon + Count */}
              <div className="flex items-center gap-1.5 w-14 shrink-0">
                <EmeraldIcon className="w-5 h-5" />
                <span className="font-pixel text-xs text-white">
                  {trade.price}
                </span>
              </div>

              {/* Arrow */}
              <span className="font-pixel text-xs text-gray-400">→</span>

              {/* Trade Item Icon */}
              <div className="w-8 h-8 bg-black/50 border border-white/20 flex items-center justify-center shrink-0 p-1">
                <ItemIcon name={trade.icon} className="w-6 h-6" alt={trade.service} />
              </div>

              {/* Service Info */}
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-[11px] text-white truncate">
                  {trade.service}
                </div>
                <div className="font-body text-[11px] text-gray-400 truncate">
                  {trade.description}
                </div>
              </div>

              {/* Stock Status Tag */}
              <span
                className={`font-pixel text-[8px] uppercase px-2 py-1 tracking-wider shrink-0 ${
                  trade.stockStatus === 'In stock'
                    ? 'bg-emerald-900/60 text-mc-village border border-emerald-600/50'
                    : 'bg-amber-900/60 text-amber-300 border border-amber-600/50'
                }`}
              >
                {trade.stockStatus}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3 Stat Boxes (Builds / Clients / Countries) */}
      <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center font-pixel">
        <div className="p-2 bg-black/40 border border-white/10">
          <div className="text-sm sm:text-base text-mc-village font-bold">
            {content.stats.builds}
          </div>
          <div className="text-[8px] text-gray-400 uppercase tracking-wider mt-0.5">
            BUILDS
          </div>
        </div>
        <div className="p-2 bg-black/40 border border-white/10">
          <div className="text-sm sm:text-base text-mc-village font-bold">
            {content.stats.clients}
          </div>
          <div className="text-[8px] text-gray-400 uppercase tracking-wider mt-0.5">
            CLIENTS
          </div>
        </div>
        <div className="p-2 bg-black/40 border border-white/10">
          <div className="text-sm sm:text-base text-mc-village font-bold">
            {content.stats.countries}
          </div>
          <div className="text-[8px] text-gray-400 uppercase tracking-wider mt-0.5">
            COUNTRIES
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="mt-4 pt-2 flex items-center justify-between">
        <button
          onClick={handleOfferClick}
          className="px-4 py-2 mc-button font-pixel text-xs tracking-wider"
        >
          Make an Offer →
        </button>
        <span className="font-pixel text-[9px] text-gray-400">
          Click Villager for "Hmm"
        </span>
      </div>
    </div>
  );
};
