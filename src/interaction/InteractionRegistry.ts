import * as THREE from 'three';
import { InteractionCategory, InteractableConfig, MiningState, FlyingDrop, XpOrbData } from './types';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

/**
 * Universal Interaction Registry for Cykf._
 * Enforces the Golden Rule: Every visible object in every scene is interactive.
 */
class InteractionRegistry {
  private registry = new Map<string, { object: THREE.Object3D; config: InteractableConfig }>();
  private activeMining: MiningState | null = null;
  private miningListeners = new Set<(state: MiningState | null) => void>();
  private dropsListeners = new Set<(drops: FlyingDrop[]) => void>();
  private xpOrbsListeners = new Set<(orbs: XpOrbData[]) => void>();
  private activeDrops: FlyingDrop[] = [];
  private activeXpOrbs: XpOrbData[] = [];
  private warnedObjects = new Set<string>();
  private initializedMonkeyPatch = false;

  constructor() {
    this.installMonkeyPatch();
  }

  /**
   * Banning Direct Scene.add():
   * Monkey-patches THREE.Scene.prototype.add to intercept and ensure all visible meshes
   * are registered with an interactable category.
   */
  public installMonkeyPatch() {
    if (this.initializedMonkeyPatch || typeof window === 'undefined') return;
    this.initializedMonkeyPatch = true;

    const originalObject3DAdd = THREE.Object3D.prototype.add;
    const originalSceneAdd = THREE.Scene.prototype.add;
    const self = this;

    THREE.Object3D.prototype.add = function (...objects: THREE.Object3D[]) {
      for (const obj of objects) {
        self.inspectAndAutoRegister(obj);
      }
      return originalObject3DAdd.apply(this, objects);
    };

    THREE.Scene.prototype.add = function (...objects: THREE.Object3D[]) {
      for (const obj of objects) {
        self.inspectAndAutoRegister(obj);
      }
      return originalSceneAdd.apply(this, objects);
    };
  }

  public inspectAndAutoRegister(root: THREE.Object3D) {
    root.traverse((child) => {
      // Check if child is a visible mesh, points, or lines
      if ((child as any).isMesh || (child as any).isPoints || (child as any).isLine) {
        if (!child.userData.interactable) {
          const name = child.name || `object_${child.id}`;
          if (!this.warnedObjects.has(child.uuid)) {
            this.warnedObjects.add(child.uuid);
            console.warn(
              `[InteractionRegistry] BANNED: Visible mesh added without registration: "${name}". Auto-registering fallback interactable.`
            );
          }

          // Infer fallback category based on name or geometry
          let inferredCategory: InteractionCategory = 'BLOCK';
          const lower = name.toLowerCase();
          if (lower.includes('grass') || lower.includes('leaf') || lower.includes('plant') || lower.includes('flower') || lower.includes('vine')) {
            inferredCategory = 'PLANT';
          } else if (lower.includes('sheep') || lower.includes('mob') || lower.includes('animal') || lower.includes('axolotl') || lower.includes('enderman')) {
            inferredCategory = 'MOB';
          } else if (lower.includes('chest') || lower.includes('door') || lower.includes('cart') || lower.includes('furnace') || lower.includes('table')) {
            inferredCategory = 'PROP';
          } else if (lower.includes('light') || lower.includes('lantern') || lower.includes('torch') || lower.includes('fire') || lower.includes('glow')) {
            inferredCategory = 'LIGHT_SOURCE';
          } else if (lower.includes('water') || lower.includes('pond') || lower.includes('lava')) {
            inferredCategory = 'LIQUID';
          } else if (lower.includes('cloud') || lower.includes('sun') || lower.includes('moon') || lower.includes('star') || lower.includes('sky')) {
            inferredCategory = 'SKY';
          } else if (lower.includes('mote') || lower.includes('particle') || lower.includes('petal') || lower.includes('snow')) {
            inferredCategory = 'PARTICLE';
          } else if (lower.includes('player') || lower.includes('skin') || lower.includes('head') || lower.includes('arm')) {
            inferredCategory = 'PLAYER';
          }

          const fallbackConfig: InteractableConfig = {
            id: `auto_${child.uuid}`,
            name: name || 'Minecraft Voxel',
            category: inferredCategory,
            materialType: 'stone',
            hardness: 500,
          };

          this.register(child, fallbackConfig);
        }
      }
    });
  }

  /**
   * Register an object with full category configuration
   */
  public register(object: THREE.Object3D, config: InteractableConfig) {
    const fullConfig = this.applyCategoryDefaults(config);
    object.userData.interactable = fullConfig;
    this.registry.set(object.uuid, { object, config: fullConfig });
    return fullConfig;
  }

  public unregister(object: THREE.Object3D) {
    this.registry.delete(object.uuid);
    if (object.userData) {
      delete object.userData.interactable;
    }
  }

  public get(object: THREE.Object3D): InteractableConfig | null {
    if (object.userData?.interactable) {
      return object.userData.interactable as InteractableConfig;
    }
    const found = this.registry.get(object.uuid);
    return found ? found.config : null;
  }

