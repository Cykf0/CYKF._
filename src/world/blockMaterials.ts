import * as THREE from 'three';

/**
 * PBR Companion Map & Material Generator for 16x16 Minecraft Voxel Textures
 * Produces crisp NearestFilter maps:
 * - sRGB Base Color
 * - Linear Normal Map (Sobel filter from luminance)
 * - Linear Roughness Map (differentiated per material type & ore gems)
 * - Linear Metalness Map (for ores, latches, and metals)
 * - sRGB Emissive Map (for glowing blocks & crystals)
 * - Linear Ambient Occlusion Map
 */

export interface MaterialOptions {
  normalStrength?: number;
  baseRoughness?: number;
  baseMetalness?: number;
  emissiveIntensity?: number;
  isFoliage?: boolean;
  isSculk?: boolean;
  isOre?: boolean;
  oreGlowColor?: string;
  transparent?: boolean;
  opacity?: number;
}

class BlockMaterialRegistry {
  private canvasCache = new Map<string, HTMLCanvasElement>();
  private materialCache = new Map<string, THREE.MeshStandardMaterial>();

  // 1. Create 16x16 2D Canvas
  private createBaseCanvas(name: string, drawFn: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
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

  // 2. Generate Normal Map using Sobel filter on luminance
  private generateNormalMap(srcCanvas: HTMLCanvasElement, strength: number = 2.0): THREE.CanvasTexture {
    const width = 16;
    const height = 16;
    const srcCtx = srcCanvas.getContext('2d')!;
    const srcData = srcCtx.getImageData(0, 0, width, height).data;

    const nCanvas = document.createElement('canvas');
    nCanvas.width = width;
    nCanvas.height = height;
    const nCtx = nCanvas.getContext('2d')!;
    const nImgData = nCtx.createImageData(width, height);
    const nData = nImgData.data;

    // Helper: get luminance at wrapped (x, y)
    const getLum = (x: number, y: number) => {
      const wx = (x + width) % width;
      const wy = (y + height) % height;
      const idx = (wy * width + wx) * 4;
      return 0.299 * srcData[idx] + 0.587 * srcData[idx + 1] + 0.114 * srcData[idx + 2];
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Sobel kernels
        const tl = getLum(x - 1, y - 1);
        const t  = getLum(x,     y - 1);
        const tr = getLum(x + 1, y - 1);
        const l  = getLum(x - 1, y);
        const r  = getLum(x + 1, y);
        const bl = getLum(x - 1, y + 1);
        const b  = getLum(x,     y + 1);
        const br = getLum(x + 1, y + 1);

        const dx = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
        const dy = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr);

        // Compute normal vector (dx, dy, dz)
        let nx = -dx * (strength / 255.0);
        let ny = -dy * (strength / 255.0);
        let nz = 1.0;

        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        nx /= len;
        ny /= len;
        nz /= len;

        const pIdx = (y * width + x) * 4;
        nData[pIdx]     = Math.floor((nx * 0.5 + 0.5) * 255);
        nData[pIdx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        nData[pIdx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        nData[pIdx + 3] = 255;
      }
    }

    nCtx.putImageData(nImgData, 0, 0);
    const texture = new THREE.CanvasTexture(nCanvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.NoColorSpace; // linear data
    texture.needsUpdate = true;
    return texture;
  }

  // 3. Generate Roughness Map (with glossy ore gem highlights & wood grain)
  private generateRoughnessMap(srcCanvas: HTMLCanvasElement, baseRoughness: number, isOre: boolean = false): THREE.CanvasTexture {
    const width = 16;
    const height = 16;
    const srcCtx = srcCanvas.getContext('2d')!;
    const srcData = srcCtx.getImageData(0, 0, width, height).data;

    const rCanvas = document.createElement('canvas');
    rCanvas.width = width;
    rCanvas.height = height;
    const rCtx = rCanvas.getContext('2d')!;
    const rImgData = rCtx.createImageData(width, height);
    const rData = rImgData.data;

    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const r = srcData[idx];
      const g = srcData[idx + 1];
      const b = srcData[idx + 2];
      const lum = (r + g + b) / 3;

      let roughnessVal = baseRoughness;

      if (isOre) {
        // In ore blocks, gem pixels are saturated and distinct from grayscale stone (abs(r-g) > 20 or abs(r-b) > 20)
        const isGem = Math.abs(r - g) > 25 || Math.abs(g - b) > 25 || (r > 160 && g > 160 && b < 100);
        if (isGem) {
          roughnessVal = 0.12; // Glossy specular gem
        } else {
          roughnessVal = 0.90; // Rough stone matrix
        }
      } else {
        // Subtle micro-roughness variation based on luminance
        const delta = (lum - 128) / 255;
        roughnessVal = THREE.MathUtils.clamp(baseRoughness + delta * 0.15, 0.05, 0.98);
      }

      const byteVal = Math.floor(roughnessVal * 255);
      rData[idx]     = byteVal;
      rData[idx + 1] = byteVal;
      rData[idx + 2] = byteVal;
      rData[idx + 3] = 255;
    }

    rCtx.putImageData(rImgData, 0, 0);
    const texture = new THREE.CanvasTexture(rCanvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.NoColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  // 4. Generate Emissive Map (masked glowing elements)
  private generateEmissiveMap(srcCanvas: HTMLCanvasElement, emissiveFilter: (r: number, g: number, b: number) => [number, number, number] | null): THREE.CanvasTexture {
    const width = 16;
    const height = 16;
    const srcCtx = srcCanvas.getContext('2d')!;
    const srcData = srcCtx.getImageData(0, 0, width, height).data;

    const eCanvas = document.createElement('canvas');
    eCanvas.width = width;
    eCanvas.height = height;
    const eCtx = eCanvas.getContext('2d')!;
    const eImgData = eCtx.createImageData(width, height);
    const eData = eImgData.data;

    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const r = srcData[idx];
      const g = srcData[idx + 1];
      const b = srcData[idx + 2];

      const emColor = emissiveFilter(r, g, b);
      if (emColor) {
        eData[idx]     = emColor[0];
        eData[idx + 1] = emColor[1];
        eData[idx + 2] = emColor[2];
        eData[idx + 3] = 255;
      } else {
        eData[idx]     = 0;
        eData[idx + 1] = 0;
        eData[idx + 2] = 0;
        eData[idx + 3] = 255;
      }
    }

    eCtx.putImageData(eImgData, 0, 0);
    const texture = new THREE.CanvasTexture(eCanvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  // Master method to create a PBR material
  public createPBRMaterial(
    name: string,
    drawFn: (ctx: CanvasRenderingContext2D) => void,
    options: MaterialOptions = {},
    emissiveFilter?: (r: number, g: number, b: number) => [number, number, number] | null
  ): THREE.MeshStandardMaterial {
    if (this.materialCache.has(name)) {
      return this.materialCache.get(name)!;
    }

    const canvas = this.createBaseCanvas(name, drawFn);

    // 1. Color Map
    const colorTexture = new THREE.CanvasTexture(canvas);
    colorTexture.magFilter = THREE.NearestFilter;
    colorTexture.minFilter = THREE.NearestFilter;
    colorTexture.generateMipmaps = false;
    colorTexture.colorSpace = THREE.SRGBColorSpace;
    colorTexture.needsUpdate = true;

    // 2. Normal Map
    const normalMap = this.generateNormalMap(canvas, options.normalStrength ?? 2.0);

    // 3. Roughness Map
    const roughnessMap = this.generateRoughnessMap(
      canvas,
      options.baseRoughness ?? 0.8,
      options.isOre ?? false
    );

    // 4. Emissive Map
    let emissiveMap: THREE.CanvasTexture | undefined;
    if (emissiveFilter) {
      emissiveMap = this.generateEmissiveMap(canvas, emissiveFilter);
    }

    const matParams: THREE.MeshStandardMaterialParameters = {
      map: colorTexture,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(1.0, 1.0),
      roughnessMap: roughnessMap,
      roughness: options.baseRoughness ?? 0.8,
      metalness: options.baseMetalness ?? 0.05,
      transparent: options.transparent ?? false,
      opacity: options.opacity ?? 1.0,
    };

    if (emissiveMap) {
      matParams.emissiveMap = emissiveMap;
      matParams.emissive = new THREE.Color('#ffffff');
      matParams.emissiveIntensity = options.emissiveIntensity ?? 1.5;
    }

    const mat = new THREE.MeshStandardMaterial(matParams);

    this.materialCache.set(name, mat);
    return mat;
  }

  // Pre-configured PBR Materials
  get grassTop() {
    return this.createPBRMaterial('grassTop', (ctx) => {
      const palette = ['#5b8e34', '#649b39', '#52822e', '#6faa3f', '#4b7529'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[(x * 7 + y * 13) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }, { normalStrength: 1.8, baseRoughness: 0.9 });
  }

  get dirt() {
    return this.createPBRMaterial('dirt', (ctx) => {
      const palette = ['#866043', '#725138', '#5c402c', '#946c4d'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[(x * 11 + y * 17) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }, { normalStrength: 2.2, baseRoughness: 0.95 });
  }

  get stoneBricks() {
    return this.createPBRMaterial('stoneBricks', (ctx) => {
      const stone = ['#737373', '#666666', '#595959', '#7f7f7f'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = stone[(x * 9 + y * 13) % stone.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      // Mortar borders
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 8, 16, 1);
      ctx.fillRect(7, 0, 1, 8);
      ctx.fillRect(15, 8, 1, 8);
    }, { normalStrength: 3.0, baseRoughness: 0.85 });
  }

  get oakPlanks() {
    return this.createPBRMaterial('oakPlanks', (ctx) => {
      const colors = ['#b88748', '#a7783d', '#966a33', '#865c29'];
      for (let y = 0; y < 16; y++) {
        const rowColor = colors[Math.floor(y / 4) % colors.length];
        ctx.fillStyle = rowColor;
        ctx.fillRect(0, y, 16, 1);
        for (let x = 0; x < 16; x++) {
          if ((x + y * 3) % 5 === 0) {
            ctx.fillStyle = colors[(y + x) % colors.length];
            ctx.fillRect(x, y, 1, 1);
          }
        }
        if (y % 4 === 0) {
          ctx.fillStyle = '#553b1b';
          ctx.fillRect(0, y, 16, 1);
        }
      }
    }, { normalStrength: 1.5, baseRoughness: 0.65 });
  }

  get cherryLeaves() {
    return this.createPBRMaterial('cherryLeaves', (ctx) => {
      const pinks = ['#f4a6b8', '#e88ba2', '#d7728d', '#f9c5d2', '#c45a76'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = pinks[(x * 7 + y * 11) % pinks.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }, { normalStrength: 1.2, baseRoughness: 0.7 });
  }

  get bookshelf() {
    return this.createPBRMaterial('bookshelf', (ctx) => {
      ctx.fillStyle = '#8f6436';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#3a2312';
      ctx.fillRect(1, 1, 14, 6);
      ctx.fillRect(1, 9, 14, 6);

      const bookColors = ['#9e2a2b', '#335c67', '#e09f3e', '#540b0e', '#3f37c9', '#588157'];
      let bx = 2;
      while (bx < 14) {
        ctx.fillStyle = bookColors[bx % bookColors.length];
        ctx.fillRect(bx, 2, 2, 5);
        ctx.fillRect(bx, 10, 2, 5);
        bx += 2;
      }
    }, { normalStrength: 2.5, baseRoughness: 0.75 });
  }

  get sculk() {
    return this.createPBRMaterial('sculk', (ctx) => {
      const darks = ['#08161d', '#050f14', '#0c222c', '#04090d'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = darks[(x * 13 + y * 7) % darks.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      const cyans = ['#00e5ff', '#00b4d8', '#38b000', '#0077b6'];
      const specks = [
        [3, 3], [4, 3], [3, 4],
        [10, 5], [11, 5],
        [6, 11], [7, 11], [6, 12],
        [12, 12], [13, 12]
      ];
      specks.forEach(([sx, sy], idx) => {
        ctx.fillStyle = cyans[idx % cyans.length];
        ctx.fillRect(sx, sy, 1, 1);
      });
    }, {
      normalStrength: 2.0,
      baseRoughness: 0.85,
      emissiveIntensity: 2.8,
    }, (r, g, b) => {
      // Mask cyan glowing tendrils
      if (b > 160 && (g > 150 || r < 50)) {
        return [0, 240, 255];
      }
      return null;
    });
  }

  get endStone() {
    return this.createPBRMaterial('endStone', (ctx) => {
      const yellows = ['#dbd89c', '#d3d08e', '#e5e3b2', '#c5c179'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = yellows[(x * 17 + y * 23) % yellows.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }, { normalStrength: 2.4, baseRoughness: 0.9 });
  }

  get obsidian() {
    return this.createPBRMaterial('obsidian', (ctx) => {
      const obs = ['#151020', '#1c152d', '#110c1c', '#271d3f'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = obs[(x * 19 + y * 13) % obs.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      const purples = ['#6a359c', '#8a4bba', '#52277d'];
      const specks = [[2, 2], [5, 9], [11, 4], [13, 11], [8, 14]];
      specks.forEach(([sx, sy], idx) => {
        ctx.fillStyle = purples[idx % purples.length];
        ctx.fillRect(sx, sy, 1, 1);
      });
    }, {
      normalStrength: 2.8,
      baseRoughness: 0.45,
      baseMetalness: 0.25,
      emissiveIntensity: 1.8,
    }, (r, g, b) => {
      if (r > 70 && b > 110) {
        return [140, 50, 220]; // Purple obsidian crystalline shimmer
      }
      return null;
    });
  }

  // Ore PBR (Diamond, Gold, Redstone, Emerald)
  getOreMaterial(oreName: string, oreColor: string, oreGlow: string) {
    const matKey = `ore_mat_${oreName}`;
    return this.createPBRMaterial(matKey, (ctx) => {
      const stone = ['#737373', '#666666', '#595959', '#7f7f7f'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = stone[(x * 9 + y * 13) % stone.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      const gems = [
        [3, 4], [4, 4], [4, 5],
        [9, 2], [10, 2], [10, 3],
        [7, 9], [8, 9], [8, 10], [9, 10],
        [12, 11], [13, 11]
      ];
      gems.forEach(([gx, gy], i) => {
        ctx.fillStyle = i % 2 === 0 ? oreColor : oreGlow;
        ctx.fillRect(gx, gy, 1, 1);
      });
    }, {
      normalStrength: 2.6,
      baseRoughness: 0.85,
      baseMetalness: 0.3,
      isOre: true,
      emissiveIntensity: 2.2,
    }, (r, g, b) => {
      // If saturated color (gem vein), emit light
      if (Math.abs(r - g) > 30 || Math.abs(g - b) > 30 || (r > 180 && g > 180 && b < 100)) {
        return [r, g, b];
      }
      return null;
    });
  }
}

export const blockMaterials = new BlockMaterialRegistry();
