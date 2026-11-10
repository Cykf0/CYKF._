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
      const matches = content.matchAll(/textures:\s*['"]([a-zA-Z0-9_]+)['"]/g);
      for (const m of matches) {
        if (!validTiles.has(m[1])) {
          console.log(full + ': invalid texture "' + m[1] + '"');
        }
      }
      const blockMatches = content.matchAll(/type=["']([a-zA-Z0-9_]+)["']/g);
      for (const m of blockMatches) {
        const name = m[1];
        if (!validTiles.has(name) && !['water', 'lava', 'oak_fence', 'none', 'emerald', 'diamond-pickaxe', 'soul-torch', 'soul-lantern', 'book', 'ender-pearl', 'gold_sword', 'idle', 'walking', 'holding', 'waving', 'look-back', 'villager', 'iron_golem', 'allay', 'wolf', 'cat', 'bee', 'enderman', 'button', 'text', 'submit', 'reset', 'menu', 'default'].includes(name)) {
          console.log(full + ': unknown block/item type "' + name + '"');
        }
      }
    }
  }
}
scanDir('src');
console.log('Scan complete.');