  public getAll(): { object: THREE.Object3D; config: InteractableConfig }[] {
    return Array.from(this.registry.values());
  }

  /**
   * Default category behavior per Section 2
   */
  private applyCategoryDefaults(config: InteractableConfig): InteractableConfig {
    const base = { ...config };

    switch (config.category) {
      case 'BLOCK':
        base.materialType = base.materialType || 'stone';
        base.hardness = base.hardness || 450;
        base.wobbleOnClick = base.wobbleOnClick ?? true;
        if (!base.onHover) {
          base.onHover = () => {
            useStore.getState().setHoverTarget(base.name);
          };
        }
        if (!base.onClick) {
          base.onClick = () => {
            sounds.playBlockHit(base.materialType);
            useStore.getState().recordDiscovery(base.id, 'BLOCK', base.name);
          };
        }
        break;

      case 'PLANT':
        base.materialType = 'grass';
        if (!base.onHover) {
          base.onHover = () => {
            useStore.getState().setHoverTarget(base.name);
          };
        }
        if (!base.onClick) {
          base.onClick = () => {
            sounds.playBlockHit('grass');
            useStore.getState().recordDiscovery(base.id, 'PLANT', base.name);
          };
        }
        break;

      case 'MOB':
        if (!base.onHover) {
          base.onHover = () => {
            useStore.getState().setHoverTarget(base.name);
          };
        }
        if (!base.onClick) {
          base.onClick = () => {
            const lower = base.name.toLowerCase();
            if (lower.includes('sheep')) sounds.playSheepBaa();
            else if (lower.includes('enderman')) sounds.playEndermanVwoop();
            else if (lower.includes('villager')) sounds.playVillagerHmm();
            else if (lower.includes('cow')) sounds.playCow();
            else if (lower.includes('zombie')) sounds.playZombie();
            else if (lower.includes('creeper')) sounds.playCreeperFuse();
            else sounds.playClick();

            useStore.getState().recordDiscovery(base.id, 'MOB', base.name);
          };
        }
        break;

      case 'PROP':
        if (!base.onHover) {
          base.onHover = () => {
            useStore.getState().setHoverTarget(base.name);
          };
        }
        if (!base.onClick) {
          base.onClick = () => {
            const lower = base.name.toLowerCase();
            if (lower.includes('chest')) sounds.playChestOpen();
            else if (lower.includes('bell')) sounds.playBellRing();
            else if (lower.includes('anvil')) sounds.playAnvilUse();
            else if (lower.includes('door')) sounds.playDoorOpen();
            else if (lower.includes('crafting')) sounds.playCraft();
            else if (lower.includes('furnace')) sounds.playFire();
            else if (lower.includes('enchant')) sounds.playEnchantChime();
            else if (lower.includes('minecart') || lower.includes('rail')) sounds.playMinecart();
            else if (lower.includes('button') || lower.includes('lever') || lower.includes('switch') || lower.includes('plate')) sounds.playButton();
            else if (lower.includes('portal') || lower.includes('crystal')) sounds.playPortalWarp();
            else sounds.playClick();

            useStore.getState().recordDiscovery(base.id, 'PROP', base.name);
          };
        }
        break;

      case 'LIGHT_SOURCE':
        if (!base.onHover) {
          base.onHover = () => {
            useStore.getState().setHoverTarget(base.name);
          };
        }
        if (!base.onClick) {
          base.onClick = () => {
            const lower = base.name.toLowerCase();
            if (lower.includes('fire') || lower.includes('torch') || lower.includes('candle') || lower.includes('lantern')) {
              sounds.playFire();
            } else {
              sounds.playClick();
            }
            useStore.getState().recordDiscovery(base.id, 'LIGHT_SOURCE', base.name);
          };
        }
        break;

      case 'ITEM':
        if (!base.onHover) {
          base.onHover = () => {
            useStore.getState().setHoverTarget(base.name);
          };
        }
        if (!base.onClick) {
          base.onClick = () => {
            sounds.playItemPickup();
            useStore.getState().recordDiscovery(base.id, 'ITEM', base.name);
          };
        }
        break;

      case 'LIQUID':
        if (!base.onHover) {
          base.onHover = () => {
            useStore.getState().setHoverTarget(base.name);
          };
        }
        if (!base.onClick) {
          base.onClick = () => {
            if (base.name.toLowerCase().includes('lava')) sounds.playLava();
            else sounds.playWaterSplash();
            useStore.getState().recordDiscovery(base.id, 'LIQUID', base.name);
          };
        }
        break;

      case 'PARTICLE':
        if (!base.onClick) {
          base.onClick = () => {
            sounds.playParticleBurst();
            useStore.getState().recordDiscovery(base.id, 'PARTICLE', base.name);
          };
        }
        break;

      case 'STRUCTURE':
        if (!base.onHover) {
          base.onHover = () => {
            useStore.getState().setHoverTarget(base.name);
          };
        }
        if (!base.onClick) {
          base.onClick = () => {
            sounds.playBlockHit('stone');
            useStore.getState().recordDiscovery(base.id, 'STRUCTURE', base.name);
          };
        }
        break;

      case 'SKY':
        if (!base.onHover) {
          base.onHover = () => {
            useStore.getState().setHoverTarget('Sky & Distant Horizon');
          };
        }
        if (!base.onClick) {
          base.onClick = () => {
            sounds.playWobble(520);
            useStore.getState().recordDiscovery(base.id, 'SKY', 'Sky Cloud Puff');
          };
        }
        break;

      case 'PLAYER':
        if (!base.onHover) {
          base.onHover = () => {
            useStore.getState().setHoverTarget(`Player: ${base.name}`);
          };
        }
        if (!base.onClick) {
          base.onClick = () => {
            sounds.playWobble(440);
            useStore.getState().recordDiscovery(base.id, 'PLAYER', `Player ${base.name}`);
          };
        }
        break;

      default:
        break;
    }

    return base;
  }

