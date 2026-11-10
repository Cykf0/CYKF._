import * as THREE from 'three';

/**
 * Centralized Texture & Asset Manager
 * Enforces pure Minecraft pixel-art rendering:
 * - NearestFilter for min/mag
 * - generateMipmaps: false
 * - SRGBColorSpace
 * - Texture caching & instant synchronous retrieval
 * - Path validation and graceful missing asset reporting
 */

class CentralTextureManager {
  private static instance: CentralTextureManager;
  private textureCache = new Map<string, THREE.Texture>();
  private canvasCache = new Map<string, HTMLCanvasElement>();
  private loader: THREE.TextureLoader;

  public static getInstance(): CentralTextureManager {
    if (!CentralTextureManager.instance) {
      CentralTextureManager.instance = new CentralTextureManager();
    }
    return CentralTextureManager.instance;
  }

  private constructor() {
    this.loader = new THREE.TextureLoader();
  }

  /**
   * Loads or returns cached pixel-crisp Minecraft texture
   */
  public getTexture(url: string, onLoaded?: (tex: THREE.Texture) => void): THREE.Texture {
    if (this.textureCache.has(url)) {
      const cached = this.textureCache.get(url)!;
      if (onLoaded && cached.image) onLoaded(cached);
      return cached;
    }

    const tex = this.loader.load(
      url,
      (loaded) => {
        loaded.magFilter = THREE.NearestFilter;
        loaded.minFilter = THREE.NearestFilter;
        loaded.generateMipmaps = false;
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.needsUpdate = true;
        if (onLoaded) onLoaded(loaded);
      },
      undefined,
      (err) => {
        console.warn(`[TextureManager] Asset failed to load from "${url}". Activating procedural fallback.`, err);
        const fallbackCanvas = this.createMissingFallbackCanvas();
        tex.image = fallbackCanvas;
        tex.needsUpdate = true;
      }
    );

    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.colorSpace = THREE.SRGBColorSpace;

    this.textureCache.set(url, tex);
    return tex;
  }

  /**
   * Extracts static 16x16 frame from an animated strip (e.g. lantern 16x48, sea lantern 16x80)
   */
  public getStaticFrame(url: string, frameIndex = 0): THREE.Texture {
    const cacheKey = `${url}#frame_${frameIndex}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const canvasTex = new THREE.CanvasTexture(canvas);
    canvasTex.magFilter = THREE.NearestFilter;
    canvasTex.minFilter = THREE.NearestFilter;
    canvasTex.generateMipmaps = false;
    canvasTex.colorSpace = THREE.SRGBColorSpace;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, 16, 16);
        ctx.drawImage(img, 0, frameIndex * 16, 16, 16, 0, 0, 16, 16);
        canvasTex.needsUpdate = true;
      }
    };
    img.onerror = () => {
      console.warn(`[TextureManager] Could not load animated strip: ${url}`);
    };
    img.src = url;

    this.textureCache.set(cacheKey, canvasTex);
    return canvasTex;
  }

  /**
   * Procedural purple/black missing texture canvas
   */
  private createMissingFallbackCanvas(): HTMLCanvasElement {
    if (this.canvasCache.has('missing')) return this.canvasCache.get('missing')!;
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 16;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const isPurple = ((x < 8 && y < 8) || (x >= 8 && y >= 8));
        ctx.fillStyle = isPurple ? '#F800F8' : '#000000';
        ctx.fillRect(x, y, 1, 1);
      }
    }
    this.canvasCache.set('missing', c);
    return c;
  }
}

export const textureManager = CentralTextureManager.getInstance();
