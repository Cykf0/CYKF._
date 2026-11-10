import React, { useEffect, useState } from 'react';
import { useStore, BIOMES } from '../store';
import { ItemIcon } from './PixelIcons';
import { sounds } from '../audio/soundManager';
import { loadAndProcessSkin } from '../player/SkinTexture';
import { content } from '../content';

export const Hotbar: React.FC = () => {
  const currentScene = useStore((s) => s.currentScene);
  const setScene = useStore((s) => s.setScene);
  const selectedSlot = useStore((s) => s.selectedHotbarSlot);
  const setSelectedSlot = useStore((s) => s.setSelectedHotbarSlot);
  const toggleInventory = useStore((s) => s.toggleInventory);
  const isTransitioning = useStore((s) => s.isTransitioning);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  useEffect(() => {
    loadAndProcessSkin(content.skinPath, content.skinModel)
      .then((data) => setAvatarUrl(data.avatarUrl))
      .catch(() => {});
  }, []);

  const handleSelect = (idx: number) => {
    sounds.playHotbarTick();
    setSelectedSlot(idx);
    if (idx !== currentScene && !isTransitioning) {
      setScene(idx);
    }
    useStore.getState().recordDiscovery(`hotbar_slot_${idx}`, 'UI', `Hotbar Slot ${idx + 1}`);
  };

  const slotTooltips = [
    '1: Diamond Pickaxe [Mines 3x Fast]',
    '2: Cherry Sapling / Saksham Profile',
    '3: Enchanted Book [Sharpness V]',
    '4: Treasure Chest [Project Vault]',
    '5: Crafting Table [Recipe Grid]',
    '6: Nether Star / Advancements',
    '7: Emerald [Villager Trading]',
    '8: Book & Quill [Let\'s Connect]',
    '9: Eye of Ender [The End Portal]'
  ];

  return (
    <div className="flex flex-col items-center gap-2 select-none pointer-events-auto">
      {/* 9-Slot Hotbar Frame (Integer scaled 2x) */}
      <div className="relative flex items-center mc-hotbar-frame p-[2px] gap-[2px]">
        {BIOMES.map((biome, idx) => {
          const isSelected = selectedSlot === idx;

          return (
            <button
              key={biome.id}
              onClick={() => handleSelect(idx)}
              onMouseEnter={() => setHoveredSlot(idx)}
              onMouseLeave={() => setHoveredSlot(null)}
              className={`relative mc-hotbar-slot flex items-center justify-center cursor-pointer transition-none ${
                isSelected ? 'z-20' : 'hover:brightness-110'
              }`}
              title={slotTooltips[idx]}
            >
              {/* Selected Slot Frame Border */}
              {isSelected && (
                <div className="absolute -inset-[3px] border-[3px] border-white outline outline-1 outline-black pointer-events-none z-30" />
              )}

              {/* Corner Slot Number */}
              <span className="absolute top-[2px] left-[3px] font-pixel text-[8px] text-[#FFFFFF] drop-shadow-[1px_1px_0_#373737] leading-none pointer-events-none z-10">
                {idx + 1}
              </span>

              {/* Slot Icon */}
              <div className="w-7 h-7 flex items-center justify-center pointer-events-none z-10">
                {idx === 0 && <ItemIcon name="diamond_pickaxe" alt="Pickaxe" className="w-6 h-6" />}
                {idx === 1 && (
                  avatarUrl ? (
                    <img src={avatarUrl} alt="Cykf" className="w-6 h-6 pixelated rounded-[1px]" />
                  ) : (
                    <ItemIcon name="cherry_sapling" alt="Cherry Sapling" className="w-6 h-6" />
                  )
                )}
                {idx === 2 && <ItemIcon name="enchanted_book" alt="Book" className="w-6 h-6" />}
                {idx === 3 && <ItemIcon name="chest" alt="Chest" className="w-6 h-6" />}
                {idx === 4 && <ItemIcon name="crafting_table" alt="Crafting" className="w-6 h-6" />}
                {idx === 5 && <ItemIcon name="nether_star" alt="Star" className="w-6 h-6" />}
                {idx === 6 && <ItemIcon name="emerald" alt="Emerald" className="w-6 h-6" />}
                {idx === 7 && <ItemIcon name="writable_book" alt="Quill" className="w-6 h-6" />}
                {idx === 8 && <ItemIcon name="ender_eye" alt="Eye" className="w-6 h-6" />}
              </div>

              {/* Tooltip on hover (Vanilla dark purple-blue border, offset text shadow) */}
              {hoveredSlot === idx && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap mc-tooltip pointer-events-none z-40">
                  {slotTooltips[idx]}
                </div>
              )}
            </button>
          );
        })}

        {/* Inventory button toggle at right */}
        <button
          onClick={() => {
            sounds.playChestOpen();
            toggleInventory();
          }}
          className="ml-1 w-7 h-11 bg-[#2b2b2b] border border-[#555] hover:bg-[#444] text-[10px] font-pixel text-gray-300 flex items-center justify-center p-0.5"
          title="Open Inventory [E]"
        >
          <ItemIcon name="chest" alt="Inventory" className="w-5 h-5" />
        </button>
      </div>

      {/* Pagination Dots (9 dots) */}
      <div className="flex items-center gap-2 mt-0.5">
        {BIOMES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            aria-label={`Go to scene ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-150 ${
              currentScene === i
                ? 'bg-white scale-125 ring-2 ring-black/80'
                : 'bg-white/40 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Key hint line */}
      <div className="font-pixel text-[8px] text-white/60 tracking-wider flex items-center gap-2">
        <span>[1-9] Tools</span>
        <span>·</span>
        <span>[E] Inventory</span>
        <span>·</span>
        <span>[R] Reset</span>
        <span>·</span>
        <span>[A/D] Biomes</span>
        <span>·</span>
        <span>[M] Mute</span>
      </div>
    </div>
  );
};
