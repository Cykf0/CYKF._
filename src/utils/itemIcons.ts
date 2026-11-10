import * as THREE from 'three';

/**
 * Universal Minecraft Item & Block Icon Manager
 * "Cykf._" Portfolio - Pure Vanilla Item Art Pipeline
 *
 * Provides:
 * - normalizeMinecraftId(id): Standardizes any item slug, kebab-case, or alias to canonical snake_case
 * - getItemIcon(id): Looks up local /items/<id>.png with fallback to texturepack & procedural pixel art
 * - getItemTexture3D(id): Returns a crisp NearestFilter Three.js texture for 3D dropped items and held items
 */

const ID_ALIASES: Record<string, string> = {
  // Hotbar & Common items
  'nether-star': 'nether_star',
  'diamond-pickaxe': 'diamond_pickaxe',
  'enchanted-book': 'enchanted_book',
  'book-and-quill': 'writable_book',
  'writable-book': 'writable_book',
  'ender-pearl': 'ender_pearl',
  'ender-eye': 'ender_eye',
  'grass-block': 'grass_block',
  'crafting-table': 'crafting_table',
  'totem-of-undying': 'totem_of_undying',
  'golden-apple': 'golden_apple',
  'experience-bottle': 'experience_bottle',
  'cherry-sapling': 'cherry_sapling',

  // Project Vault & Chest aliases
  'lightning': 'lightning_rod',
  'lightning-rod': 'lightning_rod',
  'satellite': 'daylight_detector',
  'palette': 'painting',

  // Journey Recipes aliases
  'code': 'command_block',
  'layers': 'bookshelf',
  'cloud': 'feather',
  'database': 'chiseled_bookshelf',
  'ruler': 'stick',
  'spark': 'blaze_powder',
  'terminal': 'comparator',
  'books': 'book',
  'atom': 'nether_star',

  // Trades aliases
  'monitor': 'item_frame',
  'website': 'map',
  'clapperboard': 'jukebox',
  'sparkles': 'amethyst_shard',

  // Advancements aliases
  'globe': 'compass',
  'fire': 'campfire',
  'hourglass': 'clock',
  'portal': 'end_portal_frame',
  'trophy': 'nether_star',
  'lock': 'barrier',
};

export function normalizeMinecraftId(id: string): string {
  if (!id) return 'air';
  const clean = id
    .toLowerCase()
    .trim()
    .replace(/^minecraft:/, '');

  if (ID_ALIASES[clean]) {
    return ID_ALIASES[clean];
  }

  const normalized = clean
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  if (ID_ALIASES[normalized]) {
    return ID_ALIASES[normalized];
  }

  return normalized;
}

/**
 * Primary icon lookup helper
 * Returns primary local asset path /items/<minecraft_id>.png
 */
export function getItemIcon(id: string): string {
  const norm = normalizeMinecraftId(id);
  return `/items/${norm}.png`;
}

/**
 * Returns secondary fallback icon path from texture pack if primary is missing
 */
export function getItemFallbackIcon(id: string): string {
  const norm = normalizeMinecraftId(id);
  return `/texturepack/assets/minecraft/textures/item/${norm}.png`;
}

const textureCache = new Map<string, THREE.Texture>();

/**
 * Returns a Three.js Texture for 3D in-world dropped items and held props
 * Configured strictly with NearestFilter, no mipmaps, and sRGB color space
 */
export function getItemTexture3D(id: string): THREE.Texture {
  const norm = normalizeMinecraftId(id);
  if (textureCache.has(norm)) {
    return textureCache.get(norm)!;
  }

  const loader = new THREE.TextureLoader();
  const url = getItemIcon(norm);

  const texture = loader.load(
    url,
    undefined,
    undefined,
    () => {
      // If /items/<id>.png fails, try texturepack
      const fallbackUrl = getItemFallbackIcon(norm);
      loader.load(fallbackUrl, (fbTex) => {
        fbTex.magFilter = THREE.NearestFilter;
        fbTex.minFilter = THREE.NearestFilter;
        fbTex.generateMipmaps = false;
        fbTex.colorSpace = THREE.SRGBColorSpace;
        texture.image = fbTex.image;
        texture.needsUpdate = true;
      });
    }
  );

  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  textureCache.set(norm, texture);
  return texture;
}
