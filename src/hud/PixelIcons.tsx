import React from 'react';

/**
 * Authentic Minecraft Item & Block Icons from /items/
 */

export const ItemIcon: React.FC<{
  name: string;
  className?: string;
  alt?: string;
}> = ({ name, className = 'w-6 h-6', alt = '' }) => {
  return (
    <img
      src={`/items/${name}.png`}
      alt={alt || name}
      className={`${className} pixelated select-none pointer-events-none object-contain`}
      loading="eager"
      onError={(e) => {
        // Fallback if image name is missing
        (e.target as HTMLElement).style.display = 'none';
      }}
    />
  );
};

export const GrassBlockIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <ItemIcon name="grass_block" className={className} alt="Grass Block" />
);

export const EnchantedBookIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <ItemIcon name="enchanted_book" className={className} alt="Enchanted Book" />
);

export const ChestIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <ItemIcon name="chest" className={className} alt="Chest" />
);

export const CompassIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <ItemIcon name="compass" className={className} alt="Compass" />
);

export const CraftingTableIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <ItemIcon name="crafting_table" className={className} alt="Crafting Table" />
);

export const NetherStarIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <ItemIcon name="nether_star" className={className} alt="Nether Star" />
);

export const EmeraldIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <ItemIcon name="emerald" className={className} alt="Emerald" />
);

export const BookAndQuillIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <ItemIcon name="writable_book" className={className} alt="Book & Quill" />
);

export const EnderPearlIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <ItemIcon name="ender_pearl" className={className} alt="Ender Pearl" />
);

export const EnderEyeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <ItemIcon name="ender_eye" className={className} alt="Eye of Ender" />
);

export const BreadIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <ItemIcon name="bread" className={className} alt="Bread" />
);

export const DiamondPickaxeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <ItemIcon name="diamond_pickaxe" className={className} alt="Diamond Pickaxe" />
);

/**
 * Pixelated Minecraft Hearts for Health Bar
 */
export const HeartIcon: React.FC<{ filled?: boolean; className?: string }> = ({
  filled = true,
  className = "w-3 h-3"
}) => (
  <svg viewBox="0 0 9 9" className={`${className} pixelated`} fill="none" xmlns="http://www.w3.org/2000/svg">
    {filled ? (
      <>
        <path d="M1 1h2v1h-2zM6 1h2v1h-2zM0 2h9v3h-9zM1 5h7v1h-7zM2 6h5v1h-5zM3 7h3v1h-3zM4 8h1v1h-1z" fill="#050505" />
        <path d="M1 2h2v1h-2zM6 2h2v1h-2zM1 3h7v2h-7zM2 5h5v1h-5zM3 6h3v1h-3zM4 7h1v1h-1z" fill="#E52521" />
        <rect x="2" y="2" width="1" height="1" fill="#FFFFFF" />
      </>
    ) : (
      <path d="M1 1h2v1h-2zM6 1h2v1h-2zM0 2h9v3h-9zM1 5h7v1h-7zM2 6h5v1h-5zM3 7h3v1h-3zM4 8h1v1h-1z" fill="#222222" />
    )}
  </svg>
);

/**
 * Pixelated Minecraft Hunger Drumstick
 */
export const HungerIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
  <svg viewBox="0 0 9 9" className={`${className} pixelated`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 1h3v1h-3zM3 2h5v3h-5zM4 5h3v1h-3zM2 6h2v2h-2zM1 7h1v2h-1z" fill="#1A1108" />
    <path d="M4 2h3v1h-3zM3 3h4v1h-4zM4 4h3v1h-3z" fill="#A86538" />
    <rect x="5" y="2" width="1" height="1" fill="#DDB088" />
    <rect x="2" y="7" width="1" height="1" fill="#EAEAEA" />
  </svg>
);
