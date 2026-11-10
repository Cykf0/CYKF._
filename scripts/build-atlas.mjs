/**
 * Vanilla Texture Atlas Generator
 * "Cykf._" Portfolio - Pure Vanilla Minecraft Look Pass
 *
 * Scans /public/texturepack/assets/minecraft/textures/block/
 * Packs all block textures with 2px extruded padding into power-of-two atlas.png + atlas.json.
 * If missing, falls back to hand-drawn 16x16 pixel-grid textures matching vanilla palette.
 * Logs all missing files to MISSING_TEXTURES.md.
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const TEXTUREPACK_DIR = 'public/texturepack/assets/minecraft/textures/block';
const OUTPUT_PNG = 'public/atlas.png';
const OUTPUT_JSON = 'public/atlas.json';
const MISSING_LOG = 'MISSING_TEXTURES.md';

// Ensure directory exists
if (!fs.existsSync(TEXTUREPACK_DIR)) {
  fs.mkdirSync(TEXTUREPACK_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// 1. Pure Node PNG Reader & Writer
// ---------------------------------------------------------------------------

function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504E47) throw new Error('Invalid PNG header');
  let pos = 8;
  let width = 0;
  let height = 0;
  const idatChunks = [];

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') {
      idatChunks.push(buf.subarray(pos + 8, pos + 8 + len));
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + len;
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = 4;
  const stride = 1 + width * bpp;
  const out = Buffer.alloc(width * height * bpp);

  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    return (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
  };

  for (let y = 0; y < height; y++) {
    const filter = decompressed[y * stride];
    const curr = y * width * bpp;
    const prev = (y - 1) * width * bpp;

    for (let x = 0; x < width * bpp; x++) {
      const raw = decompressed[y * stride + 1 + x];
      const a = x >= bpp ? out[curr + x - bpp] : 0;
      const b = y > 0 ? out[prev + x] : 0;
      const c = (x >= bpp && y > 0) ? out[prev + x - bpp] : 0;

      let val = raw;
      if (filter === 1) val = (raw + a) & 0xff;
      else if (filter === 2) val = (raw + b) & 0xff;
      else if (filter === 3) val = (raw + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) val = (raw + paeth(a, b, c)) & 0xff;

      out[curr + x] = val;
    }
  }

  return { width, height, data: out };
}

function encodePNG(width, height, rgbaBuffer) {
  const scanlineWidth = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineWidth * height);

  for (let y = 0; y < height; y++) {
    const rawOffset = y * scanlineWidth;
    rawData[rawOffset] = 0; // Filter 0: None
    rgbaBuffer.copy(rawData, rawOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const deflated = zlib.deflateSync(rawData);

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  const crc32 = (buf) => {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  const makeChunk = (typeStr, dataBuf) => {
    const typeBuf = Buffer.from(typeStr, 'ascii');
    const len = dataBuf ? dataBuf.length : 0;
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(len, 0);

    const chunkData = dataBuf ? Buffer.concat([typeBuf, dataBuf]) : typeBuf;
    const crcVal = crc32(chunkData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);

    return Buffer.concat([lenBuf, chunkData, crcBuf]);
  };

  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', null)
  ]);
}

// ---------------------------------------------------------------------------
// 2. Hand-Drawn Pixel-Grid Vanilla Fallback Textures (16x16)
// ---------------------------------------------------------------------------

function hexToRgba(hex, alpha = 255) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b, alpha];
}

function create16x16(fn) {
  const buf = Buffer.alloc(16 * 16 * 4);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const idx = (y * 16 + x) * 4;
      const [r, g, b, a] = fn(x, y);
      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }
  return buf;
}

// Deterministic hash for authentic noise patterns
function pixelHash(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 982451653) ^ 0x5bf03635;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

const VANILLA_PALETTES = {
  stone: ['#616161', '#6d6d6d', '#767676', '#808080', '#595959', '#8a8a8a'],
  dirt: ['#866043', '#725138', '#5c402c', '#946c4d', '#684832'],
  coarse_dirt: ['#77553b', '#60422c', '#523723', '#8a6448', '#442d1b'],
  podzol_top: ['#593d29', '#4c3422', '#6b4c34', '#3d2818', '#7a563b'],
  oak_planks: ['#b88748', '#a7783d', '#966a33', '#865c29', '#553b1b'],
  cherry_planks: ['#e4a0b7', '#d98ea7', '#cb7e97', '#b96c86', '#a15671'],
  cobblestone: ['#474747', '#565656', '#666666', '#7a7a7a', '#8a8a8a', '#343434'],
  stone_bricks: ['#4c4c4c', '#5b5b5b', '#6a6a6a', '#787878', '#868686', '#3c3c3c'],
  mossy_stone_bricks: ['#4c4c4c', '#5b5b5b', '#6a6a6a', '#5d7d3d', '#48682e', '#6e9146'],
  cracked_stone_bricks: ['#4c4c4c', '#5b5b5b', '#6a6a6a', '#333333', '#242424'],
  deepslate: ['#303036', '#25252b', '#3d3d44', '#1f1f24', '#474750'],
  deepslate_bricks: ['#28282e', '#36363e', '#1e1e23', '#40404a', '#141418'],
  bedrock: ['#161616', '#262626', '#353535', '#0d0d0d', '#464646'],
  obsidian: ['#151020', '#1c152d', '#110c1c', '#271d3f', '#42286b'],
  end_stone: ['#dcdba3', '#eae8b8', '#c5c48b', '#b0af76', '#f3f2c5'],
  end_stone_bricks: ['#dcdba3', '#eae8b8', '#c5c48b', '#b0af76', '#9c9b68'],
  sculk: ['#03181e', '#062832', '#0a3d4c', '#041d24', '#00ffbf'],
  glowstone: ['#b8883b', '#d9a94e', '#f4cc6d', '#ffea8a', '#916728'],
  sea_lantern: ['#b4d7d0', '#c8eae3', '#e0fbf6', '#87b5ad', '#669a91'],
  snow: ['#f9feff', '#edf4f5', '#dbe6e8', '#c8d8dc', '#b5cad0'],
  ice: ['#8ab4f8', '#a1c4fc', '#6f9ef0', '#b9d4fd', '#588de8'],
  sand: ['#dbd3a0', '#e3dcab', '#cfc792', '#bfb782', '#ebe4b8'],
  gravel: ['#787474', '#888484', '#666262', '#969292', '#565252'],
  clay: ['#9aa3b2', '#a6afbe', '#8d96a4', '#7d8593', '#b3bccb'],
  purpur_block: ['#a97d9e', '#9b6f90', '#b58ba6', '#8a5e7f', '#6c4361'],
  amethyst_block: ['#8562c4', '#7853b8', '#9974d6', '#6944a9', '#ba99ec'],
  moss_block: ['#596e2d', '#647c33', '#4e6126', '#728c3b', '#3e4f1d'],
};

// Generate authentic fallback 16x16 buffer for a block
function generateFallbackTexture(name) {
  // 1. Grass block top (biome-tinted greyscale / green)
  if (name === 'grass_block_top') {
    return create16x16((x, y) => {
      const shades = ['#79c05a', '#6db14e', '#85cc64', '#62a243', '#8ed66c'];
      const h = pixelHash(x, y, 101) % shades.length;
      return hexToRgba(shades[h]);
    });
  }

  // 2. Grass block side
  if (name === 'grass_block_side') {
    const dirtColors = VANILLA_PALETTES.dirt;
    const grassColors = ['#79c05a', '#6db14e', '#85cc64'];
    const fringeDepths = [3, 4, 3, 5, 4, 3, 4, 5, 3, 4, 3, 5, 4, 3, 4, 3];
    return create16x16((x, y) => {
      if (y < fringeDepths[x]) {
        const gh = pixelHash(x, y, 102) % grassColors.length;
        return hexToRgba(grassColors[gh]);
      }
      const dh = pixelHash(x, y, 103) % dirtColors.length;
      return hexToRgba(dirtColors[dh]);
    });
  }

  // 3. Grass side overlay (for tinted side)
  if (name === 'grass_block_side_overlay') {
    const fringeDepths = [3, 4, 3, 5, 4, 3, 4, 5, 3, 4, 3, 5, 4, 3, 4, 3];
    return create16x16((x, y) => {
      if (y < fringeDepths[x]) {
        const shade = 180 + (pixelHash(x, y, 104) % 60);
        return [shade, shade, shade, 255];
      }
      return [0, 0, 0, 0];
    });
  }

  // 4. Oak Log
  if (name === 'oak_log') {
    const bark = ['#46351d', '#584425', '#675230', '#3c2c16', '#2d210f'];
    return create16x16((x, y) => {
      // vertical bark grooves
      const groove = (x % 4 === 0) ? bark[4] : bark[pixelHash(Math.floor(x / 2), y, 105) % 4];
      return hexToRgba(groove);
    });
  }

  // 5. Oak Log Top
  if (name === 'oak_log_top') {
    const rings = ['#9e814d', '#b8965a', '#7a633a', '#46351d'];
    return create16x16((x, y) => {
      const dx = Math.abs(x - 7.5);
      const dy = Math.abs(y - 7.5);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= 7) return hexToRgba(rings[3]); // bark rim
      const ringIdx = Math.floor(dist * 0.7 + (pixelHash(x, y, 106) % 2) * 0.3) % 3;
      return hexToRgba(rings[ringIdx]);
    });
  }

  // 6. Cherry Log
  if (name === 'cherry_log') {
    const bark = ['#38242a', '#472d35', '#2c1a20', '#563842'];
    return create16x16((x, y) => {
      const groove = (x % 5 === 0) ? bark[2] : bark[pixelHash(x, y, 107) % bark.length];
      return hexToRgba(groove);
    });
  }

  // 7. Cherry Log Top
  if (name === 'cherry_log_top') {
    const rings = ['#dfa2b5', '#c8869b', '#b36d83', '#38242a'];
    return create16x16((x, y) => {
      const dist = Math.sqrt((x - 7.5) ** 2 + (y - 7.5) ** 2);
      if (dist >= 7) return hexToRgba(rings[3]);
      return hexToRgba(rings[Math.floor(dist) % 3]);
    });
  }

  // 8. Oak Leaves (Cutout)
  if (name === 'oak_leaves') {
    const greens = ['#3b6e22', '#2d581a', '#4a832e', '#599a37'];
    return create16x16((x, y) => {
      const h = pixelHash(x, y, 108);
      if (h % 5 === 0) return [0, 0, 0, 0]; // Cutout hole!
      return hexToRgba(greens[h % greens.length]);
    });
  }

  // 9. Cherry Leaves (Pink blossom cutout)
  if (name === 'cherry_leaves') {
    const pinks = ['#f8b6cc', '#e98fad', '#fdd8e6', '#d67595', '#ffffff'];
    return create16x16((x, y) => {
      const h = pixelHash(x, y, 109);
      if (h % 6 === 0) return [0, 0, 0, 0]; // Cutout hole
      return hexToRgba(pinks[h % pinks.length]);
    });
  }

  // 10. Ores (Diamond, Gold, Iron, Redstone, Emerald, Coal)
  if (name.endsWith('_ore')) {
    const oreType = name.replace('_ore', '');
    const gemColors = {
      diamond: ['#2cccc4', '#5cf4ec', '#1baea7', '#b2fcf9'],
      gold: ['#fcee4b', '#e0c422', '#ba9c10', '#fff8a6'],
      iron: ['#d8af93', '#c29577', '#9e7559', '#e8c9b2'],
      redstone: ['#e61616', '#ff3838', '#990c0c', '#ff6b6b'],
      emerald: ['#17dd62', '#41f384', '#0fb64e', '#a3f9c4'],
      coal: ['#2b2b2b', '#1c1c1c', '#3d3d3d', '#111111']
    }[oreType] || ['#ffffff'];

    const stone = VANILLA_PALETTES.stone;
    // Gem vein coordinates
    const veins = new Set([
      '3,4', '4,4', '4,5', '5,5',
      '9,2', '10,2', '10,3', '11,3',
      '7,9', '8,9', '8,10', '9,10', '9,11',
      '12,11', '13,11', '13,12',
      '2,12', '3,12', '3,13'
    ]);

    return create16x16((x, y) => {
      const key = `${x},${y}`;
      if (veins.has(key)) {
        const gh = pixelHash(x, y, 110) % gemColors.length;
        return hexToRgba(gemColors[gh]);
      }
      const sh = pixelHash(x, y, 111) % stone.length;
      return hexToRgba(stone[sh]);
    });
  }

  // 11. Bookshelf
  if (name === 'bookshelf') {
    const oak = VANILLA_PALETTES.oak_planks;
    const bookColors = ['#9e2a2b', '#2b5f8f', '#3f7d44', '#8f5b2b', '#7a2b8f', '#d4af37'];
    return create16x16((x, y) => {
      // top & bottom wooden shelf
      if (y < 2 || y > 13 || (y >= 7 && y <= 8)) {
        return hexToRgba(oak[pixelHash(x, y, 112) % oak.length]);
      }
      // Vertical book spines
      const bookSlot = Math.floor(x / 2.5);
      const isSeam = (x % 3 === 0 && (pixelHash(x, y, 113) % 2 === 0));
      if (isSeam) return hexToRgba('#1e140d');
      const bColor = bookColors[bookSlot % bookColors.length];
      return hexToRgba(bColor);
    });
  }

  // 12. Crafting Table Top
  if (name === 'crafting_table_top') {
    const oak = VANILLA_PALETTES.oak_planks;
    return create16x16((x, y) => {
      // 3x3 grid line markers
      if ((x === 5 || x === 10 || y === 5 || y === 10) && x > 1 && x < 14 && y > 1 && y < 14) {
        return hexToRgba('#422d14');
      }
      // Border frame
      if (x === 0 || x === 15 || y === 0 || y === 15) {
        return hexToRgba('#6b4b24');
      }
      return hexToRgba(oak[pixelHash(x, y, 114) % oak.length]);
    });
  }

  // 13. Crafting Table Front & Side
  if (name === 'crafting_table_front' || name === 'crafting_table_side') {
    const oak = VANILLA_PALETTES.oak_planks;
    return create16x16((x, y) => {
      // saw / hammer tool hanging on front
      if (name === 'crafting_table_front' && x >= 4 && x <= 7 && y >= 4 && y <= 11) {
        if (y <= 6) return hexToRgba('#c0c0c0'); // iron saw blade
        return hexToRgba('#553b1b'); // wooden handle
      }
      if (x === 0 || x === 15 || y === 0 || y === 15) {
        return hexToRgba('#553b1b');
      }
      return hexToRgba(oak[pixelHash(x, y, 115) % oak.length]);
    });
  }

  // 14. Water (Translucent blue)
  if (name === 'water_still' || name === 'water_flow') {
    const waterShades = ['#2a50a8', '#386ad4', '#4b7fe8', '#5c8ef0', '#7ba8f8'];
    return create16x16((x, y) => {
      const h = pixelHash(x, y, 116) % waterShades.length;
      return hexToRgba(waterShades[h], 204); // 80% opacity
    });
  }

  // 15. Lava (Molten magma)
  if (name === 'lava_still' || name === 'lava_flow') {
    const lavaShades = ['#cf4a00', '#e86b00', '#ff8f00', '#ffb800', '#7a1c00'];
    return create16x16((x, y) => {
      const h = pixelHash(x, y, 117) % lavaShades.length;
      return hexToRgba(lavaShades[h], 255);
    });
  }

  // 16. Torch (Cutout)
  if (name === 'torch') {
    return create16x16((x, y) => {
      if (x >= 7 && x <= 8 && y >= 6 && y <= 15) {
        return hexToRgba('#6b4b24'); // stick
      }
      if (x >= 6 && x <= 9 && y >= 2 && y <= 5) {
        return hexToRgba(y === 2 ? '#fff8a6' : '#ff9900'); // flame
      }
      return [0, 0, 0, 0];
    });
  }

  // 17. Glass (Cutout)
  if (name === 'glass') {
    return create16x16((x, y) => {
      if (x === 0 || x === 15 || y === 0 || y === 15) {
        return hexToRgba('#e0e8f0', 255); // border frame
      }
      // Diagonal glint streak
      if ((x === 2 && y === 2) || (x === 3 && y === 3) || (x === 12 && y === 10)) {
        return hexToRgba('#ffffff', 200);
      }
      return [0, 0, 0, 0]; // clear transparent interior
    });
  }

  // 18. Default from Palette Table
  const palette = VANILLA_PALETTES[name] || VANILLA_PALETTES.stone;
  return create16x16((x, y) => {
    const h = pixelHash(x, y, 200) % palette.length;
    return hexToRgba(palette[h]);
  });
}

// ---------------------------------------------------------------------------
// 3. Main Atlas Builder
// ---------------------------------------------------------------------------

const BLOCKS_TO_PACK = [
  'grass_block_top',
  'grass_block_side',
  'grass_block_side_overlay',
  'dirt',
  'coarse_dirt',
  'stone',
  'cobblestone',
  'mossy_cobblestone',
  'stone_bricks',
  'mossy_stone_bricks',
  'cracked_stone_bricks',
  'oak_planks',
  'oak_log',
  'oak_log_top',
  'oak_leaves',
  'cherry_planks',
  'cherry_log',
  'cherry_log_top',
  'cherry_leaves',
  'deepslate',
  'deepslate_bricks',
  'bedrock',
  'obsidian',
  'bookshelf',
  'crafting_table_top',
  'crafting_table_front',
  'crafting_table_side',
  'coal_ore',
  'iron_ore',
  'gold_ore',
  'redstone_ore',
  'diamond_ore',
  'emerald_ore',
  'glowstone',
  'sea_lantern',
  'snow',
  'ice',
  'sculk',
  'end_stone',
  'end_stone_bricks',
  'purpur_block',
  'amethyst_block',
  'moss_block',
  'sand',
  'gravel',
  'clay',
  'glass',
  'water_still',
  'lava_still',
  'torch'
];

async function buildAtlas() {
  console.log('--- Starting Vanilla Texture Atlas Generator ---');

  const missingFiles = [];
  const foundFiles = [];
  const textures = new Map(); // name -> Buffer (16x16 RGBA)

  for (const blockName of BLOCKS_TO_PACK) {
    const filePath = path.join(TEXTUREPACK_DIR, `${blockName}.png`);
    let tileBuffer = null;

    if (fs.existsSync(filePath)) {
      try {
        const fileBytes = fs.readFileSync(filePath);
        const decoded = decodePNG(fileBytes);
        if (decoded.width === 16 && decoded.height === 16) {
          tileBuffer = decoded.data;
          foundFiles.push(filePath);
        } else if (decoded.width === 16 && decoded.height > 16) {
          // Animated strip: extract first frame
          tileBuffer = decoded.data.subarray(0, 16 * 16 * 4);
          foundFiles.push(`${filePath} (animated strip: ${decoded.height / 16} frames)`);
        } else {
          console.warn(`[WARN] ${filePath} dimension ${decoded.width}x${decoded.height} not 16x16. Using fallback.`);
        }
      } catch (err) {
        console.warn(`[WARN] Error decoding ${filePath}: ${err.message}. Using fallback.`);
      }
    }

    if (!tileBuffer) {
      tileBuffer = generateFallbackTexture(blockName);
      missingFiles.push(`assets/minecraft/textures/block/${blockName}.png`);
    }

    textures.set(blockName, tileBuffer);
  }

  // Log missing files to MISSING_TEXTURES.md
  let missingReport = `# MISSING_TEXTURES.md\n\n`;
  missingReport += `Generated on: ${new Date().toISOString()}\n\n`;
  missingReport += `## Texture Pack Asset Audit\n\n`;
  missingReport += `- **Folder**: \`/public/texturepack/\`\n`;
  missingReport += `- **Total Checked Assets**: ${BLOCKS_TO_PACK.length}\n`;
  missingReport += `- **Found from Texture Pack**: ${foundFiles.length}\n`;
  missingReport += `- **Fallback Hand-Drawn 16x16 Textures**: ${missingFiles.length}\n\n`;

  if (foundFiles.length > 0) {
    missingReport += `### Found Custom Files:\n`;
    for (const f of foundFiles) {
      missingReport += `- \`${f}\`\n`;
    }
    missingReport += `\n`;
  }

  if (missingFiles.length > 0) {
    missingReport += `### Missing Files (Graceful 16x16 Vanilla Fallbacks Active):\n`;
    for (const m of missingFiles) {
      missingReport += `- \`${m}\` -> Hand-drawn pixel-grid vanilla palette fallback\n`;
    }
    missingReport += `\n`;
  }

  missingReport += `### Instructions for Resource Pack Swapping\n`;
  missingReport += `To use your own textures, simply drop your Minecraft PNG files into:\n`;
  missingReport += `\`public/texturepack/assets/minecraft/textures/block/<name>.png\`\n\n`;
  missingReport += `Then run:\n\`\`\`bash\nnpm run atlas\n\`\`\`\n`;
  missingReport += `The atlas will regenerate automatically without requiring any code edits.\n`;

  fs.writeFileSync(MISSING_LOG, missingReport, 'utf8');
  console.log(`Updated ${MISSING_LOG} (Found: ${foundFiles.length}, Fallbacks: ${missingFiles.length})`);

  // ---------------------------------------------------------------------------
  // 4. Extrude 2px padding & Pack into Atlas
  // ---------------------------------------------------------------------------
  // Each tile: 16x16 + 2px padding on all sides = 20x20 cell.
  // Power of two atlas size: 512x512 fits 25x25 = 625 tiles!
  const ATLAS_SIZE = 512;
  const TILE_INNER = 16;
  const PADDING = 2;
  const CELL_SIZE = TILE_INNER + PADDING * 2; // 20

  const atlasBuffer = Buffer.alloc(ATLAS_SIZE * ATLAS_SIZE * 4); // RGBA
  const atlasJson = {
    atlasWidth: ATLAS_SIZE,
    atlasHeight: ATLAS_SIZE,
    cellSize: CELL_SIZE,
    tileSize: TILE_INNER,
    padding: PADDING,
    tiles: {}
  };

  let currentX = 0;
  let currentY = 0;

  for (const [name, tileData] of textures) {
    if (currentX + CELL_SIZE > ATLAS_SIZE) {
      currentX = 0;
      currentY += CELL_SIZE;
    }

    if (currentY + CELL_SIZE > ATLAS_SIZE) {
      throw new Error(`Atlas overflow! Needed more than ${ATLAS_SIZE}x${ATLAS_SIZE}`);
    }

    // 1. Copy 16x16 inner tile into cell at (currentX + 2, currentY + 2)
    const innerX = currentX + PADDING;
    const innerY = currentY + PADDING;

    for (let ty = 0; ty < TILE_INNER; ty++) {
      for (let tx = 0; tx < TILE_INNER; tx++) {
        const srcIdx = (ty * TILE_INNER + tx) * 4;
        const dstIdx = ((innerY + ty) * ATLAS_SIZE + (innerX + tx)) * 4;
        atlasBuffer[dstIdx] = tileData[srcIdx];
        atlasBuffer[dstIdx + 1] = tileData[srcIdx + 1];
        atlasBuffer[dstIdx + 2] = tileData[srcIdx + 2];
        atlasBuffer[dstIdx + 3] = tileData[srcIdx + 3];
      }
    }

    // 2. Extrude 2px borders to guarantee zero bleeding
    // Top & Bottom 2 rows
    for (let p = 1; p <= PADDING; p++) {
      for (let tx = 0; tx < TILE_INNER; tx++) {
        // Top extruded rows
        const topSrc = (innerY * ATLAS_SIZE + (innerX + tx)) * 4;
        const topDst = ((innerY - p) * ATLAS_SIZE + (innerX + tx)) * 4;
        atlasBuffer.copy(atlasBuffer, topDst, topSrc, topSrc + 4);

        // Bottom extruded rows
        const btmSrc = ((innerY + TILE_INNER - 1) * ATLAS_SIZE + (innerX + tx)) * 4;
        const btmDst = ((innerY + TILE_INNER - 1 + p) * ATLAS_SIZE + (innerX + tx)) * 4;
        atlasBuffer.copy(atlasBuffer, btmDst, btmSrc, btmSrc + 4);
      }
    }

    // Left & Right 2 cols
    for (let p = 1; p <= PADDING; p++) {
      for (let ty = -PADDING; ty < TILE_INNER + PADDING; ty++) {
        const rowY = innerY + ty;
        // Left extruded cols
        const leftSrc = (rowY * ATLAS_SIZE + innerX) * 4;
        const leftDst = (rowY * ATLAS_SIZE + (innerX - p)) * 4;
        atlasBuffer.copy(atlasBuffer, leftDst, leftSrc, leftSrc + 4);

        // Right extruded cols
        const rightSrc = (rowY * ATLAS_SIZE + (innerX + TILE_INNER - 1)) * 4;
        const rightDst = (rowY * ATLAS_SIZE + (innerX + TILE_INNER - 1 + p)) * 4;
        atlasBuffer.copy(atlasBuffer, rightDst, rightSrc, rightSrc + 4);
      }
    }

    // Calculate Half-Texel Inset UVs for Three.js
    // Half-texel inset guarantees texture sampling never touches borders
    const halfTexelX = 0.5 / ATLAS_SIZE;
    const halfTexelY = 0.5 / ATLAS_SIZE;

    const u0 = innerX / ATLAS_SIZE + halfTexelX;
    const u1 = (innerX + TILE_INNER) / ATLAS_SIZE - halfTexelX;
    // In Three.js default UVs, V=0 is at bottom, V=1 is at top
    // For canvas/image loaded with flipY=false or standard BoxGeometry:
    const v1 = 1.0 - (innerY / ATLAS_SIZE + halfTexelY);
    const v0 = 1.0 - ((innerY + TILE_INNER) / ATLAS_SIZE - halfTexelY);

    atlasJson.tiles[name] = {
      x: innerX,
      y: innerY,
      width: TILE_INNER,
      height: TILE_INNER,
      u0,
      v0,
      u1,
      v1
    };

    currentX += CELL_SIZE;
  }

  // ---------------------------------------------------------------------------
  // 5. Output atlas.png and atlas.json
  // ---------------------------------------------------------------------------
  const pngData = encodePNG(ATLAS_SIZE, ATLAS_SIZE, atlasBuffer);
  fs.writeFileSync(OUTPUT_PNG, pngData);
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(atlasJson, null, 2), 'utf8');

  console.log(`[SUCCESS] Generated ${OUTPUT_PNG} (${ATLAS_SIZE}x${ATLAS_SIZE}, ${pngData.length} bytes)`);
  console.log(`[SUCCESS] Generated ${OUTPUT_JSON} (${Object.keys(atlasJson.tiles).length} tiles packed)`);
}

buildAtlas().catch((err) => {
  console.error('[ERROR] Failed to build atlas:', err);
  process.exit(1);
});
