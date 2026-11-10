import React, { useEffect } from 'react';
import { useStore } from '../store';
import { sounds } from '../audio/soundManager';
import { content } from '../content';
import { ItemIcon } from '../hud/PixelIcons';

// 27 authentic survival items for the 9x3 inventory grid
const INVENTORY_ITEMS = [
  'diamond_sword', 'diamond_pickaxe', 'diamond_axe', 'diamond_shovel', 'bow', 'arrow', 'golden_apple', 'bread', 'cooked_beef',
  'iron_ingot', 'gold_ingot', 'diamond', 'emerald', 'netherite_ingot', 'redstone', 'lapis_lazuli', 'coal', 'ender_pearl',
  'oak_log', 'cobblestone', 'stone_bricks', 'oak_planks', 'torch', 'lantern', 'water_bucket', 'crafting_table', 'chest'
];

export const InventoryModal: React.FC = () => {
  const isOpen = useStore((s) => s.inventoryOpen);
  const toggleInventory = useStore((s) => s.toggleInventory);
  const setInventoryOpen = useStore((s) => s.setInventoryOpen);
  const selectedSlot = useStore((s) => s.selectedHotbarSlot);
  const setSelectedSlot = useStore((s) => s.setSelectedHotbarSlot);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' || (e.key === 'Escape' && isOpen)) {
        if (isOpen) sounds.playInventoryClose();
        else sounds.playInventoryOpen();
        toggleInventory();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, toggleInventory]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Inventory"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-[2px] font-pixel select-none"
      onClick={() => {
        sounds.playInventoryClose();
        setInventoryOpen(false);
      }}
    >
      <div
        className="relative bg-[#C6C6C6] border-4 border-t-[#FFFFFF] border-l-[#FFFFFF] border-b-[#555555] border-r-[#555555] p-5 shadow-2xl text-[#3F3F3F] w-[360px] sm:w-[420px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#555555] pb-2 mb-3">
          <div className="text-sm font-bold tracking-wide">Crafting & Inventory</div>
          <button
            onClick={() => {
              sounds.playInventoryClose();
              setInventoryOpen(false);
            }}
            className="text-xs text-[#222] hover:text-red-700 px-2 py-0.5 border border-[#555] bg-[#DDD]"
          >
            ✕ [E]
          </button>
        </div>

        {/* Top Section: Player Tag & 2x2 Crafting Grid */}
        <div className="flex items-center justify-between mb-4 bg-[#B5B5B5] p-3 border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF]">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-black">{content.mcUsername}</span>
            <span className="text-[10px] text-gray-700">{content.role}</span>
          </div>
          {/* Crafting 2x2 */}
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-1">
              {['oak_log', 'iron_ingot', 'redstone', 'diamond'].map((item, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 bg-[#8B8B8B] border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF] flex items-center justify-center hover:bg-[#A5A5A5] cursor-pointer"
                  onClick={() => sounds.playItemPop()}
                >
                  <ItemIcon name={item} alt={item} className="w-6 h-6" />
                </div>
              ))}
            </div>
            <div className="text-sm font-bold">➔</div>
            <div
              className="w-9 h-9 bg-[#8B8B8B] border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF] flex items-center justify-center hover:bg-[#A5A5A5] cursor-pointer"
              onClick={() => {
                sounds.playItemPop();
                useStore.getState().addXp(5);
              }}
              title="Craft Diamond Pickaxe"
            >
              <ItemIcon name="diamond_pickaxe" alt="result" className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* 9x3 Main Inventory Grid */}
        <div className="mb-3">
          <div className="text-[11px] font-bold mb-1">Inventory</div>
          <div className="grid grid-cols-9 gap-1 bg-[#8B8B8B] p-1.5 border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF]">
            {INVENTORY_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="w-8 h-8 bg-[#8B8B8B] border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF] flex items-center justify-center hover:bg-[#A5A5A5] cursor-pointer transition-colors"
                onClick={() => {
                  sounds.playHotbarTick();
                  useStore.getState().setHoverTarget(`Item: ${item.replace('_', ' ')}`);
                }}
                title={item.replace('_', ' ')}
              >
                <ItemIcon name={item} alt={item} className="w-6 h-6" />
              </div>
            ))}
          </div>
        </div>

        {/* Hotbar Slots */}
        <div>
          <div className="text-[11px] font-bold mb-1">Hotbar</div>
          <div className="grid grid-cols-9 gap-1 bg-[#8B8B8B] p-1.5 border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF]">
            {[
              'diamond_pickaxe', 'cherry_sapling', 'enchanted_book', 'chest', 'crafting_table', 'echo_shard', 'emerald', 'axolotl_bucket', 'ender_eye'
            ].map((item, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 bg-[#8B8B8B] border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF] flex items-center justify-center cursor-pointer transition-all ${
                  selectedSlot === idx ? 'ring-2 ring-white bg-[#A5A5A5]' : 'hover:bg-[#A5A5A5]'
                }`}
                onClick={() => {
                  sounds.playHotbarTick();
                  setSelectedSlot(idx);
                }}
                title={`Hotbar ${idx + 1}: ${item}`}
              >
                <ItemIcon name={item} alt={item} className="w-6 h-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
