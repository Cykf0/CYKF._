/**
 * GLOBAL MINECRAFT AUDIO & MUSIC SYSTEM — Cykf._ Portfolio
 * 
 * Includes:
 * 1. Global Background Music Player (6 authentic Minecraft tracks by C418, random on refresh, scene-persistent)
 * 2. Complete Sound Effect Engine (55 authentic Minecraft sounds, polyphony control, procedural fallbacks)
 * 3. 9-Biome Dynamic Environmental Ambience (cross-fading procedural + sampled soundscapes for every world)
 * 4. Separate Volume Channels (Master, Music, SFX, Ambience, UI) with LocalStorage persistence
 */

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  duration?: number;
}

export const MINECRAFT_TRACKS: MusicTrack[] = [
  { id: 'key', title: 'Key', artist: 'C418', src: '/audio/music/key.mp3' },
  { id: 'door', title: 'Door', artist: 'C418', src: '/audio/music/door.mp3' },
  { id: 'moog_city', title: 'Moog City', artist: 'C418', src: '/audio/music/moog_city.mp3' },
  { id: 'mice_on_venus', title: 'Mice on Venus', artist: 'C418', src: '/audio/music/mice_on_venus.mp3' },
  { id: 'dry_hands', title: 'Dry Hands', artist: 'C418', src: '/audio/music/dry_hands.mp3' },
  { id: 'wet_hands', title: 'Wet Hands', artist: 'C418', src: '/audio/music/wet_hands.mp3' },
];

export interface AudioSettingsState {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambienceVolume: number;
  uiVolume: number;
  isMasterMuted: boolean;
  isMusicMuted: boolean;
  isAmbienceMuted: boolean;
  musicMode: 'random' | 'manual';
  currentTrackIndex: number;
  isMusicPlaying: boolean;
}

class SoundManager {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;

  // Master Gain Routing
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private uiGain: GainNode | null = null;

  // Audio Buffers Cache for SFX
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private loadingBuffers: Map<string, Promise<AudioBuffer | null>> = new Map();
  private lastSoundTimes: Map<string, number> = new Map();

  // Background Music State
  private audioElement: HTMLAudioElement | null = null;
  private musicSourceNode: MediaElementAudioSourceNode | null = null;
  private currentTrackIndex = 0;
  private musicMode: 'random' | 'manual' = 'random';
  private isMusicPlaying = false;
  private musicFadeTimeout: any = null;

  // Ambience State
  private currentBiomeIndex = 0;
  private activeAmbienceNodes: {
    gain: GainNode;
    stop: () => void;
  } | null = null;

  // Volumes
  private masterVol = 1.0;
  private musicVol = 0.65;
  private sfxVol = 0.85;
  private ambienceVol = 0.55;
  private uiVol = 0.85;

  private isMasterMuted = false;
  private isMusicMuted = false;
  private isAmbienceMuted = false;

  // Listeners for UI updates
  private stateChangeCallbacks: Set<(state: AudioSettingsState) => void> = new Set();

  constructor() {
    this.loadSavedPreferences();
    this.selectInitialRandomTrack();
  }

  /**
   * Subscribe to audio state changes for React components
   */
  public subscribe(cb: (state: AudioSettingsState) => void): () => void {
    this.stateChangeCallbacks.add(cb);
    cb(this.getState());
    return () => this.stateChangeCallbacks.delete(cb);
  }

  private notifyState() {
    const state = this.getState();
    this.stateChangeCallbacks.forEach((cb) => cb(state));
  }

  public getState(): AudioSettingsState {
    return {
      masterVolume: this.masterVol,
      musicVolume: this.musicVol,
      sfxVolume: this.sfxVol,
      ambienceVolume: this.ambienceVol,
      uiVolume: this.uiVol,
      isMasterMuted: this.isMasterMuted,
      isMusicMuted: this.isMusicMuted,
      isAmbienceMuted: this.isAmbienceMuted,
      musicMode: this.musicMode,
      currentTrackIndex: this.currentTrackIndex,
      isMusicPlaying: this.isMusicPlaying,
    };
  }

  /**
   * Load saved volumes and preferences from LocalStorage
   */
  private loadSavedPreferences() {
    if (typeof window === 'undefined') return;
    try {
      const savedMasterMute = localStorage.getItem('cykf_muted');
      if (savedMasterMute !== null) this.isMasterMuted = savedMasterMute === 'true';

      const savedMusicMute = localStorage.getItem('cykf_music_muted');
      if (savedMusicMute !== null) this.isMusicMuted = savedMusicMute === 'true';

      const savedMasterVol = localStorage.getItem('cykf_master_vol');
      if (savedMasterVol !== null) this.masterVol = Math.max(0, Math.min(1, parseFloat(savedMasterVol)));

      const savedMusicVol = localStorage.getItem('cykf_music_vol');
      if (savedMusicVol !== null) this.musicVol = Math.max(0, Math.min(1, parseFloat(savedMusicVol)));

      const savedSfxVol = localStorage.getItem('cykf_sfx_vol');
      if (savedSfxVol !== null) this.sfxVol = Math.max(0, Math.min(1, parseFloat(savedSfxVol)));

      const savedAmbienceVol = localStorage.getItem('cykf_ambience_vol');
      if (savedAmbienceVol !== null) this.ambienceVol = Math.max(0, Math.min(1, parseFloat(savedAmbienceVol)));

      const savedUiVol = localStorage.getItem('cykf_ui_vol');
      if (savedUiVol !== null) this.uiVol = Math.max(0, Math.min(1, parseFloat(savedUiVol)));

      const savedMode = localStorage.getItem('cykf_music_mode');
      if (savedMode === 'manual' || savedMode === 'random') {
        this.musicMode = savedMode;
      }
    } catch {
      // LocalStorage error fallback
    }
  }

