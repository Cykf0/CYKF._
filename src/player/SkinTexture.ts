import * as THREE from 'three';
import { DEFAULT_SKIN_DATA_URI } from './defaultSkinData';

export interface ProcessedSkinData {
  texture: THREE.CanvasTexture;
  isSlim: boolean;
  avatarUrl: string;
  isLegacy: boolean;
}

let defaultSkinDataInstance: ProcessedSkinData | null = null;

/**
 * Synchronous default skin provider to prevent any null/teal placeholder rendering.
 */
export function getDefaultSkinData(): ProcessedSkinData {
  if (defaultSkinDataInstance) return defaultSkinDataInstance;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  const img = new Image();
  img.src = DEFAULT_SKIN_DATA_URI;

  const renderSkinToCanvas = () => {
    if (ctx && img.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
      texture.needsUpdate = true;
    }
  };

  if (img.complete && img.naturalWidth > 0) {
    renderSkinToCanvas();
  } else {
    img.onload = renderSkinToCanvas;
  }

  // Pre-generate face avatar
  let avatarUrl = DEFAULT_SKIN_DATA_URI;
  try {
    const avatarCanvas = document.createElement('canvas');
    avatarCanvas.width = 64;
    avatarCanvas.height = 64;
    const actx = avatarCanvas.getContext('2d');
    if (actx && img.complete && img.naturalWidth > 0) {
      actx.imageSmoothingEnabled = false;
      actx.drawImage(img, 8, 8, 8, 8, 0, 0, 64, 64);
      actx.drawImage(img, 40, 8, 8, 8, 0, 0, 64, 64);
      avatarUrl = avatarCanvas.toDataURL('image/png');
    }
  } catch (e) {
    // fallback
  }

  defaultSkinDataInstance = {
    texture,
    isSlim: false,
    avatarUrl,
    isLegacy: false,
  };
  return defaultSkinDataInstance;
}

/**
 * Standard Minecraft UV coordinate box generator for Three.js BoxGeometry.
 * In Three.js BoxGeometry:
 * Face 0: +X (Character Left)
 * Face 1: -X (Character Right)
 * Face 2: +Y (Top)
 * Face 3: -Y (Bottom)
 * Face 4: +Z (Front)
 * Face 5: -Z (Back)
 */
export function createBoxUVs(
  texWidth: number,
  texHeight: number,
  x: number,
  y: number,
  w: number,
  h: number,
  d: number
): Float32Array {
  const u = (px: number) => px / texWidth;
  const v = (py: number) => 1 - py / texHeight;

  const uvs: number[] = [];

  const addFaceUV = (fx: number, fy: number, fw: number, fh: number) => {
    const u0 = u(fx);
    const u1 = u(fx + fw);
    const v0 = v(fy + fh);
    const v1 = v(fy);

    // BoxGeometry vertex order per face:
    // v0: top-left (u0, v1)
    // v1: top-right (u1, v1)
    // v2: bottom-left (u0, v0)
    // v3: bottom-right (u1, v0)
    uvs.push(
      u0, v1,
      u1, v1,
      u0, v0,
      u1, v0
    );
  };

  // Face 0: +X (Character Left side) -> texture x: x + d + w, width: d, height: h
  addFaceUV(x + d + w, y + d, d, h);

  // Face 1: -X (Character Right side) -> texture x: x, width: d, height: h
  addFaceUV(x, y + d, d, h);

  // Face 2: +Y (Top) -> texture x: x + d, y: y, width: w, height: d
  addFaceUV(x + d, y, w, d);

  // Face 3: -Y (Bottom) -> texture x: x + d + w, y: y, width: w, height: d
  addFaceUV(x + d + w, y, w, d);

  // Face 4: +Z (Front) -> texture x: x + d, y: y + d, width: w, height: h
  addFaceUV(x + d, y + d, w, h);

  // Face 5: -Z (Back) -> texture x: x + d + w + d, y: y + d, width: w, height: h
  addFaceUV(x + d + w + d, y + d, w, h);

  return new Float32Array(uvs);
}

/**
 * Creates custom BoxGeometry with precise Minecraft UVs applied.
 */
export function createMinecraftBoxGeometry(
  w: number,
  h: number,
  d: number,
  texX: number,
  texY: number,
  texW: number,
  texH: number,
  texD: number
): THREE.BoxGeometry {
  const geom = new THREE.BoxGeometry(w, h, d);
  const uvs = createBoxUVs(64, 64, texX, texY, texW, texH, texD);
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geom;
}

/**
 * Loads and processes a player skin from URL or image path.
 */
export async function loadAndProcessSkin(
  url: string,
  modelOverride: 'auto' | 'classic' | 'slim' = 'auto'
): Promise<ProcessedSkinData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      const isLegacy = img.height === 32;
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);

      // Handle legacy 64x32 skins
      if (isLegacy) {
        // Leg mirroring
        const rightLeg = ctx.getImageData(0, 16, 16, 16);
        ctx.putImageData(rightLeg, 16, 48);
        // Arm mirroring
        const rightArm = ctx.getImageData(40, 16, 16, 16);
        ctx.putImageData(rightArm, 32, 48);
      }

      // Detect classic (4px) vs slim (3px) arms
      let isSlim = false;
      if (modelOverride === 'slim') {
        isSlim = true;
      } else if (modelOverride === 'classic') {
        isSlim = false;
      } else {
        const extraCol = ctx.getImageData(54, 20, 2, 12).data;
        let hasContent = false;
        for (let i = 3; i < extraCol.length; i += 4) {
          if (extraCol[i] > 10) {
            hasContent = true;
            break;
          }
        }
        isSlim = !hasContent && !isLegacy;
      }

      // Generate Face Avatar: base face (8, 8, 8, 8) + hat layer (40, 8, 8, 8)
      const avatarCanvas = document.createElement('canvas');
      avatarCanvas.width = 64;
      avatarCanvas.height = 64;
      const actx = avatarCanvas.getContext('2d');
      if (actx) {
        actx.imageSmoothingEnabled = false;
        actx.drawImage(canvas, 8, 8, 8, 8, 0, 0, 64, 64);
        actx.drawImage(canvas, 40, 8, 8, 8, 0, 0, 64, 64);
      }
      const avatarUrl = avatarCanvas.toDataURL('image/png');

      // Update favicon dynamically
      if (typeof document !== 'undefined') {
        const favicon = document.getElementById('favicon') as HTMLLinkElement;
        if (favicon) {
          favicon.href = avatarUrl;
        }
      }

      // Three.js CanvasTexture
      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;

      resolve({
        texture,
        isSlim,
        avatarUrl,
        isLegacy
      });
    };

    img.onerror = (e) => {
      // Fallback to embedded default skin
      img.onerror = null;
      img.src = DEFAULT_SKIN_DATA_URI;
    };
    img.src = (!url || url === '/skins/cykf.png') ? DEFAULT_SKIN_DATA_URI : url;
  });
}
