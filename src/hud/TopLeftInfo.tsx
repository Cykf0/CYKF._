import React, { useState } from 'react';
import { useStore, BIOMES } from '../store';
import { content } from '../content';
import { sounds } from '../audio/soundManager';

const BIOME_FACTS: string[] = [
  'The Developer Archive: Where ideas, experiments, and codebases are forged into reality.',
  'The Eternal Forest: Colossal fantasy canopies, ancient logs, and the archivist\'s woodland cabin.',
  'The Arcane Library: Towering bookshelves, glowing glyphs, and legendary enchanting daises.',
  'The Abandoned Mines: Rich ore strata, molten lava pools, and forgotten miner supply caches.',
  'The Frozen Frontier: Frigid jagged peaks, smoking stone chimneys, and warming alpine hearths.',
  'The Deep Dark: Subterranean ruins, ancient reinforced deepslate portals, and sculk vibrations.',
  'The Villager\'s Home: Vibrant village square with wheat harvests, market stalls, and emerald trades.',
  'The Lost Paradise: Lush underground oasis with waterfalls, amethyst geodes, and swimming axolotls.',
  'The Endless Void: Cosmic dimension with obsidian pillars, volatile crystals, and void dragon breath.',
];

export const TopLeftInfo: React.FC = () => {
  const currentScene = useStore((s) => s.currentScene);
  const biome = BIOMES[currentScene] || BIOMES[0];
  const inGameTime = useStore((s) => s.inGameTime);
  const fastForwardTime = useStore((s) => s.fastForwardTime);
  const discoveredCount = useStore((s) => s.discoveredCount);
  const totalDiscoveries = useStore((s) => s.totalDiscoveries);
  const resetWorld = useStore((s) => s.resetWorld);
  const [showFact, setShowFact] = useState(false);
  const [letterWobble, setLetterWobble] = useState<number | null>(null);

  const brandLetters = ['C', 'y', 'k', 'f', '.', '_'];
  const frequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

  const handleLetterClick = (idx: number) => {
    setLetterWobble(idx);
    sounds.playWobble(frequencies[idx] || 440);
    useStore.getState().recordDiscovery(`brand_letter_${idx}`, 'UI', `Brand letter "${brandLetters[idx]}"`);
    setTimeout(() => setLetterWobble(null), 400);
  };

  return (
    <div className="fixed top-5 left-6 z-40 select-none pointer-events-auto font-pixel text-xs tracking-wider">
      {/* Brand & Version with per-letter wobble */}
      <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-2">
        <div className="flex items-center">
          {brandLetters.map((char, idx) => (
            <button
              key={idx}
              onClick={() => handleLetterClick(idx)}
              className={`inline-block transition-transform duration-200 cursor-pointer hover:text-mc-village ${
                letterWobble === idx ? '-translate-y-1 scale-125 text-[#FFFF55]' : ''
              }`}
              title={`Click letter ${char}`}
            >
              {char}
            </button>
          ))}
        </div>
        <span
          className="text-[#AAAAAA] text-[10px] cursor-pointer hover:text-white"
          title={`Portfolio Version ${content.version} • Built for Saksham`}
          onClick={() => sounds.playClick()}
        >
          {content.version}
        </span>
      </div>

      {/* Biome Name with Biome Color & Clickable Fun Fact */}
      <div className="mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-1.5">
        <span className="text-[#AAAAAA]">Biome: </span>
        <button
          onClick={() => {
            sounds.playClick();
            setShowFact(!showFact);
            useStore.getState().recordDiscovery(`biome_fact_${currentScene}`, 'UI', `Biome ${biome.name} Fact`);
          }}
          style={{ color: biome.color }}
          className="font-semibold underline decoration-dotted underline-offset-2 hover:brightness-125"
          title="Click for Biome lore"
        >
          {biome.name}
        </button>
      </div>

      {showFact && (
        <div className="mt-1 max-w-xs bg-black/85 border border-[#777] p-2 text-[10px] text-gray-200 rounded shadow-xl">
          {BIOME_FACTS[currentScene]}
        </div>
      )}

      {/* In-game Day & Clickable Clock */}
      <div className="mt-1 text-[#CCCCCC] text-[10px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-2">
        <span>Day {biome.day}</span>
        <span>·</span>
        <button
          onClick={() => {
            sounds.playClick();
            fastForwardTime(2);
            useStore.getState().recordDiscovery('clock_fast_forward', 'UI', 'Fast-Forward In-Game Clock');
          }}
          className="hover:text-yellow-300 underline decoration-dotted cursor-pointer"
          title="Click to fast-forward time [+2h]"
        >
          ⏰ {inGameTime}
        </button>
      </div>

      {/* Discovery Counter per Section 4 */}
      <div className="mt-2 flex items-center gap-2">
        <div
          className="px-2 py-0.5 bg-black/60 border border-mc-village text-[10px] text-mc-village flex items-center gap-1 cursor-pointer hover:bg-black/80"
          onClick={() => {
            sounds.playXpOrb();
            useStore.getState().setToastMessage({
              title: `Discoveries (${discoveredCount}/${totalDiscoveries})`,
              desc: 'Interact with blocks, mobs, props, plants, lights and HUD elements to discover more!',
              icon: 'book'
            });
            setTimeout(() => useStore.getState().setToastMessage(null), 3500);
          }}
          title="Total interactions discovered"
        >
          <span>🏆 Discoveries:</span>
          <span className="font-bold text-white">{discoveredCount} / {totalDiscoveries}</span>
        </div>

        {/* Global Reset World Button */}
        <button
          onClick={() => {
            sounds.playClick();
            resetWorld();
          }}
          className="px-2 py-0.5 mc-button text-[9px] uppercase tracking-wider text-gray-200 hover:text-white"
          title="Reset World to original state [R]"
        >
          ↺ Reset [R]
        </button>
      </div>
    </div>
  );
};
