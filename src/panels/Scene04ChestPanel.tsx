import React, { useState } from 'react';
import { content, ProjectItem } from '../content';
import { ProjectModal } from '../hud/ProjectModal';
import { useStore } from '../store';
import { sounds } from '../audio/soundManager';
import { ItemIcon } from '../hud/PixelIcons';

export const Scene04ChestPanel: React.FC = () => {
  const setScene = useStore((s) => s.setScene);
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [hoveredProject, setHoveredProject] = useState<ProjectItem | null>(null);

  const itemNames = [
    'nether_star',
    'potion',
    'spyglass',
    'compass',
    'enchanted_book',
    'diamond'
  ];

  return (
    <>
      <div className="absolute top-[16%] left-[6%] z-30 w-[380px] sm:w-[440px] mc-panel p-5 select-none pointer-events-auto">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h2 className="font-pixel text-sm text-white tracking-wider">
            Chest - Completed Builds
          </h2>
          <span className="font-pixel text-[9px] text-[#FFAA00]">
            6 / 12 Slots
          </span>
        </div>

        {/* 12-Slot Chest Grid (2 rows of 6) */}
        <div className="mt-4 grid grid-cols-6 gap-2 bg-black/40 p-3 border border-white/10">
          {Array.from({ length: 12 }).map((_, idx) => {
            const project = content.projects[idx];

            return (
              <div
                key={idx}
                onClick={() => {
                  if (project) {
                    sounds.playChestOpen();
                    setActiveProject(project);
                  }
                }}
                onMouseEnter={() => {
                  if (project) {
                    sounds.playHotbarTick();
                    setHoveredProject(project);
                  }
                }}
                onMouseLeave={() => setHoveredProject(null)}
                className={`relative w-12 h-12 flex items-center justify-center border-2 transition-all ${
                  project
                    ? 'bg-[#333333] border-t-[#555] border-l-[#555] border-b-[#111] border-r-[#111] hover:bg-[#444] cursor-pointer'
                    : 'bg-[#222222] border-t-[#111] border-l-[#111] border-b-[#333] border-r-[#333]'
                }`}
              >
                {project && (
                  <>
                    {/* Project Icon */}
                    <div className="pointer-events-none">
                      <ItemIcon name={project.iconName || itemNames[idx % itemNames.length]} className="w-6 h-6" alt={project.title} />
                    </div>
                    {/* Rarity Corner Pip */}
                    <div
                      className="absolute bottom-1 right-1 w-2 h-2 rounded-[1px] shadow-sm pointer-events-none"
                      style={{ backgroundColor: project.rarityColor }}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Tooltip Card / Helper */}
        <div className="mt-3 p-2 bg-black/50 border border-white/5 min-h-[46px] flex flex-col justify-center">
          {hoveredProject ? (
            <div>
              <div className="font-pixel text-[11px] text-[#FFDD55] truncate">
                {hoveredProject.title}
              </div>
              <div className="text-[10px] text-gray-400 font-pixel mt-0.5">
                Tech: {hoveredProject.tech.join(', ')} · Click to inspect
              </div>
            </div>
          ) : (
            <div className="font-pixel text-[10px] text-gray-400 text-center italic">
              Hover an item for details · Click to open
            </div>
          )}
        </div>

        {/* Navigation Button */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => {
              sounds.playClick();
              setScene(6); // Villager Trades
            }}
            className="px-4 py-2 mc-button font-pixel text-xs tracking-wider"
          >
            See Trades →
          </button>
          <span className="font-pixel text-[9px] text-gray-400">
            Mineshaft Stash
          </span>
        </div>
      </div>

      {/* Project Detail Modal */}
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </>
  );
};
