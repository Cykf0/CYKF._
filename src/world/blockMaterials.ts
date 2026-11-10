import * as THREE from 'three';

/**
 * Pure Vanilla Minecraft Block Material Registry
 * Enforces pure vanilla rendering:
 * - 16x16 pixel crisp NearestFilter textures
 * - No PBR sheen, no normal maps, no specular noise on base blocks
 * - Flat, matte unlit/ambient-lit appearance
 * - Cutout blocks use alphaTest 0.5 and depthWrite true
 * - Authentic Minecraft color palettes and pixel grids
 */

export interface MaterialOptions {
  isFoliage?: boolean;
  isCutout?: boolean;
  isSculk?: boolean;
  isOre?: boolean;
  emissive?: boolean;
  emissiveColor?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}

class VanillaMaterialRegistry {
  private canvasCache = new Map<string, HTMLCanvasElement>();
  private textureCache = new Map<string, THREE.CanvasTexture>();
  private materialCache = new Map<string, THREE.MeshStandardMaterial>();

  // 1. Create crisp 16x16 Canvas
  private createCanvas(name: string, drawFn: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
    if (this.canvasCache.has(name)) return this.canvasCache.get(name)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = false;

    drawFn(ctx);
    this.canvasCache.set(name, canvas);
    return canvas;
  }

  // 2. Create crisp NearestFilter CanvasTexture
  private createTexture(name: string, drawFn: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
    if (this.textureCache.has(name)) return this.textureCache.get(name)!;

    const canvas = this.createCanvas(name, drawFn);
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    this.textureCache.set(name, texture);
    return texture;
  }

  // 3. Create pure vanilla material
  private createVanillaMaterial(
    name: string,
    drawFn: (ctx: CanvasRenderingContext2D) => void,
    options: MaterialOptions = {}
  ): THREE.MeshStandardMaterial {
    if (this.materialCache.has(name)) return this.materialCache.get(name)!;

    const map = this.createTexture(name, drawFn);

    const mat = new THREE.MeshStandardMaterial({
      map,
      roughness: 1.0,   // Pure matte, no plastic shine
      metalness: 0.0,   // No metallic reflection
      transparent: options.transparent || options.isCutout || false,
      opacity: options.opacity ?? 1.0,
      alphaTest: options.isCutout ? 0.5 : 0.0,
      depthWrite: true, // Cutout blocks keep depthWrite true
    });

    if (options.emissive && options.emissiveColor) {
      mat.emissive = new THREE.Color(options.emissiveColor);
      mat.emissiveMap = map;
      mat.emissiveIntensity = options.emissiveIntensity ?? 1.0;
    }

    this.materialCache.set(name, mat);
    return mat;
  }

  // Deterministic pixel hash for vanilla noise
  private pHash(x: number, y: number, seed: number = 0): number {
    let h = (x * 374761393 + y * 668265263 + seed * 982451653) ^ 0x5bf03635;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  }

  // ---------------------------------------------------------------------------
  // Vanilla Block Materials
  // ---------------------------------------------------------------------------

