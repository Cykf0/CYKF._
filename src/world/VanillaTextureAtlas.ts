import * as THREE from 'three';

/**
 * Vanilla Texture Atlas & Material System
 * Enforces pure Minecraft rendering rules:
 * - NearestFilter for min/mag
 * - generateMipmaps: false
 * - anisotropy: 1
 * - sRGB color space
 * - Directional face shading (Top 1.0, N/S 0.8, E/W 0.6, Bottom 0.5)
 * - Zero bleeding with half-texel insets
 * - No PBR sheen or specular gloss
 */

export interface TileUV {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

export interface AtlasData {
  atlasWidth: number;
  atlasHeight: number;
  tiles: Record<string, {
    x: number;
    y: number;
    width: number;
    height: number;
    u0: number;
    v0: number;
    u1: number;
    v1: number;
  }>;
}

class VanillaAtlasManager {
  private static instance: VanillaAtlasManager;
  private atlasTexture: THREE.Texture | null = null;
  private atlasData: AtlasData | null = null;
  private isLoaded = false;
  private loadCallbacks: Array<() => void> = [];

  private solidMaterial: THREE.MeshBasicMaterial | null = null;
  private cutoutMaterial: THREE.MeshBasicMaterial | null = null;
  private fallbackTextureCache = new Map<string, THREE.CanvasTexture>();

  private constructor() {
    this.init();
  }

  public static getInstance(): VanillaAtlasManager {
    if (!VanillaAtlasManager.instance) {
      VanillaAtlasManager.instance = new VanillaAtlasManager();
    }
    return VanillaAtlasManager.instance;
  }

  private init() {
    // 1. Load atlas texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/atlas.png',
      (texture) => {
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.flipY = false;
        texture.needsUpdate = true;
        this.atlasTexture = texture;

        this.checkReady();
      },
      undefined,
      (err) => {
        console.warn('Could not load /atlas.png, using procedural canvas fallbacks', err);
      }
    );

    // 2. Load atlas JSON
    fetch('/atlas.json')
      .then((res) => res.json())
      .then((data: AtlasData) => {
        this.atlasData = data;
        this.checkReady();
      })
      .catch((err) => {
        console.warn('Could not load /atlas.json', err);
      });
  }

  private checkReady() {
    if (this.atlasTexture && this.atlasData) {
      this.isLoaded = true;
      this.loadCallbacks.forEach((cb) => cb());
      this.loadCallbacks = [];
    }
  }

  public onReady(cb: () => void) {
    if (this.isLoaded) {
      cb();
    } else {
      this.loadCallbacks.push(cb);
    }
  }

  public getTexture(): THREE.Texture | null {
    return this.atlasTexture;
  }

  public getTileUV(name: string): TileUV {
    if (this.atlasData && this.atlasData.tiles[name]) {
      const t = this.atlasData.tiles[name];
      return { u0: t.u0, v0: t.v0, u1: t.u1, v1: t.v1 };
    }
    // Default UV fallback
    return { u0: 0.005, v0: 0.965, u1: 0.034, v1: 0.995 };
  }

  public getSolidMaterial(): THREE.MeshBasicMaterial {
    if (!this.solidMaterial) {
      this.solidMaterial = new THREE.MeshBasicMaterial({
        map: this.atlasTexture,
        vertexColors: true,
        reflectivity: 0,
      });
    } else if (!this.solidMaterial.map && this.atlasTexture) {
      this.solidMaterial.map = this.atlasTexture;
      this.solidMaterial.needsUpdate = true;
    }
    return this.solidMaterial;
  }

  public getCutoutMaterial(): THREE.MeshBasicMaterial {
    if (!this.cutoutMaterial) {
      this.cutoutMaterial = new THREE.MeshBasicMaterial({
        map: this.atlasTexture,
        vertexColors: true,
        alphaTest: 0.5,
        depthWrite: true,
        transparent: false,
      });
    } else if (!this.cutoutMaterial.map && this.atlasTexture) {
      this.cutoutMaterial.map = this.atlasTexture;
      this.cutoutMaterial.needsUpdate = true;
    }
    return this.cutoutMaterial;
  }

  /**
   * Helper to create a standalone crisp 16x16 canvas texture for legacy/isolated meshes
   */
  public getStandaloneTexture(name: string, drawFn: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
    if (this.fallbackTextureCache.has(name)) {
      return this.fallbackTextureCache.get(name)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = false;

    drawFn(ctx);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    this.fallbackTextureCache.set(name, texture);
    return texture;
  }
}

export const vanillaAtlas = VanillaAtlasManager.getInstance();
