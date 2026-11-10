import React, { useState, useEffect } from 'react';
import { useStore, BIOMES } from '../store';
import { sounds, MINECRAFT_TRACKS, AudioSettingsState } from '../audio/soundManager';

export const SettingsModal: React.FC = () => {
  const isOptionsModalOpen = useStore((s) => s.isOptionsModalOpen);
  const setOptionsModalOpen = useStore((s) => s.setOptionsModalOpen);
  const quality = useStore((s) => s.quality);
  const setQuality = useStore((s) => s.setQuality);
  const currentScene = useStore((s) => s.currentScene);
  const biome = BIOMES[currentScene] || BIOMES[0];

  const [audioState, setAudioState] = useState<AudioSettingsState>(sounds.getState());

  useEffect(() => {
    const unsub = sounds.subscribe((next) => {
      setAudioState(next);
    });
    return unsub;
  }, []);

  // Keyboard shortcut: Escape or 'O' to toggle settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape' && isOptionsModalOpen) {
        sounds.playClick();
        setOptionsModalOpen(false);
      } else if ((e.key === 'o' || e.key === 'O') && !e.ctrlKey && !e.metaKey) {
        sounds.playClick();
        setOptionsModalOpen(!isOptionsModalOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOptionsModalOpen, setOptionsModalOpen]);

  if (!isOptionsModalOpen) return null;

  const currentTrack = MINECRAFT_TRACKS[audioState.currentTrackIndex] || MINECRAFT_TRACKS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-pixel select-none pointer-events-auto animate-fade-in"
      onClick={() => {
        sounds.playClick();
        setOptionsModalOpen(false);
      }}
    >
      <div
        className="w-full max-w-lg bg-[#27252b] border-2 border-t-[#666] border-l-[#666] border-b-[#111] border-r-[#111] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] max-h-[92vh] overflow-y-auto mc-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3e3c45] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-base sm:text-lg text-white font-bold drop-shadow-[0_2px_0_#000] tracking-wide">
              Settings & Audio Controls
            </h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setOptionsModalOpen(false);
            }}
            className="w-7 h-7 mc-button text-xs text-gray-300 hover:text-white flex items-center justify-center"
            title="Close [Esc]"
          >
            ✕
          </button>
        </div>

        {/* =========================================================================
            SECTION 1: MINECRAFT MUSIC PLAYER (HERO PANEL)
        ========================================================================= */}
        <section className="bg-[#1c1a21] border border-[#3e3a49] p-3.5 mb-4 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">🎵</span>
              <span className="text-xs text-mc-village font-bold uppercase tracking-wider">
                Minecraft Music Player
              </span>
            </div>

            {/* Mode Indicator Badge */}
            <span
              className={`text-[9px] px-2 py-0.5 border ${
                audioState.musicMode === 'random'
                  ? 'border-mc-village text-mc-village bg-emerald-950/40'
                  : 'border-yellow-400 text-yellow-300 bg-amber-950/40'
              }`}
            >
              {audioState.musicMode === 'random' ? '🎲 Random Shuffle' : '🎵 Manual Selection'}
            </span>
          </div>

          {/* Current Playing Track Box with Animated Sound Equalizer */}
          <div className="bg-[#121116] border border-black p-2.5 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {/* Equalizer Bars */}
              <div className="flex items-end gap-0.5 h-4 w-4 shrink-0">
                <span
                  className={`w-1 bg-mc-village rounded-xs transition-all ${
                    audioState.isMusicPlaying ? 'animate-pulse h-4' : 'h-1.5 opacity-50'
                  }`}
                />
                <span
                  className={`w-1 bg-[#55FF55] rounded-xs transition-all ${
                    audioState.isMusicPlaying ? 'animate-pulse h-2.5' : 'h-2 opacity-50'
                  }`}
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className={`w-1 bg-[#88FFAA] rounded-xs transition-all ${
                    audioState.isMusicPlaying ? 'animate-pulse h-3.5' : 'h-1 opacity-50'
                  }`}
                  style={{ animationDelay: '300ms' }}
                />
              </div>

              <div className="truncate">
                <div className="text-[11px] text-white font-bold truncate drop-shadow-[0_1px_0_#000]">
                  {currentTrack.title}
                </div>
                <div className="text-[9px] text-[#9a94a6] truncate">
                  {currentTrack.artist} • C418 Soundtrack
                </div>
              </div>
            </div>

            {/* Play/Pause Quick Pill */}
            <button
              onClick={() => {
                sounds.playClick();
                sounds.toggleMusic();
              }}
              className="px-2.5 py-1 mc-button text-[10px] text-white shrink-0 ml-2 uppercase"
              title={audioState.isMusicPlaying ? 'Pause Music' : 'Play Music'}
            >
              {audioState.isMusicPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>

          {/* Track Selection Dropdown */}
          <div className="mb-3">
            <label className="text-[10px] text-gray-300 block mb-1">
              Select Soundtrack Track:
            </label>
            <select
              value={audioState.musicMode === 'random' ? 'random' : String(audioState.currentTrackIndex)}
              onChange={(e) => {
                sounds.playClick();
                const val = e.target.value;
                if (val === 'random') {
                  sounds.selectTrack('random');
                } else {
                  sounds.selectTrack(parseInt(val, 10));
                }
              }}
              className="w-full bg-[#131117] border border-[#444] text-xs text-white p-2 font-pixel focus:outline-none focus:border-mc-village cursor-pointer"
            >
              <option value="random">🎲 Random (Shuffle All 6 Tracks)</option>
              <option disabled>──────────────</option>
              {MINECRAFT_TRACKS.map((t, idx) => (
                <option key={t.id} value={idx}>
                  {idx + 1}. {t.title} — {t.artist} {idx === audioState.currentTrackIndex ? '▶' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Playback Controls (Prev, Play/Pause, Next, Shuffle) */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <button
              onClick={() => {
                sounds.playClick();
                sounds.prevTrack();
              }}
              className="py-1.5 mc-button text-[10px] text-white uppercase flex items-center justify-center gap-1"
              title="Previous Track"
            >
              ⏮ Prev
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                sounds.toggleMusic();
              }}
              className={`py-1.5 mc-button text-[10px] uppercase flex items-center justify-center gap-1 ${
                audioState.isMusicPlaying ? 'text-mc-village font-bold' : 'text-white'
              }`}
              title={audioState.isMusicPlaying ? 'Pause' : 'Play'}
            >
              {audioState.isMusicPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                sounds.nextTrack();
              }}
              className="py-1.5 mc-button text-[10px] text-white uppercase flex items-center justify-center gap-1"
              title="Next Track"
            >
              Next ⏭
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                sounds.selectTrack('random');
              }}
              className={`py-1.5 mc-button text-[10px] uppercase flex items-center justify-center gap-1 ${
                audioState.musicMode === 'random' ? 'text-mc-village' : 'text-gray-300'
              }`}
              title="Enable Random Mode"
            >
              🎲 Random
            </button>
          </div>

          {/* Music Volume Slider */}
          <div className="flex items-center justify-between gap-3 bg-[#131117] p-2 border border-black">
            <span className="text-[10px] text-gray-300 shrink-0 flex items-center gap-1">
              <span>🎶 Music Vol:</span>
              <span className="text-white font-bold w-9 text-right">
                {audioState.isMusicMuted ? '0%' : `${Math.round(audioState.musicVolume * 100)}%`}
              </span>
            </span>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioState.isMusicMuted ? 0 : audioState.musicVolume}
              onChange={(e) => {
                sounds.setMusicVolume(parseFloat(e.target.value));
              }}
              className="w-full accent-[#55FF55] h-1.5 bg-[#333] cursor-pointer"
            />

            <button
              onClick={() => {
                sounds.playClick();
                sounds.toggleMusicMute();
              }}
              className={`px-2 py-0.5 mc-button text-[9px] uppercase shrink-0 ${
                audioState.isMusicMuted ? 'text-red-400' : 'text-mc-village'
              }`}
              title="Toggle Music Mute"
            >
              {audioState.isMusicMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: INDEPENDENT VOLUME CONTROLS
        ========================================================================= */}
        <section className="bg-[#1c1a21] border border-[#3e3a49] p-3.5 mb-4 shadow-inner">
          <div className="text-xs text-[#FFAA00] font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <span>🔊</span>
            <span>Audio Channels</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Master Volume */}
            <div className="flex items-center justify-between gap-3 bg-[#131117] p-2 border border-black">
              <span className="text-[10px] text-gray-300 shrink-0 flex items-center gap-1">
                <span>Master Volume:</span>
                <span className="text-white font-bold w-9 text-right">
                  {audioState.isMasterMuted ? '0%' : `${Math.round(audioState.masterVolume * 100)}%`}
                </span>
              </span>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioState.isMasterMuted ? 0 : audioState.masterVolume}
                onChange={(e) => {
                  sounds.setMasterVolume(parseFloat(e.target.value));
                }}
                className="w-full accent-[#FFAA00] h-1.5 bg-[#333] cursor-pointer"
              />

              <button
                onClick={() => {
                  sounds.playClick();
                  sounds.toggleMasterMute();
                }}
                className={`px-2 py-0.5 mc-button text-[9px] uppercase shrink-0 ${
                  audioState.isMasterMuted ? 'text-red-400' : 'text-mc-village'
                }`}
              >
                {audioState.isMasterMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>

            {/* Environmental Ambience Volume */}
            <div className="flex items-center justify-between gap-3 bg-[#131117] p-2 border border-black">
              <span className="text-[10px] text-gray-300 shrink-0 flex items-center gap-1">
                <span>Ambience Vol:</span>
                <span className="text-white font-bold w-9 text-right">
                  {audioState.isAmbienceMuted ? '0%' : `${Math.round(audioState.ambienceVolume * 100)}%`}
                </span>
              </span>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioState.isAmbienceMuted ? 0 : audioState.ambienceVolume}
                onChange={(e) => {
                  sounds.setAmbienceVolume(parseFloat(e.target.value));
                }}
                className="w-full accent-[#55FF88] h-1.5 bg-[#333] cursor-pointer"
              />

              <button
                onClick={() => {
                  sounds.playClick();
                  sounds.toggleAmbienceMute();
                }}
                className={`px-2 py-0.5 mc-button text-[9px] uppercase shrink-0 ${
                  audioState.isAmbienceMuted ? 'text-red-400' : 'text-mc-village'
                }`}
              >
                {audioState.isAmbienceMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>

            {/* SFX Volume */}
            <div className="flex items-center justify-between gap-3 bg-[#131117] p-2 border border-black">
              <span className="text-[10px] text-gray-300 shrink-0 flex items-center gap-1">
                <span>SFX Volume:</span>
                <span className="text-white font-bold w-9 text-right">
                  {`${Math.round(audioState.sfxVolume * 100)}%`}
                </span>
              </span>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioState.sfxVolume}
                onChange={(e) => {
                  sounds.setSfxVolume(parseFloat(e.target.value));
                }}
                className="w-full accent-[#00E5FF] h-1.5 bg-[#333] cursor-pointer"
              />
              <span className="w-[50px]" />
            </div>

            {/* UI Volume */}
            <div className="flex items-center justify-between gap-3 bg-[#131117] p-2 border border-black">
              <span className="text-[10px] text-gray-300 shrink-0 flex items-center gap-1">
                <span>UI Click Vol:</span>
                <span className="text-white font-bold w-9 text-right">
                  {`${Math.round(audioState.uiVolume * 100)}%`}
                </span>
              </span>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioState.uiVolume}
                onChange={(e) => {
                  sounds.setUiVolume(parseFloat(e.target.value));
                }}
                className="w-full accent-[#B388FF] h-1.5 bg-[#333] cursor-pointer"
              />
              <span className="w-[50px]" />
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: WORLD & GRAPHICS
        ========================================================================= */}
        <section className="bg-[#1c1a21] border border-[#3e3a49] p-3 mb-4 flex items-center justify-between">
          <div className="text-[10px] text-gray-300">
            <div>Current Biome: <span style={{ color: biome.color }}>{biome.name}</span></div>
            <div className="text-[#888] text-[9px] mt-0.5">Atmosphere active for this scene</div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-300">Graphics:</span>
            <button
              onClick={() => {
                sounds.playClick();
                setQuality(quality === 'high' ? 'med' : quality === 'med' ? 'low' : 'high');
              }}
              className="px-2.5 py-1 mc-button text-[10px] uppercase text-white"
            >
              {quality} Quality
            </button>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: KEYBOARD SHORTCUTS & DONE BUTTON
        ========================================================================= */}
        <div className="text-[9px] text-[#888] text-center mb-4 leading-relaxed">
          Shortcuts: [1-9] Biome Warp · [E] Inventory · [O] Settings · [M] Mute · [R] Reset
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              sounds.playClick();
              setOptionsModalOpen(false);
            }}
            className="w-44 py-2 mc-button text-xs uppercase text-white font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
