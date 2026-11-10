import React from 'react';
import { getItemIcon, getItemFallbackIcon, normalizeMinecraftId } from '../utils/itemIcons';

/**
 * Universal Item & Block Icon Component
 * Loads crisp icons from /public/items/<id>.png with graceful fallback
 * Strictly applies pixelated image rendering and integer scaling
 */
export const ItemIcon: React.FC<{
  name: string;
  className?: string;
  alt?: string;
  size?: number;
}> = ({ name, className = 'w-6 h-6', alt = '', size }) => {
  const normId = normalizeMinecraftId(name);
  const primarySrc = getItemIcon(normId);
  const fallbackSrc = getItemFallbackIcon(normId);

  const style: React.CSSProperties = {
    imageRendering: 'pixelated',
    ...(size ? { width: `${size}px`, height: `${size}px` } : {}),
  };

  return (
    <img
      src={primarySrc}
      alt={alt || normId}
      className={`${className} pixelated select-none pointer-events-none object-contain`}
      style={style}
      loading="eager"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (!target.src.includes('/texturepack/')) {
          target.src = fallbackSrc;
        } else {
          target.src = `/texturepack/assets/minecraft/textures/block/${normId}.png`;
        }
      }}
    />
  );
};

export const GrassBlockIcon: React.FC<{ className?: string; size?: number }> = (props) => (
  <ItemIcon name="grass_block" alt="Grass Block" {...props} />
);

export const EnchantedBookIcon: React.FC<{ className?: string; size?: number }> = (props) => (
  <ItemIcon name="enchanted_book" alt="Enchanted Book" {...props} />
);

export const ChestIcon: React.FC<{ className?: string; size?: number }> = (props) => (
  <ItemIcon name="chest" alt="Chest" {...props} />
);

export const CompassIcon: React.FC<{ className?: string; size?: number }> = (props) => (
  <ItemIcon name="compass" alt="Compass" {...props} />
);

export const CraftingTableIcon: React.FC<{ className?: string; size?: number }> = (props) => (
  <ItemIcon name="crafting_table" alt="Crafting Table" {...props} />
);

export const NetherStarIcon: React.FC<{ className?: string; size?: number }> = (props) => (
  <ItemIcon name="nether_star" alt="Nether Star" {...props} />
);

export const EmeraldIcon: React.FC<{ className?: string; size?: number }> = (props) => (
  <ItemIcon name="emerald" alt="Emerald" {...props} />
);

export const BookAndQuillIcon: React.FC<{ className?: string; size?: number }> = (props) => (
  <ItemIcon name="writable_book" alt="Book & Quill" {...props} />
);

export const EnderPearlIcon: React.FC<{ className?: string; size?: number }> = (props) => (
  <ItemIcon name="ender_pearl" alt="Ender Pearl" {...props} />
);

export const EnderEyeIcon: React.FC<{ className?: string; size?: number }> = (props) => (
  <ItemIcon name="ender_eye" alt="Eye of Ender" {...props} />
);

export const BreadIcon: React.FC<{ className?: string; size?: number }> = (props) => (
  <ItemIcon name="bread" alt="Bread" {...props} />
);

export const DiamondPickaxeIcon: React.FC<{ className?: string; size?: number }> = (props) => (
  <ItemIcon name="diamond_pickaxe" alt="Diamond Pickaxe" {...props} />
);

/**
 * Pixelated Minecraft Hearts for Health Bar
 */
export const HeartIcon: React.FC<{ filled?: boolean; className?: string }> = ({
  filled = true,
  className = "w-4 h-4"
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
export const HungerIcon: React.FC<{ filled?: boolean; className?: string }> = ({
  filled = true,
  className = "w-4 h-4"
}) => (
  <svg viewBox="0 0 9 9" className={`${className} pixelated`} fill="none" xmlns="http://www.w3.org/2000/svg">
    {filled ? (
      <>
        <path d="M4 1h3v1h-3zM3 2h5v3h-5zM4 5h3v1h-3zM2 6h2v2h-2zM1 7h1v2h-1z" fill="#1A1108" />
        <path d="M4 2h3v1h-3zM3 3h4v1h-4zM4 4h3v1h-3z" fill="#A86538" />
        <rect x="5" y="2" width="1" height="1" fill="#DDB088" />
        <rect x="2" y="7" width="1" height="1" fill="#EAEAEA" />
      </>
    ) : (
      <path d="M4 1h3v1h-3zM3 2h5v3h-5zM4 5h3v1h-3zM2 6h2v2h-2zM1 7h1v2h-1z" fill="#332211" />
    )}
  </svg>
);