  // Mining crack & hold system
  public startMining(object: THREE.Object3D, position: THREE.Vector3, config: InteractableConfig) {
    const isPickaxe = useStore.getState().selectedHotbarSlot === 0; // Slot 1 diamond pickaxe
    const baseDuration = config.hardness || 450;
    const duration = isPickaxe ? Math.max(120, baseDuration * 0.35) : baseDuration;

    this.activeMining = {
      objectId: config.id,
      position: position.clone(),
      stage: 0,
      progress: 0,
      startTime: Date.now(),
      duration,
      blockConfig: config,
    };
    this.notifyMiningListeners();
    sounds.playBlockHit(config.materialType || 'stone');
  }

  public updateMiningProgress(progress: number) {
    if (!this.activeMining) return;
    this.activeMining.progress = Math.min(1, Math.max(0, progress));
    this.activeMining.stage = Math.min(9, Math.floor(progress * 10));
    this.notifyMiningListeners();
  }

  public completeMining(object: THREE.Object3D) {
    if (!this.activeMining) return;
    const config = this.activeMining.blockConfig;
    const pos = this.activeMining.position;

    // Break sound
    sounds.playBlockBreak(config.materialType || 'stone');

    // Spawn flying drop
    this.spawnDrop(config.dropItem || 'stone', [pos.x, pos.y, pos.z]);

    // Spawn XP orb
    this.spawnXpOrb([pos.x, pos.y, pos.z]);

    // Record discovery
    useStore.getState().recordDiscovery(config.id, 'BLOCK', `Mined ${config.name}`);

    // Call onBreak if defined
    if (config.onBreak) {
      config.onBreak();
    } else {
      // Temporarily hide mesh and auto-respawn in 20s
      object.visible = false;
      setTimeout(() => {
        object.visible = true;
      }, 20000);
    }

    this.activeMining = null;
    this.notifyMiningListeners();
  }

  public cancelMining() {
    this.activeMining = null;
    this.notifyMiningListeners();
  }

  public getMiningState() {
    return this.activeMining;
  }

  public subscribeMining(listener: (state: MiningState | null) => void) {
    this.miningListeners.add(listener);
    return () => {
      this.miningListeners.delete(listener);
    };
  }

  private notifyMiningListeners() {
    this.miningListeners.forEach((l) => l(this.activeMining));
  }

  // Drops & XP Orbs
  public spawnDrop(itemType: string, position: [number, number, number]) {
    const drop: FlyingDrop = {
      id: `drop_${Date.now()}_${Math.random()}`,
      itemType,
      startPos: position,
      startTime: Date.now(),
    };
    this.activeDrops = [...this.activeDrops, drop];
    this.dropsListeners.forEach((l) => l(this.activeDrops));

    setTimeout(() => {
      this.activeDrops = this.activeDrops.filter((d) => d.id !== drop.id);
      this.dropsListeners.forEach((l) => l(this.activeDrops));
      sounds.playItemPop();
    }, 1200);
  }

  public spawnXpOrb(position: [number, number, number]) {
    const orb: XpOrbData = {
      id: `xp_${Date.now()}_${Math.random()}`,
      startPos: position,
      startTime: Date.now(),
    };
    this.activeXpOrbs = [...this.activeXpOrbs, orb];
    this.xpOrbsListeners.forEach((l) => l(this.activeXpOrbs));

    setTimeout(() => {
      this.activeXpOrbs = this.activeXpOrbs.filter((o) => o.id !== orb.id);
      this.xpOrbsListeners.forEach((l) => l(this.activeXpOrbs));
      sounds.playXpOrb();
      useStore.getState().addXp(1);
    }, 900);
  }

  public subscribeDrops(listener: (drops: FlyingDrop[]) => void) {
    this.dropsListeners.add(listener);
    return () => {
      this.dropsListeners.delete(listener);
    };
  }

  public subscribeXpOrbs(listener: (orbs: XpOrbData[]) => void) {
    this.xpOrbsListeners.add(listener);
    return () => {
      this.xpOrbsListeners.delete(listener);
    };
  }
}

export const interactionRegistry = new InteractionRegistry();
