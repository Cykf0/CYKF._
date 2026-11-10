import React from 'react';
import { ProjectItem } from '../content';
import { sounds } from '../audio/soundManager';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg mc-panel p-6 border-2 border-white/20 shadow-2xl">
        {/* Header with Rarity */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: project.rarityColor }}
            />
            <span className="font-pixel text-xs uppercase tracking-wider text-white">
              {project.rarity} BUILD
            </span>
          </div>

          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="w-7 h-7 mc-button font-pixel text-xs flex items-center justify-center text-gray-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Title & Body */}
        <div className="mt-4">
          <h2 className="font-pixel text-sm text-[#FFDD55] leading-relaxed">
            {project.title}
          </h2>
          <p className="mt-3 text-sm text-gray-300 leading-relaxed font-body">
            {project.description}
          </p>
        </div>

        {/* Tech Badges */}
        <div className="mt-5">
          <div className="font-pixel text-[10px] text-gray-400 mb-2">INGREDIENTS / TECH:</div>
          <div className="flex flex-wrap gap-2">
            {project.tech.map((t, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-black/40 border border-white/15 text-xs text-mc-village font-pixel tracking-wider"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.playClick()}
            className="px-4 py-2 mc-button font-pixel text-xs tracking-wider"
          >
            Open Project ↗
          </a>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="px-4 py-2 mc-button font-pixel text-xs tracking-wider bg-[#555]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
