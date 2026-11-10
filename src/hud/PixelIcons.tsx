import React from 'react';

/**
 * Pixel-art SVG Icons for Minecraft HUD & Hotbar
 */

export const GrassBlockIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 16 16" className={`${className} pixelated`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="16" fill="#866043" />
    <rect width="16" height="6" fill="#5b8e34" />
    <rect x="2" y="6" width="2" height="2" fill="#5b8e34" />
    <rect x="6" y="6" width="2" height="3" fill="#5b8e34" />
    <rect x="11" y="6" width="3" height="2" fill="#5b8e34" />
    <rect width="16" height="2" fill="#71ad41" />
  </svg>
);

export const EnchantedBookIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 16 16" className={`${className} pixelated`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="1" width="12" height="14" rx="1" fill="#881B1B" />
    <rect x="1" y="2" width="2" height="12" fill="#600B0B" />
    <rect x="4" y="3" width="9" height="10" fill="#F4E8C1" />
    <rect x="7" y="1" width="2" height="14" fill="#A855F7" />
    <rect x="5" y="7" width="6" height="2" fill="#C084FC" />
  </svg>
);

export const ChestIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 16 16" className={`${className} pixelated`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="2" width="14" height="12" fill="#A06935" />
    <rect x="2" y="3" width="12" height="10" fill="#8B5A2B" />
    <rect x="1" y="6" width="14" height="1" fill="#4A2E12" />
    <rect x="7" y="5" width="2" height="3" fill="#EAEAEA" />
  </svg>
);

export const CompassIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 16 16" className={`${className} pixelated`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="7" fill="#C0C0C0" />
    <circle cx="8" cy="8" r="5" fill="#404040" />
    <polygon points="8,4 10,8 8,7 6,8" fill="#FF3333" />
    <polygon points="8,12 10,8 8,9 6,8" fill="#CCCCCC" />
  </svg>
);

export const NetherStarIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 16 16" className={`${className} pixelated`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="1" width="2" height="14" fill="#FFFFFF" />
    <rect x="1" y="7" width="14" height="2" fill="#FFFFFF" />
    <rect x="4" y="4" width="8" height="8" fill="#E0F7FA" />
    <rect x="6" y="6" width="4" height="4" fill="#80DEEA" />
  </svg>
);

export const EmeraldIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 16 16" className={`${className} pixelated`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="8,1 14,5 14,11 8,15 2,11 2,5" fill="#00E676" />
    <polygon points="8,3 12,6 12,10 8,13 4,10 4,6" fill="#00C853" />
    <rect x="7" y="5" width="2" height="6" fill="#B9F6CA" />
  </svg>
);

export const BookAndQuillIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 16 16" className={`${className} pixelated`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="10" height="11" fill="#5D4037" />
    <rect x="4" y="5" width="6" height="7" fill="#EFEBE9" />
    <path d="M14 1 L11 7 L12 8 L15 2 Z" fill="#ECEFF1" />
    <rect x="10" y="7" width="2" height="2" fill="#37474F" />
  </svg>
);

export const EnderPearlIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 16 16" className={`${className} pixelated`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6" fill="#004D40" />
    <circle cx="8" cy="8" r="4.5" fill="#00796B" />
    <circle cx="7" cy="7" r="2.5" fill="#4DB6AC" />
    <circle cx="6" cy="6" r="1" fill="#E0F2F1" />
  </svg>
);

export const HeartIcon: React.FC<{ filled?: boolean; className?: string }> = ({
  filled = true,
  className = "w-3 h-3"
}) => (
  <svg viewBox="0 0 9 9" className={`${className} pixelated`} fill="none" xmlns="http://www.w3.org/2000/svg">
    {filled ? (
      <>
        <path d="M1 1h2v1h-2zM6 1h2v1h-2zM0 2h9v3h-9zM1 5h7v1h-7zM2 6h5v1h-5zM3 7h3v1h-3zM4 8h1v1h-1z" fill="#111111" />
        <path d="M1 2h2v1h-2zM6 2h2v1h-2zM1 3h7v2h-7zM2 5h5v1h-5zM3 6h3v1h-3zM4 7h1v1h-1z" fill="#E53935" />
        <rect x="2" y="2" width="1" height="1" fill="#FFFFFF" />
      </>
    ) : (
      <path d="M1 1h2v1h-2zM6 1h2v1h-2zM0 2h9v3h-9zM1 5h7v1h-7zM2 6h5v1h-5zM3 7h3v1h-3zM4 8h1v1h-1z" fill="#333333" />
    )}
  </svg>
);

export const HungerIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
  <svg viewBox="0 0 9 9" className={`${className} pixelated`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 1h3v1h-3zM2 2h5v3h-5zM3 5h3v1h-3zM2 6h2v2h-2z" fill="#6D4C41" />
    <path d="M3 2h3v3h-3z" fill="#D7CCC8" />
    <rect x="5" y="2" width="1" height="2" fill="#8D6E63" />
  </svg>
);