  /**
   * 1. Random Music on Refresh:
   * Chooses a genuinely randomized track from the 6, avoiding consecutive duplicates
   */
  private selectInitialRandomTrack() {
    if (typeof window === 'undefined') return;
    let lastTrack: number | null = null;
    try {
      const raw = sessionStorage.getItem('cykf_last_music_index');
      if (raw !== null) lastTrack = parseInt(raw, 10);
    } catch {}

    const count = MINECRAFT_TRACKS.length;
    let chosen: number;
    if (lastTrack !== null && !isNaN(lastTrack) && count > 1) {
      // Pick any track except the last one
      const candidates = [];
      for (let i = 0; i < count; i++) {
        if (i !== lastTrack) candidates.push(i);
      }
      chosen = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      chosen = Math.floor(Math.random() * count);
    }

    this.currentTrackIndex = chosen;
    try {
      sessionStorage.setItem('cykf_last_music_index', String(chosen));
    } catch {}
  }

  /**
   * Initialize Web Audio Context and Gain Busses
   */
  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // 1. Master Bus
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMasterMuted ? 0 : this.masterVol, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // 2. Music Bus
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.isMusicMuted ? 0 : this.musicVol, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        // 3. SFX Bus
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        // 4. Ambience Bus
        this.ambienceGain = this.ctx.createGain();
        this.ambienceGain.gain.setValueAtTime(this.isAmbienceMuted ? 0 : this.ambienceVol, this.ctx.currentTime);
        this.ambienceGain.connect(this.masterGain);

        // 5. UI Bus
        this.uiGain = this.ctx.createGain();
        this.uiGain.gain.setValueAtTime(this.uiVol, this.ctx.currentTime);
        this.uiGain.connect(this.masterGain);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended' && this.isUnlocked) {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Browser Autoplay unlock on first user interaction
   */
  public unlock() {
    if (this.isUnlocked) return;
    this.isUnlocked = true;

    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Initialize Audio Element for Music Player
    this.initAudioElement();

    // Start background music and scene ambience
    this.playMusic();
    this.startBiomeAmbience(this.currentBiomeIndex);

    // Warm up critical UI sound buffers
    this.preloadBuffer('/audio/sfx/click.mp3');
    this.preloadBuffer('/audio/sfx/button_click.mp3');
    this.preloadBuffer('/audio/sfx/chest_open.mp3');
    this.preloadBuffer('/audio/sfx/item_pickup.mp3');
    this.preloadBuffer('/audio/sfx/xp_orb.mp3');
  }

  // =========================================================================
  // MUSIC PLAYER SYSTEM
  // =========================================================================

  private initAudioElement() {
    if (this.audioElement || typeof window === 'undefined') return;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.loop = false;

    // Auto-advance when track finishes
    audio.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    audio.addEventListener('play', () => {
      this.isMusicPlaying = true;
      this.notifyState();
    });

    audio.addEventListener('pause', () => {
      this.isMusicPlaying = false;
      this.notifyState();
    });

    audio.addEventListener('error', (e) => {
      console.warn('Music playback error:', e);
      // Gracefully advance to next track on error
      setTimeout(() => this.nextTrack(), 1500);
    });

    this.audioElement = audio;

    // Connect to Web Audio musicGain if possible
    const ctx = this.getContext();
    if (ctx && this.musicGain && !this.musicSourceNode) {
      try {
        this.musicSourceNode = ctx.createMediaElementSource(audio);
        this.musicSourceNode.connect(this.musicGain);
      } catch (err) {
        // Fallback to standard audio element volume
        audio.volume = this.isMusicMuted || this.isMasterMuted ? 0 : this.musicVol * this.masterVol;
      }
    }
  }

  private handleTrackEnded() {
    if (this.musicMode === 'random') {
      // Pick another random track without immediately repeating current track
      const count = MINECRAFT_TRACKS.length;
      const candidates = [];
      for (let i = 0; i < count; i++) {
        if (i !== this.currentTrackIndex) candidates.push(i);
      }
      const nextIdx = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
      this.switchTrack(nextIdx, true);
    } else {
      // In manual mode: repeat or advance
      this.nextTrack();
    }
  }

