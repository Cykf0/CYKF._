import fs from 'fs';
import path from 'path';

const atlas = JSON.parse(fs.readFileSync('src/world/atlasData.json', 'utf8'));
const validTiles = new Set(Object.keys(atlas.tiles));

function scanDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) scanDir(full);
    else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      const content = fs.readFileSync(full, 'utf8');

      // Check textures: '...' or all: '...' or top: '...' etc.
      const textureMatches = content.matchAll(/(?:textures|top|bottom|side|north|south|east|west|all):\s*['"]([a-zA-Z0-9_]+)['"]/g);
      for (const m of textureMatches) {
        if (!validTiles.has(m[1]) && m[1] !== 'water' && m[1] !== 'lava') {
          console.log(`[TEXTURE] ${full}: missing "${m[1]}"`);
        }
      }

      // Check VoxelBlock type="..."
      const blockMatches = content.matchAll(/<VoxelBlock[^>]*type=["']([a-zA-Z0-9_]+)["']/g);
      for (const m of blockMatches) {
        if (!validTiles.has(m[1])) {
          console.log(`[VOXELBLOCK] ${full}: missing "${m[1]}"`);
        }
      }
    }
  }
}
scanDir('src');
console.log('Check finished.');
