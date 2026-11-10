import React, { useEffect, useState } from 'react';
import { content } from '../content';
import { loadAndProcessSkin, getDefaultSkinData } from '../player/SkinTexture';
import { sounds } from '../audio/soundManager';

export const Scene02ProfilePanel: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState<string>(() => getDefaultSkinData().avatarUrl);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    loadAndProcessSkin(content.skinPath, content.skinModel)
      .then((data) => setAvatarUrl(data.avatarUrl))
      .catch(() => {});
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          sounds.playClick();
          setIsOpen(true);
        }}
        className="absolute top-[14%] left-[4%] z-30 mc-button px-3 py-1.5 font-pixel text-xs text-white/90 hover:text-white flex items-center gap-2 pointer-events-auto shadow-lg"
        title="Open Player Profile"
      >
        <span>👤 Player Profile</span>
        <span className="text-[10px] text-[#FFAA00]">▶</span>
      </button>
    );
  }

  return (
    <div className="absolute top-[14%] left-[4%] sm:left-[5%] z-30 w-[310px] sm:w-[350px] mc-panel p-4 sm:p-5 bg-black/15 backdrop-blur-sm select-none pointer-events-auto">
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black/20 border-2 border-white/20 p-0.5 flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={content.mcUsername} className="w-full h-full pixelated rounded-[1px]" />
            ) : (
              <div className="w-full h-full bg-[#333]" />
            )}
          </div>
          <div>
            <h2 className="font-pixel text-xs sm:text-sm text-white tracking-wider">
              Player Profile
            </h2>
            <div className="font-pixel text-[9px] sm:text-[10px] text-mc-cherry mt-0.5">
              {content.owner} · {content.mcUsername}
            </div>
          </div>
        </div>

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

      {/* Bio Paragraph */}
      <p className="mt-3 text-[11px] sm:text-xs text-gray-200/90 font-body leading-relaxed">
        {content.bio}
      </p>

      {/* Metadata Rows */}
      <div className="mt-3 space-y-1.5 border-t border-b border-white/10 py-2.5 font-body text-[11px] sm:text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 uppercase tracking-wider text-[10px]">Role:</span>
          <span className="text-white font-medium">{content.role}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300 uppercase tracking-wider text-[10px]">Level:</span>
          <span className="text-white font-medium">{content.level}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300 uppercase tracking-wider text-[10px]">Server:</span>
          <span className="text-white font-medium">{content.server}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300 uppercase tracking-wider text-[10px]">Status:</span>
          <span className="text-emerald-400 font-medium">{content.status}</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-gray-300 uppercase tracking-wider text-[10px]">Player:</span>
          <span className="text-[#FFDD55] font-pixel text-[10px]">{content.mcUsername}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300 uppercase tracking-wider text-[10px]">Owner:</span>
          <span className="text-[#FFAACC] font-pixel text-[10px]">{content.owner}</span>
        </div>
      </div>
    </div>
  );
};
