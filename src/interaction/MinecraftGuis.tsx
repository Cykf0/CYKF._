import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { sounds } from '../audio/soundManager';
import { ItemIcon } from '../hud/PixelIcons';

// SGA Rune symbols for Enchanting Table
const SGA_RUNES = [
  'ᔑ', 'ʖ', 'ᓵ', '↸', 'ᒷ', '⎓', 'Merged', 'Strength', 'Unbreaking', 'Fortune', 'Looting', 'Infinity'
];

export const MinecraftGuis: React.FC = () => {
  const activeGui = useStore((s) => s.activeGui);
  const setActiveGui = useStore((s) => s.setActiveGui);
  const xpLevel = useStore((s) => s.xpLevel);
  const addXp = useStore((s) => s.addXp);
  const setToastMessage = useStore((s) => s.setToastMessage);

  // Enchanting State
  const [enchantItem, setEnchantItem] = useState<'diamond_sword' | 'diamond_pickaxe' | 'book'>('diamond_sword');
  const [lapisCount, setLapisCount] = useState(16);
  const [enchantedResult, setEnchantedResult] = useState<string | null>(null);

  // Crafting State
  const [craftingGrid, setCraftingGrid] = useState<Array<string | null>>(Array(9).fill(null));
  const [craftOutput, setCraftOutput] = useState<string | null>('diamond_pickaxe');

  // Anvil State
  const [anvilName, setAnvilName] = useState('Saksham\'s Blade');

  // Close on Escape or E
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key.toLowerCase() === 'e') && activeGui !== 'none') {
        sounds.playChestClose();
        setActiveGui('none');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGui, setActiveGui]);

  if (activeGui === 'none') return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[2px] font-pixel select-none p-4"
      onClick={() => {
        sounds.playChestClose();
        setActiveGui('none');
      }}
    >
      <div
        className="relative bg-[#C6C6C6] border-4 border-t-[#FFF] border-l-[#FFF] border-b-[#555] border-r-[#555] p-5 shadow-2xl max-w-md w-full text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button in Corner */}
        <button
          onClick={() => {
            sounds.playChestClose();
            setActiveGui('none');
          }}
          className="absolute top-2 right-2 w-6 h-6 bg-[#8B8B8B] hover:bg-[#A8A8A8] text-white flex items-center justify-center border-2 border-t-[#FFF] border-l-[#FFF] border-b-[#373737] border-r-[#373737]"
        >
          ✕
        </button>

        {/* ------------------------------------------------------------------- */}
        {/* A. ENCHANTING TABLE GUI                                             */}
        {/* ------------------------------------------------------------------- */}
        {activeGui === 'enchanting' && (
          <div>
            <h2 className="text-sm font-bold text-[#404040] mb-4">Enchanting Table</h2>

            <div className="flex gap-6 items-start mb-6">
              {/* Item Slot & Lapis Slot */}
              <div className="flex flex-col gap-3">
                <div className="text-[10px] text-[#555]">Tool / Weapon:</div>
                <div className="w-12 h-12 bg-[#8B8B8B] border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF] flex items-center justify-center shadow-inner">
                  <ItemIcon name={enchantItem} size={28} />
                </div>

                <div className="text-[10px] text-[#555]">Lapis Lazuli:</div>
                <div className="w-12 h-12 bg-[#8B8B8B] border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF] flex items-center justify-center relative shadow-inner">
                  <ItemIcon name="lapis_lazuli" size={26} />
                  <span className="absolute bottom-1 right-1 text-xs text-white font-bold drop-shadow-[0_1px_0_#000]">
                    {lapisCount}
                  </span>
                </div>
              </div>

              {/* 3 Tiered SGA Enchantment Options */}
              <div className="flex-1 flex flex-col gap-2">
                {[
                  { level: 1, cost: 1, name: 'Efficiency II', runes: 'ᔑ ʖ ᓵ ᒷ' },
                  { level: 2, cost: 2, name: 'Unbreaking III', runes: '↸ ⎓ ᒲ ᓭ' },
                  { level: 3, cost: 3, name: 'Fortune III / Sharpness V', runes: '⎓ ᔑ ᓵ ↸ ᒷ' },
                ].map((tier) => (
                  <button
                    key={tier.level}
                    onClick={() => {
                      if (xpLevel >= tier.level && lapisCount >= tier.cost) {
                        sounds.playEnchantChime();
                        addXp(-tier.level);
                        setLapisCount((l) => l - tier.cost);
                        setEnchantedResult(`${tier.name}!`);
                        setToastMessage({
                          title: 'Item Enchanted!',
                          desc: `Granted ${tier.name}`,
                          icon: 'enchanted_book',
                        });
                      } else {
                        sounds.playClick();
                      }
                    }}
                    className="w-full text-left p-2 bg-[#A8A8A8] hover:bg-[#C8C8C8] border-2 border-t-[#FFF] border-l-[#FFF] border-b-[#555] border-r-[#555] flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs text-[#2A2A2A] font-bold group-hover:text-black">
                        {tier.runes}
                      </div>
                      <div className="text-[10px] text-[#335522]">{tier.name}</div>
                    </div>
                    <div className="w-7 h-7 bg-[#2E3A1A] text-[#77FF55] text-xs font-bold flex items-center justify-center border border-black">
                      {tier.level}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {enchantedResult && (
              <div className="p-2 bg-[#55AA55]/20 border border-[#55AA55] text-[#227722] text-xs text-center mb-4 font-bold">
                ✨ Successfully Enchanted: {enchantedResult}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* B. CRAFTING TABLE GUI (3x3 Grid)                                    */}
        {/* ------------------------------------------------------------------- */}
        {activeGui === 'crafting' && (
          <div>
            <h2 className="text-sm font-bold text-[#404040] mb-4">Crafting Table (3x3)</h2>

            <div className="flex items-center justify-center gap-6 mb-6">
              {/* 3x3 Crafting Grid */}
              <div className="grid grid-cols-3 gap-1 bg-[#8B8B8B] p-2 border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF]">
                {craftingGrid.map((slot, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      sounds.playHotbarTick();
                      const next = [...craftingGrid];
                      next[i] = next[i] ? null : 'diamond';
                      setCraftingGrid(next);
                    }}
                    className="w-10 h-10 bg-[#8B8B8B] border border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF] flex items-center justify-center cursor-pointer hover:bg-[#9E9E9E]"
                  >
                    {slot && <ItemIcon name={slot} size={24} />}
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <div className="text-xl text-[#555]">➔</div>

              {/* Output Slot */}
              <div
                onClick={() => {
                  sounds.playCraft();
                  setToastMessage({
                    title: 'Item Crafted!',
                    desc: 'Added to your inventory',
                    icon: craftOutput || 'diamond_pickaxe',
                  });
                }}
                className="w-14 h-14 bg-[#8B8B8B] border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF] flex items-center justify-center cursor-pointer hover:bg-[#9E9E9E] shadow-inner"
              >
                {craftOutput && <ItemIcon name={craftOutput} size={32} />}
              </div>
            </div>

            {/* Quick Recipe Buttons */}
            <div className="text-[10px] text-[#555] mb-1.5">Quick Recipes:</div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Diamond Pickaxe', item: 'diamond_pickaxe' },
                { name: 'Diamond Sword', item: 'diamond_sword' },
                { name: 'Golden Apple', item: 'golden_apple' },
                { name: 'Bookshelf', item: 'bookshelf' },
              ].map((rec) => (
                <button
                  key={rec.item}
                  onClick={() => {
                    sounds.playClick();
                    setCraftOutput(rec.item);
                  }}
                  className="px-2.5 py-1 bg-[#A8A8A8] hover:bg-[#C8C8C8] text-[10px] border border-black"
                >
                  {rec.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* C. ANVIL GUI                                                        */}
        {/* ------------------------------------------------------------------- */}
        {activeGui === 'anvil' && (
          <div>
            <h2 className="text-sm font-bold text-[#404040] mb-4">Repair & Name (Anvil)</h2>

            {/* Name Input Field */}
            <div className="mb-4">
              <label className="text-[10px] text-[#555] block mb-1">Item Custom Name:</label>
              <input
                type="text"
                value={anvilName}
                onChange={(e) => setAnvilName(e.target.value)}
                className="w-full bg-[#4A4A4A] text-white px-3 py-1.5 text-xs font-pixel border-2 border-t-[#222] border-l-[#222] border-b-[#FFF] border-r-[#FFF] outline-none"
              />
            </div>

            {/* 2 Inputs + Output */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#8B8B8B] border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF] flex items-center justify-center">
                <ItemIcon name="diamond_sword" size={28} />
              </div>

              <span className="text-base text-[#555]">+</span>

              <div className="w-12 h-12 bg-[#8B8B8B] border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF] flex items-center justify-center">
                <ItemIcon name="enchanted_book" size={28} />
              </div>

              <span className="text-base text-[#555]">➔</span>

              <div
                onClick={() => {
                  sounds.playAnvilUse();
                  setToastMessage({
                    title: 'Item Repaired & Renamed!',
                    desc: `Named: "${anvilName}"`,
                    icon: 'diamond_sword',
                  });
                }}
                className="w-14 h-14 bg-[#8B8B8B] border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF] flex items-center justify-center cursor-pointer hover:bg-[#9E9E9E]"
              >
                <ItemIcon name="diamond_sword" size={32} />
              </div>
            </div>

            <div className="text-center text-xs text-[#2E7A1E] font-bold">
              Enchantment Cost: 2 Levels
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* D. CHEST CONTAINER GUI (27 Slots)                                  */}
        {/* ------------------------------------------------------------------- */}
        {activeGui === 'chest' && (
          <div>
            <h2 className="text-sm font-bold text-[#404040] mb-3">Large Chest</h2>

            {/* 27 Slots Grid */}
            <div className="grid grid-cols-9 gap-1 bg-[#8B8B8B] p-2 border-2 border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF] mb-4">
              {[
                'diamond', 'emerald', 'golden_apple', 'netherite_ingot', 'amethyst_shard', 'ender_pearl', 'iron_ingot', 'gold_ingot', 'book',
                'diamond_pickaxe', 'diamond_sword', 'bow', 'arrow', 'bread', 'torch', 'lantern', 'oak_log', 'cobblestone',
                'glow_berries', 'lapis_lazuli', 'redstone', 'coal', 'feather', 'clock', 'compass', 'sculk', 'cookie'
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => {
                    sounds.playItemPickup();
                    setToastMessage({
                      title: 'Loot Picked Up',
                      desc: `Moved ${item} to hotbar`,
                      icon: item,
                    });
                  }}
                  className="w-8 h-8 bg-[#8B8B8B] border border-t-[#373737] border-l-[#373737] border-b-[#FFF] border-r-[#FFF] flex items-center justify-center cursor-pointer hover:bg-[#A8A8A8]"
                >
                  <ItemIcon name={item} size={22} />
                </div>
              ))}
            </div>

            <div className="text-[10px] text-[#555]">
              Click any loot slot to move to your inventory
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* E. VILLAGER TRADES GUI                                              */}
        {/* ------------------------------------------------------------------- */}
        {activeGui === 'villager' && (
          <div>
            <h2 className="text-sm font-bold text-[#404040] mb-3">Villager Trades (Master Farmer)</h2>

            <div className="flex flex-col gap-2 mb-4">
              {[
                { give: 'emerald', giveCount: 1, get: 'bread', getCount: 6, label: '1 Emerald ➔ 6 Fresh Bread' },
                { give: 'emerald', giveCount: 8, get: 'diamond', getCount: 1, label: '8 Emeralds ➔ 1 Diamond' },
                { give: 'emerald', giveCount: 16, get: 'enchanted_book', getCount: 1, label: '16 Emeralds ➔ Enchanted Book' },
              ].map((trade, i) => (
                <button
                  key={i}
                  onClick={() => {
                    sounds.playVillagerTrade();
                    addXp(3);
                    setToastMessage({
                      title: 'Trade Completed!',
                      desc: trade.label,
                      icon: trade.get,
                    });
                  }}
                  className="p-2.5 bg-[#A8A8A8] hover:bg-[#C8C8C8] border-2 border-t-[#FFF] border-l-[#FFF] border-b-[#555] border-r-[#555] flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <ItemIcon name={trade.give} size={20} />
                      <span className="text-xs font-bold">x{trade.giveCount}</span>
                    </div>
                    <span className="text-sm">➔</span>
                    <div className="flex items-center gap-1">
                      <ItemIcon name={trade.get} size={20} />
                      <span className="text-xs font-bold text-[#2A7A1E]">x{trade.getCount}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-700">Trade [Click]</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
