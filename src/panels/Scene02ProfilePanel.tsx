import React, { useEffect, useState } from 'react';
import { content } from '../content';
import { loadAndProcessSkin } from '../player/SkinTexture';
import { sounds } from '../audio/soundManager';

export const Scene02ProfilePanel: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    loadAndProcessSkin(content.skinPath, content.skinModel)
      .then((data) => setAvatarUrl(data.avatarUrl))
      .catch(() => {});
  }, []);

  return (
    <div className="absolute top-[16%] left-[6%] z-30 w-[360px] sm:w-[420px] mc-panel p-5 select-none pointer-events-auto">
      {/* Panel Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/10">
        <div className="w-12 h-12 bg-black/60 border-2 border-white/20 p-1 flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={content.mcUsername} className="w-full h-full pixelated rounded-[1px]" />
          ) : (
            <div className="w-full h-full bg-[#333]" />
          )}
        </div>
        <div>
          <h2 className="font-pixel text-sm text-white tracking-wider">
            Player Profile
          </h2>
          <div className="font-pixel text-[10px] text-mc-cherry mt-0.5">
            {content.owner} · {content.mcUsername}
          </div>
        </div>
      </div>

      {/* Bio Paragraph */}
      <p className="mt-4 text-xs text-gray-300 font-body leading-relaxed">
        {content.bio}
      </p>

      {/* Metadata Rows */}
      <div className="mt-4 space-y-2 border-t border-b border-white/10 py-3 font-body text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 uppercase tracking-wider text-[11px]">Role:</span>
          <span className="text-white font-medium">{content.role}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 uppercase tracking-wider text-[11px]">Level:</span>
          <span className="text-white font-medium">{content.level}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 uppercase tracking-wider text-[11px]">Server:</span>
          <span className="text-white font-medium">{content.server}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 uppercase tracking-wider text-[11px]">Status:</span>
          <span className="text-mc-village font-medium">{content.status}</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-gray-400 uppercase tracking-wider text-[11px]">Player:</span>
          <span className="text-[#FFDD55] font-pixel text-[10px]">{content.mcUsername}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 uppercase tracking-wider text-[11px]">Owner:</span>
          <span className="text-[#FFAACC] font-pixel text-[10px]">{content.owner}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 flex items-center justify-between">
        <a
          href="/skins/cykf.png"
          download="cykf_skin.png"
          onClick={() => sounds.playClick()}
          className="px-3 py-1.5 mc-button font-pixel text-[10px] tracking-wider text-gray-200 hover:text-white"
        >
          Download Skin
        </a>
        <span className="text-[10px] text-gray-400 font-pixel">
          64x64 HD Skin
        </span>
      </div>
    </div>
  );
};
