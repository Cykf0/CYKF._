import * as THREE from 'three';
import atlasDataStatic from './atlasData.json';

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

const TILE_ALIASES: Record<string, string> = {
  oak_fence: 'oak_planks',
  spruce_fence: 'spruce_planks',
  dark_oak_fence: 'dark_oak_planks',
  fence: 'oak_planks',
  barrel: 'barrel_side',
  chest: 'oak_planks',
  lectern: 'bookshelf',
  basalt: 'deepslate',
  basalt_side: 'deepslate',
  lapis_ore: 'diamond_ore',
  iron_fence: 'iron_block',
};

class VanillaAtlasManager {
  private static instance: VanillaAtlasManager;
  private atlasTexture: THREE.Texture;
  private atlasData: AtlasData = atlasDataStatic as AtlasData;
  private isLoaded = false;
  private loadCallbacks: Array<() => void> = [];

  private solidMaterial: THREE.MeshBasicMaterial | null = null;
  private cutoutMaterial: THREE.MeshBasicMaterial | null = null;
  private fallbackTextureCache = new Map<string, THREE.CanvasTexture>();

  public static getInstance(): VanillaAtlasManager {
    if (!VanillaAtlasManager.instance) {
      VanillaAtlasManager.instance = new VanillaAtlasManager();
    }
    return VanillaAtlasManager.instance;
  }

  private constructor() {
    // 1. Synchronously create Texture instance and bind to /atlas.png
    const textureLoader = new THREE.TextureLoader();
    this.atlasTexture = textureLoader.load(
      '/atlas.png',
      (texture) => {
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.flipY = true;
        texture.needsUpdate = true;
        this.isLoaded = true;
        if (this.solidMaterial) this.solidMaterial.needsUpdate = true;
        if (this.cutoutMaterial) this.cutoutMaterial.needsUpdate = true;
        this.checkReady();
      },
      undefined,
      (err) => {
        console.warn('Could not load /atlas.png', err);
      }
    );
    this.atlasTexture.magFilter = THREE.NearestFilter;
    this.atlasTexture.minFilter = THREE.NearestFilter;
    this.atlasTexture.generateMipmaps = false;
    this.atlasTexture.colorSpace = THREE.SRGBColorSpace;
    this.atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.atlasTexture.wrapT = THREE.ClampToEdgeWrapping;
    this.atlasTexture.flipY = true;

    this.checkReady();
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

  public debugUniform = { value: 0 };

  public setDebugMode(mode: number) {
    this.debugUniform.value = mode;
  }

  public getTileUV(name: string): TileUV {
    const resolvedName = TILE_ALIASES[name] || name;
    if (this.atlasData && this.atlasData.tiles[resolvedName]) {
      const t = this.atlasData.tiles[resolvedName];
      return { u0: t.u0, v0: t.v0, u1: t.u1, v1: t.v1 };
    }
    console.warn(`[VanillaTextureAtlas] MISSING TILE: "${name}". Falling back safely.`);
    if (this.atlasData && this.atlasData.tiles['oak_planks']) {
      const t = this.atlasData.tiles['oak_planks'];
      return { u0: t.u0, v0: t.v0, u1: t.u1, v1: t.v1 };
    }
    // Default UV fallback
    return { u0: 0.005, v0: 0.965, u1: 0.034, v1: 0.995 };
  }

  private injectDebugShader(mat: THREE.MeshBasicMaterial) {
    const debugUni = this.debugUniform;
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uDebugMode = debugUni;
      shader.vertexShader = `
        varying vec3 vWorldNormal;
        ${shader.vertexShader}
      `.replace(
        '#include <defaultnormal_vertex>',
        `
        #include <defaultnormal_vertex>
        vWorldNormal = normalize(transformedNormal);
        `
      );

      shader.fragmentShader = `
        uniform int uDebugMode;
        varying vec3 vWorldNormal;
        ${shader.fragmentShader}
      `.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        if (uDebugMode == 1) {
          // Mode 1: Albedo Only (no vertex color shading)
          #ifdef USE_MAP
            gl_FragColor = texture2D(map, vMapUv);
          #else
            gl_FragColor = vec4(1.0);
          #endif
        } else if (uDebugMode == 2) {
          // Mode 2: UV Coordinates (visualize coordinates across tile)
          #ifdef USE_MAP
            gl_FragColor = vec4(fract(vMapUv * 32.0), 0.0, 1.0);
          #else
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
          #endif
        } else if (uDebugMode == 3) {
          // Mode 3: Atlas Tile Grid Visualization
          #ifdef USE_MAP
            vec2 tileCoord = floor(vMapUv * 32.0);
            float h = fract(sin(dot(tileCoord, vec2(12.9898, 78.233))) * 43758.5453);
            gl_FragColor = vec4(fract(h * 3.0), fract(h * 7.0), fract(h * 11.0), 1.0);
          #else
            gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
          #endif
        } else if (uDebugMode == 4) {
          // Mode 4: Vertex Colors (Directional face shading + Biome tint)
          #ifdef USE_COLOR
            gl_FragColor = vec4(vColor, 1.0);
          #else
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
          #endif
        } else if (uDebugMode == 5) {
          // Mode 5: Ambient Occlusion Only
          #ifdef USE_COLOR
            float ao = min(vColor.r, min(vColor.g, vColor.b));
            gl_FragColor = vec4(vec3(ao), 1.0);
          #else
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
          #endif
        } else if (uDebugMode == 6) {
          // Mode 6: Light Level / Directional Shading
          #ifdef USE_COLOR
            float lightVal = max(vColor.r, max(vColor.g, vColor.b));
            gl_FragColor = vec4(vec3(lightVal), 1.0);
          #else
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
          #endif
        } else if (uDebugMode == 7) {
          // Mode 7: Surface Normals
          gl_FragColor = vec4(vWorldNormal * 0.5 + 0.5, 1.0);
        } else if (uDebugMode == 8) {
          // Mode 8: Overdraw (Red tint)
          gl_FragColor = vec4(0.4, 0.08, 0.08, 0.75);
        }
        `
      );
    };
  }

  public getSolidMaterial(): THREE.MeshBasicMaterial {
    if (!this.solidMaterial) {
      this.solidMaterial = new THREE.MeshBasicMaterial({
        map: this.atlasTexture,
        vertexColors: true,
        reflectivity: 0,
      });
      this.injectDebugShader(this.solidMaterial);
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
      this.injectDebugShader(this.cutoutMaterial);
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

export function getAtlasMaterial(): THREE.Material {
  return vanillaAtlas.getSolidMaterial();
}

export function getAtlasCutoutMaterial(): THREE.Material {
  return vanillaAtlas.getCutoutMaterial();
}