  public playMusic() {
    this.initAudioElement();
    if (!this.audioElement) return;

    const track = MINECRAFT_TRACKS[this.currentTrackIndex];
    if (!track) return;

    const currentSrc = this.audioElement.src || '';
    if (!currentSrc.includes(track.src)) {
      this.audioElement.src = track.src;
      this.audioElement.load();
    }

    this.audioElement.play().then(() => {
      this.isMusicPlaying = true;
      this.notifyState();
    }).catch((err) => {
      // Autoplay blocked by browser; will start on first click
      this.isMusicPlaying = false;
      this.notifyState();
    });
  }

  public pauseMusic() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isMusicPlaying = false;
      this.notifyState();
    }
  }

  public toggleMusic() {
    if (this.isMusicPlaying) {
      this.pauseMusic();
    } else {
      this.playMusic();
    }
  }

  public nextTrack() {
    if (this.musicMode === 'random') {
      const count = MINECRAFT_TRACKS.length;
      const candidates = [];
      for (let i = 0; i < count; i++) {
        if (i !== this.currentTrackIndex) candidates.push(i);
      }
      const nextIdx = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
      this.switchTrack(nextIdx, true);
    } else {
      const nextIdx = (this.currentTrackIndex + 1) % MINECRAFT_TRACKS.length;
      this.switchTrack(nextIdx, true);
    }
  }

  public prevTrack() {
    const prevIdx = (this.currentTrackIndex - 1 + MINECRAFT_TRACKS.length) % MINECRAFT_TRACKS.length;
    this.switchTrack(prevIdx, true);
  }

  public selectTrack(indexOrRandom: number | 'random') {
    if (indexOrRandom === 'random') {
      this.musicMode = 'random';
      if (typeof window !== 'undefined') localStorage.setItem('cykf_music_mode', 'random');
      this.nextTrack();
    } else {
      this.musicMode = 'manual';
      if (typeof window !== 'undefined') localStorage.setItem('cykf_music_mode', 'manual');
      const idx = Math.max(0, Math.min(MINECRAFT_TRACKS.length - 1, indexOrRandom));
      this.switchTrack(idx, true);
    }
  }

  /**
   * Smooth volume crossfade when changing tracks
   */
  private switchTrack(newIndex: number, autoPlay: boolean = true) {
    this.currentTrackIndex = newIndex;
    try {
      sessionStorage.setItem('cykf_last_music_index', String(newIndex));
    } catch {}

    const track = MINECRAFT_TRACKS[newIndex];
    if (!track) return;

    if (!this.audioElement) {
      this.initAudioElement();
    }

    if (this.audioElement) {
      // Fade out slightly
      const targetVolume = this.isMusicMuted || this.isMasterMuted ? 0 : this.musicVol;
      if (this.musicGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
        this.musicGain.gain.linearRampToValueAtTime(0.01, now + 0.35);

        clearTimeout(this.musicFadeTimeout);
        this.musicFadeTimeout = setTimeout(() => {
          if (!this.audioElement) return;
          this.audioElement.src = track.src;
          this.audioElement.load();
          if (autoPlay) {
            this.audioElement.play().catch(() => {});
          }
          if (this.ctx && this.musicGain) {
            const resumeTime = this.ctx.currentTime;
            this.musicGain.gain.cancelScheduledValues(resumeTime);
            this.musicGain.gain.setValueAtTime(0.01, resumeTime);
            this.musicGain.gain.linearRampToValueAtTime(targetVolume, resumeTime + 0.6);
          }
        }, 360);
      } else {
        this.audioElement.src = track.src;
        this.audioElement.load();
        if (autoPlay) this.audioElement.play().catch(() => {});
      }
    }

    this.notifyState();
  }

  public getCurrentTrack(): MusicTrack {
    return MINECRAFT_TRACKS[this.currentTrackIndex] || MINECRAFT_TRACKS[0];
  }

  // =========================================================================
  // VOLUME & MUTE CONTROLS
  // =========================================================================

  public setMasterVolume(val: number) {
    this.masterVol = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') localStorage.setItem('cykf_master_vol', String(this.masterVol));
    this.updateGains();
    this.notifyState();
  }

  public setMusicVolume(val: number) {
    this.musicVol = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') localStorage.setItem('cykf_music_vol', String(this.musicVol));
    this.updateGains();
    this.notifyState();
  }

  public setSfxVolume(val: number) {
    this.sfxVol = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') localStorage.setItem('cykf_sfx_vol', String(this.sfxVol));
    this.updateGains();
    this.notifyState();
  }

  public setAmbienceVolume(val: number) {
    this.ambienceVol = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') localStorage.setItem('cykf_ambience_vol', String(this.ambienceVol));
    this.updateGains();
    this.notifyState();
  }

  public setUiVolume(val: number) {
    this.uiVol = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') localStorage.setItem('cykf_ui_vol', String(this.uiVol));
    this.updateGains();
    this.notifyState();
  }

  public toggleMasterMute(): boolean {
    this.isMasterMuted = !this.isMasterMuted;
    if (typeof window !== 'undefined') localStorage.setItem('cykf_muted', String(this.isMasterMuted));
    this.updateGains();
    this.notifyState();
    return this.isMasterMuted;
  }

  public toggleMusicMute(): boolean {
    this.isMusicMuted = !this.isMusicMuted;
    if (typeof window !== 'undefined') localStorage.setItem('cykf_music_muted', String(this.isMusicMuted));
    this.updateGains();
    this.notifyState();
    return this.isMusicMuted;
  }

  public toggleAmbienceMute(): boolean {
    this.isAmbienceMuted = !this.isAmbienceMuted;
    this.updateGains();
    this.notifyState();
    return this.isAmbienceMuted;
  }

  private updateGains() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (this.masterGain) {
      const mVal = this.isMasterMuted ? 0 : this.masterVol;
      this.masterGain.gain.setValueAtTime(mVal, now);
    }
    if (this.musicGain) {
      const muVal = this.isMusicMuted ? 0 : this.musicVol;
      this.musicGain.gain.setValueAtTime(muVal, now);
    }
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.sfxVol, now);
    }
    if (this.ambienceGain) {
      const ambVal = this.isAmbienceMuted ? 0 : this.ambienceVol;
      this.ambienceGain.gain.setValueAtTime(ambVal, now);
    }
    if (this.uiGain) {
      this.uiGain.gain.setValueAtTime(this.uiVol, now);
    }

    // Direct audio element fallback volume
    if (this.audioElement && !this.musicSourceNode) {
      this.audioElement.volume = this.isMusicMuted || this.isMasterMuted ? 0 : this.musicVol * this.masterVol;
    }
  }

  // =========================================================================
  // SOUND EFFECTS ENGINE (SAMPLES + SYNTHESIS FALLBACK)
  // =========================================================================

  private async preloadBuffer(url: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(url)) return this.bufferCache.get(url)!;
    if (this.loadingBuffers.has(url)) return this.loadingBuffers.get(url)!;

    const promise = (async () => {
      try {
        const ctx = this.getContext();
        if (!ctx) return null;
        const resp = await fetch(url);
        if (!resp.ok) return null;
        const arrayBuf = await resp.arrayBuffer();
        const audioBuf = await ctx.decodeAudioData(arrayBuf);
        this.bufferCache.set(url, audioBuf);
        return audioBuf;
      } catch (err) {
        return null;
      } finally {
        this.loadingBuffers.delete(url);
      }
    })();

    this.loadingBuffers.set(url, promise);
    return promise;
  }

  /**
   * Play an authentic sample from /audio/sfx/ with polyphony throttling and procedural fallback
   */
  private playSample(
    sampleUrl: string,
    options: {
      volume?: number;
      rate?: number;
      pitchDetune?: number;
      destination?: 'sfx' | 'ui' | 'ambience';
      minInterval?: number;
      fallback?: () => void;
    } = {}
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    // Polyphony limiter: avoid machine-gun ear fatigue
    const minInterval = options.minInterval ?? 35;
    const now = ctx.currentTime;
    const lastTime = this.lastSoundTimes.get(sampleUrl) || 0;
    if (now - lastTime < minInterval / 1000) return;
    this.lastSoundTimes.set(sampleUrl, now);

    const bus = options.destination === 'ui' ? this.uiGain : this.sfxGain;
    const dest = bus || ctx.destination;

    const cached = this.bufferCache.get(sampleUrl);
    if (cached) {
      this.playBuffer(cached, dest, options);
    } else {
      // Buffer not ready yet: execute procedural fallback immediately, then cache sample
      if (options.fallback) options.fallback();
      this.preloadBuffer(sampleUrl);
    }
  }

  private playBuffer(
    buffer: AudioBuffer,
    destination: AudioNode,
    options: { volume?: number; rate?: number; pitchDetune?: number } = {}
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Pitch variation for natural variety
    const rate = options.rate ?? (1.0 + (Math.random() * 0.08 - 0.04));
    source.playbackRate.setValueAtTime(rate, ctx.currentTime);

    if (options.pitchDetune && source.detune) {
      source.detune.setValueAtTime(options.pitchDetune, ctx.currentTime);
    }

    const gainNode = ctx.createGain();
    const vol = options.volume ?? 1.0;
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(destination);

    source.start(ctx.currentTime);
  }

  // =========================================================================
  // 1. OBJECT-SPECIFIC MINECRAFT SOUNDS
  // =========================================================================

  // Doors: Wood, Stone, Iron
  public playDoorOpen(type: 'wood' | 'iron' | 'trapdoor' = 'wood') {
    this.playSample('/audio/sfx/door_open.mp3', {
      volume: 0.9,
      fallback: () => {
        this.synthTone(280, 420, 0.18, 'sawtooth');
      }
    });
  }

  public playDoorClose(type: 'wood' | 'iron' | 'trapdoor' = 'wood') {
    this.playSample('/audio/sfx/door_close.mp3', {
      volume: 0.9,
      fallback: () => {
        this.synthTone(420, 180, 0.16, 'triangle');
      }
    });
  }

  // Chests: Open & Close
  public playChestOpen() {
    this.playSample('/audio/sfx/chest_open.mp3', {
      volume: 0.75,
      fallback: () => {
        this.synthTone(220, 380, 0.18, 'sawtooth');
      }
    });
  }

  public playChestClose() {
    this.playSample('/audio/sfx/chest_close.mp3', {
      volume: 0.75,
      fallback: () => {
        this.synthTone(380, 180, 0.16, 'sawtooth');
      }
    });
  }

  // Inventory: Open & Close
  public playInventoryOpen() {
    this.playSample('/audio/sfx/chest_open.mp3', {
      volume: 0.55,
      fallback: () => this.playClick()
    });
  }

  public playInventoryClose() {
    this.playSample('/audio/sfx/chest_close.mp3', {
      volume: 0.55,
      fallback: () => this.playClick()
    });
  }

  // Item: Pickup, Drop, Place
  public playItemPickup() {
    this.playSample('/audio/sfx/item_pickup.mp3', {
      volume: 0.85,
      rate: 1.0 + Math.random() * 0.1,
      fallback: () => this.synthTone(450, 900, 0.08, 'sine')
    });
  }

  public playItemPop() {
    this.playItemPickup();
  }

  public playItemDrop() {
    this.playSample('/audio/sfx/item_drop.mp3', {
      volume: 0.75,
      fallback: () => this.synthTone(600, 300, 0.06, 'triangle')
    });
  }

  // Block Break, Place, Hit
  public playBlockBreak(type: 'stone' | 'wood' | 'grass' | 'gravel' | 'snow' | 'glass' = 'stone') {
    if (type === 'glass') {
      this.playSample('/audio/sfx/glass_break.mp3', { volume: 0.85 });
    } else if (type === 'wood') {
      this.playSample('/audio/sfx/wood_break.mp3', { volume: 0.8 });
    } else {
      this.playSample('/audio/sfx/stone_break.mp3', {
        volume: 0.8,
        fallback: () => this.synthCrunch(type)
      });
    }
  }

  public playBlockPlace(type: 'stone' | 'wood' | 'dirt' | 'grass' = 'stone') {
    if (type === 'wood') {
      this.playSample('/audio/sfx/wood_break.mp3', { volume: 0.65, rate: 1.2 });
    } else {
      this.playSample('/audio/sfx/stone_break.mp3', {
        volume: 0.65,
        rate: 1.3,
        fallback: () => this.synthTone(300, 90, 0.07, 'sine')
      });
    }
  }

  public playBlockHit(type: 'stone' | 'wood' | 'grass' | 'gravel' | 'snow' = 'stone') {
    this.playSample('/audio/sfx/pickaxe_hit.mp3', {
      volume: 0.7,
      rate: 0.95 + Math.random() * 0.1,
      minInterval: 45,
      fallback: () => this.synthTone(220, 90, 0.06, 'triangle')
    });
  }

  // Footsteps on different block surfaces
  public playFootstep(surface: 'grass' | 'stone' | 'sand' | 'wood' | 'snow' | 'water' = 'grass') {
    if (surface === 'sand') {
      const sample = Math.random() > 0.5 ? '/audio/sfx/sand_step.mp3' : '/audio/sfx/sand_step2.mp3';
      this.playSample(sample, { volume: 0.6, minInterval: 120 });
    } else if (surface === 'water') {
      this.playWaterSplash();
    } else {
      const sample = Math.random() > 0.5 ? '/audio/sfx/grass_step1.mp3' : '/audio/sfx/grass_step2.mp3';
      this.playSample(sample, {
        volume: 0.6,
        minInterval: 120,
        fallback: () => this.synthTone(320, 110, 0.05, 'sawtooth')
      });
    }
  }

  // Water & Lava
  public playWaterSplash() {
    const sample = Math.random() > 0.5 ? '/audio/sfx/water_splash.mp3' : '/audio/sfx/water_splash2.mp3';
    this.playSample(sample, {
      volume: 0.75,
      fallback: () => this.synthWaterSplash()
    });
  }

  public playWaterBucket() {
    this.playSample('/audio/sfx/water_bucket.mp3', { volume: 0.8 });
  }

  public playLava() {
    this.playSample('/audio/sfx/lava.mp3', { volume: 0.7 });
  }

  public playFire() {
    this.playSample('/audio/sfx/fire.mp3', { volume: 0.7 });
  }

  // Stations: Crafting Table, Anvil, Enchanting, Furnace
  public playCraft() {
    this.playSample('/audio/sfx/item_drop.mp3', {
      volume: 0.8,
      rate: 1.15,
      fallback: () => this.playClick()
    });
  }

  public playAnvilUse() {
    this.playSample('/audio/sfx/anvil_use.mp3', {
      volume: 0.85,
      fallback: () => this.synthTone(580, 220, 0.35, 'triangle')
    });
  }

  public playAnvilLand() {
    this.playSample('/audio/sfx/anvil_land.mp3', { volume: 0.9 });
  }

  public playEnchantChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + i * 0.06;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.12 * this.sfxVol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain || ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  public playSmelt() {
    this.playSample('/audio/sfx/fire_ball.mp3', { volume: 0.75 });
  }

  // Buttons, Levers, Pressure Plates
  public playButton() {
    this.playSample('/audio/sfx/button_click.mp3', {
      volume: 0.85,
      destination: 'ui',
      fallback: () => this.playClick()
    });
  }

  public playLever() {
    this.playSample('/audio/sfx/click_menu.mp3', {
      volume: 0.8,
      destination: 'ui'
    });
  }

  public playPressurePlate() {
    this.playSample('/audio/sfx/button_click.mp3', { volume: 0.75 });
  }

  // Minecart & Rail
  public playMinecart() {
    this.playSample('/audio/sfx/minecart.mp3', { volume: 0.7 });
  }

  // Villager & Animals
  public playVillagerHmm() {
    this.playSample('/audio/sfx/villager_hmm.mp3', {
      volume: 0.85,
      fallback: () => this.synthVillagerHmm()
    });
  }

  public playVillagerTrade() {
    this.playSample('/audio/sfx/villager_trade.mp3', {
      volume: 0.9,
      fallback: () => this.playXpOrb()
    });
  }

  public playVillagerYes() {
    this.playSample('/audio/sfx/villager_yes.mp3', { volume: 0.85 });
  }

  public playSheepBaa() {
    this.playSample('/audio/sfx/sheep.mp3', {
      volume: 0.75,
      fallback: () => this.synthSheepBaa()
    });
  }

  public playCow() {
    this.playSample('/audio/sfx/cow.mp3', { volume: 0.8 });
  }

  // Portals & Magic
  public playPortalWarp() {
    this.playSample('/audio/sfx/portal_hum.mp3', {
      volume: 0.85,
      fallback: () => this.synthPortalWarp()
    });
  }

  public playEndPortal() {
    this.playSample('/audio/sfx/end_portal_activate.mp3', { volume: 0.9 });
  }

  public playTeleport() {
    this.playSample('/audio/sfx/teleport.mp3', {
      volume: 0.8,
      fallback: () => this.synthTone(180, 540, 0.25, 'sawtooth')
    });
  }

  public playEndermanVwoop() {
    this.playTeleport();
  }

  // Combat & Creatures
  public playBowShoot() {
    this.playSample('/audio/sfx/bow_shoot.mp3', { volume: 0.8 });
  }

  public playCreeperFuse() {
    this.playSample('/audio/sfx/creeper_fuse.mp3', { volume: 0.85 });
  }

  public playExplosion() {
    this.playSample('/audio/sfx/explosion.mp3', { volume: 0.9 });
  }

  public playZombie() {
    this.playSample('/audio/sfx/zombie_groan.mp3', { volume: 0.75 });
  }

  public playBellRing() {
    this.playSample('/audio/sfx/bell.mp3', {
      volume: 0.9,
      fallback: () => this.synthTone(1320, 1310, 0.85, 'sine')
    });
  }

  public playEat() {
    this.playSample('/audio/sfx/eat.mp3', {
      volume: 0.8,
      fallback: () => this.synthTone(280, 80, 0.08, 'triangle')
    });
  }

  public playDrinkPotion() {
    this.playSample('/audio/sfx/drink_potion.mp3', { volume: 0.85 });
  }

  public playHurt() {
    this.playSample('/audio/sfx/hurt.mp3', {
      volume: 0.85,
      fallback: () => this.synthTone(160, 60, 0.12, 'triangle')
    });
  }

  // =========================================================================
  // 2. UI & WEBSITE INTERACTION SOUNDS
  // =========================================================================

  public playClick() {
    this.playSample('/audio/sfx/click.mp3', {
      volume: 0.85,
      destination: 'ui',
      fallback: () => this.synthTone(140, 40, 0.04, 'triangle')
    });
  }

  public playButtonClick() {
    this.playButton();
  }

  public playHover() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.015);

    gain.gain.setValueAtTime(0.04 * this.uiVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.uiGain || ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  public playHotbarTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.02);

    gain.gain.setValueAtTime(0.08 * this.uiVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.uiGain || ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  public playXpOrb() {
    this.playSample('/audio/sfx/xp_orb.mp3', {
      volume: 0.85,
      rate: 1.0 + Math.random() * 0.15,
      fallback: () => this.synthTone(880, 1320, 0.1, 'sine')
    });
  }

  public playLevelUp() {
    this.playSample('/audio/sfx/xp_level_up.mp3', {
      volume: 0.9,
      fallback: () => this.playToastJingle()
    });
  }

  public playToastJingle() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.08;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12 * this.uiVol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.uiGain || ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  public playWobble(pitch: number = 440) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(pitch, now + 0.16);

    gain.gain.setValueAtTime(0.1 * this.uiVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.uiGain || ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playParticleBurst() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    gain.gain.setValueAtTime(0.08 * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain || ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playSceneTransition() {
    this.playTeleport();
  }

  public playWorldLoad() {
    this.playLevelUp();
  }

  // =========================================================================
  // 3. ENVIRONMENTAL AMBIENCE FOR ALL NINE WORLDS
  // =========================================================================

  public setBiome(biomeIndex: number) {
    if (this.currentBiomeIndex === biomeIndex && this.activeAmbienceNodes) return;
    this.currentBiomeIndex = biomeIndex;
    if (this.isUnlocked) {
      this.startBiomeAmbience(biomeIndex);
    }
  }

  private startBiomeAmbience(biomeIndex: number) {
    const ctx = this.getContext();
    if (!ctx || !this.ambienceGain) return;

    // Smoothly fade out previous ambience
    if (this.activeAmbienceNodes) {
      const oldNodes = this.activeAmbienceNodes;
      const now = ctx.currentTime;
      oldNodes.gain.gain.cancelScheduledValues(now);
      oldNodes.gain.gain.setValueAtTime(oldNodes.gain.gain.value, now);
      oldNodes.gain.gain.linearRampToValueAtTime(0.001, now + 0.8);
      setTimeout(() => oldNodes.stop(), 850);
      this.activeAmbienceNodes = null;
    }

    const currentGain = ctx.createGain();
    currentGain.gain.setValueAtTime(0.001, ctx.currentTime);
    currentGain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.8);
    currentGain.connect(this.ambienceGain);

    const activeStoppers: (() => void)[] = [];

    // Construct specific soundscape for each of the 9 worlds
    switch (biomeIndex) {
      case 0:
        // 0. The Developer Archive: subtle room tone, quiet clock tick, soft mechanical details
        this.createLibraryAmbience(ctx, currentGain, activeStoppers);
        break;
      case 1:
        // 1. Eternal Forest: wind, rustling leaves, birds, distant flowing water
        this.createForestAmbience(ctx, currentGain, activeStoppers);
        break;
      case 2:
        // 2. Arcane Library: quiet magical ambience, enchanting sounds, subtle echoes
        this.createArcaneAmbience(ctx, currentGain, activeStoppers);
        break;
      case 3:
        // 3. Abandoned Mines: cave ambience, dripping water, minecart sounds
        this.createMinesAmbience(ctx, currentGain, activeStoppers);
        break;
      case 4:
        // 4. Frozen Frontier: cold wind, snow and ice ambience
        this.createSnowAmbience(ctx, currentGain, activeStoppers);
        break;
      case 5:
        // 5. The Deep Dark: mysterious underground ambience, sculk-like sounds
        this.createDeepDarkAmbience(ctx, currentGain, activeStoppers);
        break;
      case 6:
        // 6. The Villager's Home: fireplace, village ambience, peaceful sounds
        this.createVillageHomeAmbience(ctx, currentGain, activeStoppers);
        break;
      case 7:
        // 7. The Lost Paradise: waterfalls, flowing water, wildlife, lush cave
        this.createParadiseAmbience(ctx, currentGain, activeStoppers);
        break;
      case 8:
      default:
        // 8. The Endless Void: atmospheric wind, mysterious echoes, otherworldly ambience
        this.createVoidAmbience(ctx, currentGain, activeStoppers);
        break;
    }

    this.activeAmbienceNodes = {
      gain: currentGain,
      stop: () => {
        activeStoppers.forEach((s) => s());
      }
    };
  }

  // --- World Ambience Builders ---

  private createNoiseGenerator(ctx: AudioContext, gainNode: GainNode, filterFreq: number, filterQ: number, type: BiquadFilterType = 'lowpass') {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);
    filter.Q.setValueAtTime(filterQ, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    whiteNoise.start();

    return () => {
      try {
        whiteNoise.stop();
        whiteNoise.disconnect();
      } catch {}
    };
  }

  private createLibraryAmbience(ctx: AudioContext, masterGain: GainNode, stoppers: (() => void)[]) {
    // Soft low drone (room tone)
    const stopNoise = this.createNoiseGenerator(ctx, masterGain, 160, 2, 'lowpass');
    stoppers.push(stopNoise);

    // Occasional gentle paper rustle / tick interval
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        this.playHover();
      }
    }, 4500);
    stoppers.push(() => clearInterval(interval));
  }

  private createForestAmbience(ctx: AudioContext, masterGain: GainNode, stoppers: (() => void)[]) {
    // Gentle foliage wind
    const stopWind = this.createNoiseGenerator(ctx, masterGain, 380, 1.5, 'bandpass');
    stoppers.push(stopWind);

    // Subtle water stream tone
    const stopWater = this.createNoiseGenerator(ctx, masterGain, 240, 2.5, 'lowpass');
    stoppers.push(stopWater);

    // Periodic cheerful forest bird chirps
    const interval = setInterval(() => {
      if (Math.random() > 0.3 && this.currentBiomeIndex === 1) {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400 + Math.random() * 800, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    }, 3800);
    stoppers.push(() => clearInterval(interval));
  }

  private createArcaneAmbience(ctx: AudioContext, masterGain: GainNode, stoppers: (() => void)[]) {
    // Shimmering mystical chord drone
    const freqs = [174.61, 261.63, 349.23, 523.25]; // F3, C4, F4, C5
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      stoppers.push(() => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
    });

    // Enchanted glyph sparkles
    const interval = setInterval(() => {
      if (Math.random() > 0.5 && this.currentBiomeIndex === 2) {
        this.playEnchantChime();
      }
    }, 6000);
    stoppers.push(() => clearInterval(interval));
  }

  private createMinesAmbience(ctx: AudioContext, masterGain: GainNode, stoppers: (() => void)[]) {
    // Deep cave reverberant air
    const stopAir = this.createNoiseGenerator(ctx, masterGain, 110, 3.5, 'bandpass');
    stoppers.push(stopAir);

    // Occasional cave drone sample
    const interval = setInterval(() => {
      if (Math.random() > 0.5 && this.currentBiomeIndex === 3) {
        this.playSample('/audio/sfx/cave_ambience1.mp3', { volume: 0.5, destination: 'ambience' });
      }
    }, 8500);
    stoppers.push(() => clearInterval(interval));
  }

  private createSnowAmbience(ctx: AudioContext, masterGain: GainNode, stoppers: (() => void)[]) {
    // Cold whistling mountain wind
    const stopWind = this.createNoiseGenerator(ctx, masterGain, 550, 4.0, 'bandpass');
    stoppers.push(stopWind);

    const subWind = this.createNoiseGenerator(ctx, masterGain, 90, 1.2, 'lowpass');
    stoppers.push(subWind);
  }

  private createDeepDarkAmbience(ctx: AudioContext, masterGain: GainNode, stoppers: (() => void)[]) {
    // Low subsonic rumble
    const stopSub = this.createNoiseGenerator(ctx, masterGain, 65, 4.0, 'lowpass');
    stoppers.push(stopSub);

    // Occasional sculk / cave eerie resonance
    const interval = setInterval(() => {
      if (Math.random() > 0.4 && this.currentBiomeIndex === 5) {
        this.playSample('/audio/sfx/cave_ambience2.mp3', { volume: 0.55, destination: 'ambience' });
      }
    }, 7000);
    stoppers.push(() => clearInterval(interval));
  }

  private createVillageHomeAmbience(ctx: AudioContext, masterGain: GainNode, stoppers: (() => void)[]) {
    // Warm crackling fireplace
    const stopFire = this.createNoiseGenerator(ctx, masterGain, 320, 2.0, 'bandpass');
    stoppers.push(stopFire);

    const interval = setInterval(() => {
      if (Math.random() > 0.6 && this.currentBiomeIndex === 6) {
        this.playSample('/audio/sfx/fire.mp3', { volume: 0.35, destination: 'ambience' });
      }
    }, 6000);
    stoppers.push(() => clearInterval(interval));
  }

  private createParadiseAmbience(ctx: AudioContext, masterGain: GainNode, stoppers: (() => void)[]) {
    // Cascading waterfall and lush cave acoustics
    const stopWaterfall = this.createNoiseGenerator(ctx, masterGain, 600, 1.2, 'lowpass');
    stoppers.push(stopWaterfall);

    const interval = setInterval(() => {
      if (Math.random() > 0.4 && this.currentBiomeIndex === 7) {
        this.playWaterSplash();
      }
    }, 4500);
    stoppers.push(() => clearInterval(interval));
  }

  private createVoidAmbience(ctx: AudioContext, masterGain: GainNode, stoppers: (() => void)[]) {
    // Cosmic void drone
    const freqs = [55.0, 110.0, 164.81]; // A1, A2, E3
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      stoppers.push(() => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
    });

    const stopWind = this.createNoiseGenerator(ctx, masterGain, 180, 2.5, 'bandpass');
    stoppers.push(stopWind);
  }

  // =========================================================================
  // PROCEDURAL AUDIO SYNTHESIZERS (FALLBACK IMPLEMENTATIONS)
  // =========================================================================

  private synthTone(startFreq: number, endFreq: number, duration: number, type: OscillatorType = 'sine') {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), now + duration);

    gain.gain.setValueAtTime(0.12 * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain || ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private synthCrunch(type: string) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [180, 110, 60].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.03;
      osc.type = type === 'stone' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq + Math.random() * 30, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);
      gain.gain.setValueAtTime(0.14 * this.sfxVol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain);
      gain.connect(this.sfxGain || ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  private synthWaterSplash() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.04;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400 + Math.random() * 200, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);
      gain.gain.setValueAtTime(0.08 * this.sfxVol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain);
      gain.connect(this.sfxGain || ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  private synthVillagerHmm() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(4.0, now);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(125, now + 0.25);

    gain.gain.setValueAtTime(0.16 * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain || ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  private synthSheepBaa() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(3.0, now);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.15);
    osc.frequency.linearRampToValueAtTime(190, now + 0.35);

    gain.gain.setValueAtTime(0.14 * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain || ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  private synthPortalWarp() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.8);

    gain.gain.setValueAtTime(0.14 * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(gain);
    gain.connect(this.sfxGain || ctx.destination);

    osc.start(now);
    osc.stop(now + 0.9);
  }
}

export const sounds = new SoundManager();
