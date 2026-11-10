import { create } from 'zustand';
import { sounds } from './audio/soundManager';

export type QualityLevel = 'low' | 'med' | 'high';

export interface BiomeMeta {
  index: number;
  id: string;
  name: string;
  color: string;
  skyColor: string;
  hash: string;
  day: number;
  time: string;
  heldItem: string;
}

export const BIOMES: BiomeMeta[] = [
  { index: 0, id: 'village-sunrise', name: 'The Developer Archive', color: '#55FF55', skyColor: '#FFA756', hash: '#village', day: 1, time: '06:30', heldItem: 'diamond-pickaxe' },
  { index: 1, id: 'cherry-grove', name: 'The Eternal Forest', color: '#55FF88', skyColor: '#64A388', hash: '#profile', day: 1, time: '11:45', heldItem: 'compass' },
  { index: 2, id: 'stronghold', name: 'The Arcane Library', color: '#B388FF', skyColor: '#160C26', hash: '#enchantments', day: 1, time: '15:20', heldItem: 'book' },
  { index: 3, id: 'mineshaft', name: 'The Abandoned Mines', color: '#FFAA00', skyColor: '#120A05', hash: '#chest', day: 2, time: '18:10', heldItem: 'torch' },
  { index: 4, id: 'snowy-peaks', name: 'The Frozen Frontier', color: '#70C5FF', skyColor: '#82B2DD', hash: '#crafting', day: 2, time: '20:15', heldItem: 'diamond-axe' },
  { index: 5, id: 'deep-dark', name: 'The Deep Dark', color: '#00E5FF', skyColor: '#03070C', hash: '#advancements', day: 3, time: '00:40', heldItem: 'soul-torch' },
  { index: 6, id: 'village-interior', name: "The Villager's Home", color: '#FFD700', skyColor: '#F0C080', hash: '#trades', day: 4, time: '13:00', heldItem: 'emerald' },
  { index: 7, id: 'lush-caves', name: 'The Lost Paradise', color: '#55FF55', skyColor: '#0A2014', hash: '#connect', day: 5, time: '16:45', heldItem: 'feather' },
  { index: 8, id: 'the-end', name: 'The Endless Void', color: '#D670D6', skyColor: '#080214', hash: '#end', day: 6, time: '21:50', heldItem: 'soul-torch' }
];

interface AppState {
  // Navigation & Scene
  currentScene: number;
  isTransitioning: boolean;
  frontCameraView: boolean;
  hoverTarget: string | null;

  // Player Stats
  xpLevel: number;
  xpProgress: number; // 0 to 1
  hearts: number;     // 10 max
  hunger: number;     // 10 max
  isHurt: boolean;

  // World Simulation
  inGameDay: number;
  inGameTime: string;

  // Settings & Audio
  isMuted: boolean;
  quality: QualityLevel;
  isOptionsModalOpen: boolean;
  setOptionsModalOpen: (val: boolean) => void;

  // Discovery & Rewards System
  discoveries: Record<string, boolean>;
  discoveredCount: number;
  totalDiscoveries: number;
  toastMessage: { title: string; desc: string; icon?: string } | null;

  // Sandbox & Inventory
  selectedHotbarSlot: number;
  inventoryOpen: boolean;
  worldResetKey: number;
  f3DebugMode: number; // 0=Off, 1=Albedo, 2=UV, 3=AtlasTile, 4=VertexColor, 5=AO, 6=LightLevel, 7=Normals, 8=Overdraw
  cycleF3Debug: () => void;

  // Actions
  setScene: (index: number) => void;
  nextScene: () => void;
  prevScene: () => void;
  setTransitioning: (val: boolean) => void;
  toggleFrontCamera: () => void;
  setHoverTarget: (target: string | null) => void;
  toggleMute: () => void;
  setQuality: (quality: QualityLevel) => void;
  addXp: (amount: number) => void;
  triggerHurt: () => void;
  popHeart: () => void;
  eatFood: () => void;
  fastForwardTime: (hours?: number) => void;
  respawnToStart: () => void;