  // 1. Grass Top
  get grassTop() {
    return this.createVanillaMaterial('grassTop', (ctx) => {
      const palette = ['#79c05a', '#6db14e', '#85cc64', '#62a243', '#8ed66c'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[this.pHash(x, y, 1) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 2. Dirt
  get dirt() {
    return this.createVanillaMaterial('dirt', (ctx) => {
      const palette = ['#866043', '#725138', '#5c402c', '#946c4d', '#684832'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[this.pHash(x, y, 2) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 3. Grass Side (with hanging fringe)
  get grassSide() {
    return this.createVanillaMaterial('grassSide', (ctx) => {
      const dirtPalette = ['#866043', '#725138', '#5c402c', '#946c4d'];
      const grassPalette = ['#79c05a', '#6db14e', '#85cc64'];
      const fringeDepths = [3, 4, 3, 5, 4, 3, 4, 5, 3, 4, 3, 5, 4, 3, 4, 3];

      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if (y < fringeDepths[x]) {
            ctx.fillStyle = grassPalette[this.pHash(x, y, 3) % grassPalette.length];
          } else {
            ctx.fillStyle = dirtPalette[this.pHash(x, y, 4) % dirtPalette.length];
          }
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 4. Oak Planks
  get oakPlanks() {
    return this.createVanillaMaterial('oakPlanks', (ctx) => {
      const wood = ['#b88748', '#a7783d', '#966a33', '#865c29'];
      for (let y = 0; y < 16; y++) {
        const rowColor = wood[Math.floor(y / 4) % wood.length];
        ctx.fillStyle = rowColor;
        ctx.fillRect(0, y, 16, 1);

        for (let x = 0; x < 16; x++) {
          if ((x + y * 3) % 5 === 0) {
            ctx.fillStyle = wood[(y + x) % wood.length];
            ctx.fillRect(x, y, 1, 1);
          }
        }
        // Horizontal plank seams
        if (y % 4 === 0) {
          ctx.fillStyle = '#553b1b';
          ctx.fillRect(0, y, 16, 1);
        }
      }
    });
  }

  // 5. Cherry Planks
  get cherryPlanks() {
    return this.createVanillaMaterial('cherryPlanks', (ctx) => {
      const pinks = ['#e4a0b7', '#d98ea7', '#cb7e97', '#b96c86'];
      for (let y = 0; y < 16; y++) {
        const rowColor = pinks[Math.floor(y / 4) % pinks.length];
        ctx.fillStyle = rowColor;
        ctx.fillRect(0, y, 16, 1);
        for (let x = 0; x < 16; x++) {
          if ((x + y * 2) % 4 === 0) {
            ctx.fillStyle = pinks[(x + y) % pinks.length];
            ctx.fillRect(x, y, 1, 1);
          }
        }
        if (y % 4 === 0) {
          ctx.fillStyle = '#a15671';
          ctx.fillRect(0, y, 16, 1);
        }
      }
    });
  }

  // 6. Stone
  get stone() {
    return this.createVanillaMaterial('stone', (ctx) => {
      const palette = ['#616161', '#6d6d6d', '#767676', '#808080', '#595959', '#8a8a8a'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[this.pHash(x, y, 5) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 7. Cobblestone
  get cobblestone() {
    return this.createVanillaMaterial('cobblestone', (ctx) => {
      const palette = ['#474747', '#565656', '#666666', '#7a7a7a', '#8a8a8a'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const isGrout = (x % 4 === 0 && y % 3 === 0) || (x === 0 || y === 0 || x === 15 || y === 15 && (x + y) % 3 === 0);
          ctx.fillStyle = isGrout ? '#343434' : palette[this.pHash(x, y, 6) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 8. Stone Bricks
  get stoneBricks() {
    return this.createVanillaMaterial('stoneBricks', (ctx) => {
      const palette = ['#5b5b5b', '#6a6a6a', '#787878', '#868686'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const isMortar = y % 4 === 0 || (y < 4 && x === 8) || (y >= 4 && y < 8 && (x === 0 || x === 15)) || (y >= 8 && y < 12 && x === 8) || (y >= 12 && (x === 0 || x === 15));
          ctx.fillStyle = isMortar ? '#3c3c3c' : palette[this.pHash(x, y, 7) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 9. Mossy Stone Bricks
  get mossyStoneBricks() {
    return this.createVanillaMaterial('mossyStoneBricks', (ctx) => {
      const stone = ['#5b5b5b', '#6a6a6a', '#787878'];
      const moss = ['#5d7d3d', '#48682e', '#6e9146'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const isMoss = this.pHash(x, y, 8) % 3 === 0;
          ctx.fillStyle = isMoss ? moss[this.pHash(x, y, 9) % moss.length] : stone[this.pHash(x, y, 10) % stone.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 10. Cracked Stone Bricks
  get crackedStoneBricks() {
    return this.createVanillaMaterial('crackedStoneBricks', (ctx) => {
      const palette = ['#5b5b5b', '#6a6a6a', '#787878'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const isCrack = (x === y && x > 3 && x < 12) || (x === 15 - y && y > 6 && y < 11);
          ctx.fillStyle = isCrack ? '#222222' : palette[this.pHash(x, y, 11) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 11. Oak Log
  get oakLog() {
    return this.createVanillaMaterial('oakLog', (ctx) => {
      const bark = ['#46351d', '#584425', '#675230', '#3c2c16'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const groove = (x % 4 === 0) ? '#2d210f' : bark[this.pHash(x, y, 12) % bark.length];
          ctx.fillStyle = groove;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 12. Oak Leaves (Vanilla Cutout)
  get oakLeaves() {
    return this.createVanillaMaterial('oakLeaves', (ctx) => {
      const greens = ['#3b6e22', '#2d581a', '#4a832e', '#599a37'];
      ctx.clearRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const h = this.pHash(x, y, 13);
          if (h % 5 !== 0) { // 20% cutout holes like vanilla fancy graphics
            ctx.fillStyle = greens[h % greens.length];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }, { isCutout: true, isFoliage: true });
  }

  // 13. Cherry Leaves (Vanilla Pink Blossom Cutout)
  get cherryLeaves() {
    return this.createVanillaMaterial('cherryLeaves', (ctx) => {
      const pinks = ['#f8b6cc', '#e98fad', '#fdd8e6', '#d67595', '#ffffff'];
      ctx.clearRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const h = this.pHash(x, y, 14);
          if (h % 5 !== 0) {
            ctx.fillStyle = pinks[h % pinks.length];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }, { isCutout: true, isFoliage: true });
  }

  // 14. Deepslate
  get deepslate() {
    return this.createVanillaMaterial('deepslate', (ctx) => {
      const palette = ['#303036', '#25252b', '#3d3d44', '#1f1f24'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[this.pHash(x, y, 15) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 15. Deepslate Bricks
  get deepslateBricks() {
    return this.createVanillaMaterial('deepslateBricks', (ctx) => {
      const palette = ['#28282e', '#36363e', '#1e1e23', '#40404a'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const isMortar = y % 4 === 0 || (y < 4 && x === 8) || (y >= 4 && y < 8 && x === 0);
          ctx.fillStyle = isMortar ? '#141418' : palette[this.pHash(x, y, 16) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 16. Bedrock
  get bedrock() {
    return this.createVanillaMaterial('bedrock', (ctx) => {
      const palette = ['#161616', '#262626', '#353535', '#0d0d0d'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[this.pHash(x, y, 17) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 17. Sculk (Alien Cyan Emissive Veins)
  get sculk() {
    return this.createVanillaMaterial('sculk', (ctx) => {
      const base = ['#03181e', '#062832', '#0a3d4c', '#041d24'];
      const souls = ['#00ffbf', '#00b8a2', '#008a79'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const isSoul = (x === 4 && y === 5) || (x === 11 && y === 12) || (x === 8 && y === 2) || (x === 13 && y === 4);
          ctx.fillStyle = isSoul ? souls[this.pHash(x, y, 18) % souls.length] : base[this.pHash(x, y, 19) % base.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }, { emissive: true, emissiveColor: '#00ffbf', emissiveIntensity: 0.6 });
  }

  // 18. End Stone
  get endStone() {
    return this.createVanillaMaterial('endStone', (ctx) => {
      const palette = ['#dcdba3', '#eae8b8', '#c5c48b', '#b0af76'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[this.pHash(x, y, 20) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 19. End Stone Bricks
  get endStoneBricks() {
    return this.createVanillaMaterial('endStoneBricks', (ctx) => {
      const palette = ['#dcdba3', '#eae8b8', '#c5c48b'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const isMortar = y % 4 === 0 || (y < 4 && x === 8) || (y >= 4 && y < 8 && x === 0);
          ctx.fillStyle = isMortar ? '#9c9b68' : palette[this.pHash(x, y, 21) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 20. Glowstone (Emissive Amber)
  get glowstone() {
    return this.createVanillaMaterial('glowstone', (ctx) => {
      const ambers = ['#b8883b', '#d9a94e', '#f4cc6d', '#ffea8a'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = ambers[this.pHash(x, y, 22) % ambers.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }, { emissive: true, emissiveColor: '#ffea8a', emissiveIntensity: 0.8 });
  }

  // 21. Sea Lantern (Emissive Teal)
  get seaLantern() {
    return this.createVanillaMaterial('seaLantern', (ctx) => {
      const teals = ['#b4d7d0', '#c8eae3', '#e0fbf6', '#87b5ad'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = teals[this.pHash(x, y, 23) % teals.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }, { emissive: true, emissiveColor: '#e0fbf6', emissiveIntensity: 0.8 });
  }

  // 22. Snow
  get snow() {
    return this.createVanillaMaterial('snow', (ctx) => {
      const whites = ['#f9feff', '#edf4f5', '#dbe6e8', '#c8d8dc'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = whites[this.pHash(x, y, 24) % whites.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 23. Ice
  get ice() {
    return this.createVanillaMaterial('ice', (ctx) => {
      const blues = ['#8ab4f8', '#a1c4fc', '#6f9ef0', '#b9d4fd'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = blues[this.pHash(x, y, 25) % blues.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }, { transparent: true, opacity: 0.85 });
  }

  // 24. Bookshelf
  get bookshelf() {
    return this.createVanillaMaterial('bookshelf', (ctx) => {
      const wood = ['#b88748', '#a7783d', '#865c29'];
      const books = ['#9e2a2b', '#2b5f8f', '#3f7d44', '#8f5b2b', '#7a2b8f', '#d4af37'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if (y < 2 || y > 13 || y === 7 || y === 8) {
            ctx.fillStyle = wood[this.pHash(x, y, 26) % wood.length];
          } else {
            const bSlot = Math.floor(x / 2.5);
            ctx.fillStyle = (x % 3 === 0) ? '#1e140d' : books[bSlot % books.length];
          }
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 25. Crafting Table Top
  get craftingTableTop() {
    return this.createVanillaMaterial('craftingTableTop', (ctx) => {
      const wood = ['#b88748', '#a7783d', '#966a33'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if ((x === 5 || x === 10 || y === 5 || y === 10) && x > 1 && x < 14 && y > 1 && y < 14) {
            ctx.fillStyle = '#422d14';
          } else if (x === 0 || x === 15 || y === 0 || y === 15) {
            ctx.fillStyle = '#6b4b24';
          } else {
            ctx.fillStyle = wood[this.pHash(x, y, 27) % wood.length];
          }
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 26. Crafting Table Front & Side
  get craftingTableFront() {
    return this.createVanillaMaterial('craftingTableFront', (ctx) => {
      const wood = ['#b88748', '#a7783d', '#966a33'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if (x >= 4 && x <= 7 && y >= 4 && y <= 11) {
            ctx.fillStyle = y <= 6 ? '#c0c0c0' : '#553b1b'; // Saw tool
          } else if (x === 0 || x === 15 || y === 0 || y === 15) {
            ctx.fillStyle = '#553b1b';
          } else {
            ctx.fillStyle = wood[this.pHash(x, y, 28) % wood.length];
          }
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  get craftingTableSide() {
    return this.craftingTableFront;
  }

  // 27. Obsidian
  get obsidian() {
    return this.createVanillaMaterial('obsidian', (ctx) => {
      const obs = ['#151020', '#1c152d', '#110c1c', '#271d3f'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = obs[this.pHash(x, y, 29) % obs.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      // Specks of purple crystal
      const purples = ['#6a359c', '#8a4bba', '#52277d'];
      const specks = [[2, 2], [5, 9], [11, 4], [13, 11], [8, 14]];
      specks.forEach(([sx, sy], idx) => {
        ctx.fillStyle = purples[idx % purples.length];
        ctx.fillRect(sx, sy, 1, 1);
      });
    });
  }

  // 28. Ores (Diamond, Gold, Iron, Redstone, Emerald, Coal)
  getOreMaterial(oreName: string, oreColor: string, _oreGlow?: string) {
    const matKey = `vanilla_ore_${oreName}`;
    return this.createVanillaMaterial(matKey, (ctx) => {
      const stone = ['#616161', '#6d6d6d', '#767676', '#808080'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = stone[this.pHash(x, y, 30) % stone.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Classic ore vein layout
      const veins = [
        [3, 4], [4, 4], [4, 5],
        [9, 2], [10, 2], [10, 3],
        [7, 9], [8, 9], [8, 10], [9, 10],
        [12, 11], [13, 11],
        [2, 12], [3, 12]
      ];
      veins.forEach(([gx, gy]) => {
        ctx.fillStyle = oreColor;
        ctx.fillRect(gx, gy, 1, 1);
      });
    }, {
      isOre: true,
      emissive: oreName === 'redstone' || oreName === 'diamond',
      emissiveColor: oreColor,
      emissiveIntensity: 0.3
    });
  }
}

export const blockMaterials = new VanillaMaterialRegistry();
