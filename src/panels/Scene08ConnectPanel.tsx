import React, { useState } from 'react';
import { content } from '../content';
import { useStore } from '../store';
import { sounds } from '../audio/soundManager';

export const Scene08ConnectPanel: React.FC = () => {
  const setScene = useStore((s) => s.setScene);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    sounds.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="absolute top-[14%] left-[6%] z-30 w-[380px] sm:w-[440px] mc-parchment p-6 select-none pointer-events-auto shadow-2xl">
      {/* Title */}
      <h2 className="font-pixel text-base text-[#2C1E14] tracking-wider">
        Let's Connect
      </h2>
      <p className="mt-1 font-body text-xs text-[#5C4533] italic">
        Send word and I will answer within a day.
      </p>

      {/* Rows */}
      <div className="mt-5 space-y-4 font-body border-t border-b border-[#A68F74] py-4">
        {/* Email */}
        <div
          onClick={handleCopyEmail}
          className="group cursor-pointer flex items-start gap-3"
        >
          <div className="w-6 h-6 mt-0.5 flex items-center justify-center font-pixel text-xs text-[#5C4533]">
            ✉
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-pixel text-[9px] text-[#785E46] uppercase tracking-wider">
              EMAIL
            </div>
            <div className="font-pixel text-[11px] text-[#2C1E14] group-hover:text-blue-900 group-hover:underline truncate mt-0.5">
              {content.email}
            </div>
          </div>
          <span className="font-pixel text-[9px] text-[#785E46] group-hover:text-black">
            {copiedEmail ? 'Copied! ✔' : 'Copy 📋'}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 mt-0.5 flex items-center justify-center font-pixel text-xs text-[#5C4533]">
            📍
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-pixel text-[9px] text-[#785E46] uppercase tracking-wider">
              LOCATION
            </div>
            <div className="font-pixel text-[11px] text-[#2C1E14] mt-0.5">
              {content.location}
            </div>
          </div>
        </div>

        {/* LinkedIn */}
        <a
          href={content.linkedin.startsWith('http') ? content.linkedin : `https://linkedin.com/${content.linkedin}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sounds.playClick()}
          className="group flex items-start gap-3 text-left"
        >
          <div className="w-6 h-6 mt-0.5 flex items-center justify-center font-pixel text-xs text-[#5C4533]">
            💼
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-pixel text-[9px] text-[#785E46] uppercase tracking-wider">
              LINKEDIN
            </div>
            <div className="font-pixel text-[11px] text-[#2C1E14] group-hover:text-blue-900 group-hover:underline truncate mt-0.5">
              {content.linkedin}
            </div>
          </div>
        </a>

        {/* Instagram */}
        <a
          href={content.instagram.startsWith('http') ? content.instagram : `https://instagram.com/${content.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sounds.playClick()}
          className="group flex items-start gap-3 text-left"
        >
          <div className="w-6 h-6 mt-0.5 flex items-center justify-center font-pixel text-xs text-[#5C4533]">
            📷
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-pixel text-[9px] text-[#785E46] uppercase tracking-wider">
              INSTAGRAM
            </div>
            <div className="font-pixel text-[11px] text-[#2C1E14] group-hover:text-blue-900 group-hover:underline truncate mt-0.5">
              {content.instagram}
            </div>
          </div>
        </a>
      </div>

      {/* Footer Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playClick();
            setScene(8); // The End
          }}
          className="px-4 py-2 mc-button font-pixel text-xs tracking-wider"
        >
          To The End →
        </button>
        <span className="font-pixel text-[9px] text-[#785E46]">
          Page 1 of 1
        </span>
      </div>
    </div>
  );
};