  // Active Container GUI
  activeGui: 'none' | 'enchanting' | 'crafting' | 'anvil' | 'chest' | 'villager';
  setActiveGui: (gui: 'none' | 'enchanting' | 'crafting' | 'anvil' | 'chest' | 'villager') => void;

  // Title & Intro State
  isTitleScreen: boolean;
  setTitleScreen: (val: boolean) => void;
  showIntroGreeting: boolean;
  setShowIntroGreeting: (val: boolean) => void;

  // Sandbox Actions
  recordDiscovery: (id: string, category: string, label: string) => boolean;
  setSelectedHotbarSlot: (slot: number) => void;
  cycleHotbarSlot: (delta: number) => void;
  toggleInventory: () => void;
  setInventoryOpen: (open: boolean) => void;
  resetWorld: () => void;
  resetScene: () => void;
  setToastMessage: (toast: { title: string; desc: string; icon?: string } | null) => void;
}

const loadSavedDiscoveries = (): Record<string, boolean> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('cykf_discoveries');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const initialDiscoveries = loadSavedDiscoveries();

export const useStore = create<AppState>((set, get) => ({
  currentScene: 0,
  isTransitioning: false,
  frontCameraView: false,
  hoverTarget: null,

  xpLevel: 5,
  xpProgress: 0.45,
  hearts: 10,
  hunger: 10,
  isHurt: false,

  inGameDay: 1,
  inGameTime: '06:30',

  isMuted: typeof window !== 'undefined' ? localStorage.getItem('cykf_muted') === 'true' : false,
  quality: 'high',
  isOptionsModalOpen: false,
  setOptionsModalOpen: (val: boolean) => set({ isOptionsModalOpen: val }),

  discoveries: initialDiscoveries,
  discoveredCount: Object.keys(initialDiscoveries).length,
  totalDiscoveries: 100,
  toastMessage: null,

  selectedHotbarSlot: 0,
  inventoryOpen: false,
  worldResetKey: 0,
  f3DebugMode: 0,

  activeGui: 'none',
  setActiveGui: (gui: 'none' | 'enchanting' | 'crafting' | 'anvil' | 'chest' | 'villager') => set({ activeGui: gui }),

  isTitleScreen: typeof window !== 'undefined' ? (!window.location.hash || window.location.hash === '#village') && !new URLSearchParams(window.location.search).has('skipTitle') : true,
  setTitleScreen: (val: boolean) => set({ isTitleScreen: val }),
  showIntroGreeting: false,
  setShowIntroGreeting: (val: boolean) => set({ showIntroGreeting: val }),

  cycleF3Debug: () => {
    set((s) => ({ f3DebugMode: (s.f3DebugMode + 1) % 9 }));
  },

  setScene: (index: number) => {
    const clamped = Math.max(0, Math.min(8, index));
    const biome = BIOMES[clamped];
    if (typeof window !== 'undefined') {
      window.location.hash = biome.hash;
    }
    
    // Scale XP with scene progression (up to level 30 on The End)
    const newLevel = [5, 7, 9, 13, 17, 21, 26, 28, 30][clamped] || 5;

    sounds.setBiome(clamped);

    set({
      currentScene: clamped,
      isTitleScreen: clamped === 0 ? get().isTitleScreen : false,
      xpLevel: newLevel,
      xpProgress: 0.1 + (clamped / 8) * 0.9,
      inGameDay: biome.day,
      inGameTime: biome.time,
      isHurt: clamped === 5 // Deep Dark heart flutter
    });
  },

  nextScene: () => {
    const { currentScene, isTransitioning, setScene } = get();
    if (!isTransitioning && currentScene < 8) {
      setScene(currentScene + 1);
    }
  },

  prevScene: () => {
    const { currentScene, isTransitioning, setScene } = get();
    if (!isTransitioning && currentScene > 0) {
      setScene(currentScene - 1);
    }
  },

  setTransitioning: (val: boolean) => set({ isTransitioning: val }),
  toggleFrontCamera: () => set(state => ({ frontCameraView: !state.frontCameraView })),
  setHoverTarget: (target: string | null) => set({ hoverTarget: target }),

  toggleMute: () => set(state => {
    const next = !state.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('cykf_muted', String(next));
    }
    if (next) {
      if (!sounds.getState().isMasterMuted) sounds.toggleMasterMute();
    } else {
      if (sounds.getState().isMasterMuted) sounds.toggleMasterMute();
    }
    return { isMuted: next };
  }),

  setQuality: (quality: QualityLevel) => set({ quality }),

  addXp: (amount: number) => set(state => ({
    xpLevel: state.xpLevel + amount
  })),

  triggerHurt: () => {
    set({ isHurt: true, hearts: 9 });
    setTimeout(() => set({ isHurt: false, hearts: 10 }), 600);
  },

  popHeart: () => {
    set(state => {
      const nextHearts = state.hearts > 1 ? state.hearts - 1 : 10;
      return { hearts: nextHearts, isHurt: true };
    });
    setTimeout(() => set({ isHurt: false }), 400);
  },

  eatFood: () => {
    set(state => {
      const nextHunger = state.hunger > 1 ? state.hunger - 1 : 10;
      return { hunger: nextHunger };
    });
  },

  fastForwardTime: (hours: number = 2) => {
    set(state => {
      const parts = state.inGameTime.split(':');
      let hr = (parseInt(parts[0], 10) + hours) % 24;
      const min = parts[1] || '00';
      const formatted = `${hr.toString().padStart(2, '0')}:${min}`;
      return { inGameTime: formatted };
    });
  },

  respawnToStart: () => {
    const biome = BIOMES[0];
    if (typeof window !== 'undefined') {
      window.location.hash = biome.hash;
    }
    set({
      currentScene: 0,
      xpLevel: 5,
      xpProgress: 0.2,
      inGameDay: 1,
      inGameTime: '06:30',
      hearts: 10,
      hunger: 10,
      frontCameraView: false
    });
  },

  recordDiscovery: (id: string, category: string, label: string) => {
    const { discoveries, addXp, setToastMessage } = get();
    if (discoveries[id]) return false;

    const next = { ...discoveries, [id]: true };
    const nextCount = Object.keys(next).length;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cykf_discoveries', JSON.stringify(next));
      } catch {}
    }

    set({
      discoveries: next,
      discoveredCount: nextCount
    });

    // Award XP
    addXp(1);

    // Milestones check: 10, 25, 50, 100
    if (nextCount === 10 || nextCount === 25 || nextCount === 50 || nextCount === 100) {
      setToastMessage({
        title: `Advancement Made! (${nextCount}/100)`,
        desc: `Master Explorer: Discovered ${label}!`,
        icon: 'diamond'
      });
      setTimeout(() => {
        set({ toastMessage: null });
      }, 4500);
    }

    return true;
  },

  setSelectedHotbarSlot: (slot: number) => {
    set({ selectedHotbarSlot: Math.max(0, Math.min(8, slot)) });
  },

  cycleHotbarSlot: (delta: number) => {
    set(state => ({
      selectedHotbarSlot: (state.selectedHotbarSlot + delta + 9) % 9
    }));
  },

  toggleInventory: () => {
    set(state => ({ inventoryOpen: !state.inventoryOpen }));
  },

  setInventoryOpen: (open: boolean) => {
    set({ inventoryOpen: open });
  },

  resetWorld: () => {
    set(state => ({
      worldResetKey: state.worldResetKey + 1,
      toastMessage: {
        title: 'World Reset',
        desc: 'All blocks, props, and flora have been restored to natural state.',
        icon: 'compass'
      }
    }));
    setTimeout(() => {
      set({ toastMessage: null });
    }, 3000);
  },

  resetScene: () => {
    set(state => ({
      worldResetKey: state.worldResetKey + 1
    }));
  },

  setToastMessage: (toast) => {
    set({ toastMessage: toast });
  }
}));
