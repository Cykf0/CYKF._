import fs from 'fs';
import path from 'path';

const atlasData = JSON.parse(fs.readFileSync('public/atlas.json', 'utf8'));
const atlasKeys = new Set(Object.keys(atlasData.tiles));

console.log(`Total tiles in atlas: ${atlasKeys.size}`);

function checkDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      checkDir(full);
    } else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) {
      const code = fs.readFileSync(full, 'utf8');
      
      // match patterns like textures: 'name' or textures: "name" or top: 'name', etc.
      const matches = code.matchAll(/(?:textures|top|bottom|north|south|east|west|side|leafType|logType|textures)\s*:\s*['"]([a-zA-Z0-9_]+)['"]/g);
      for (const m of matches) {
        const tex = m[1];
        // filter out keywords or css
        if (tex === 'stone' || tex === 'wood' || tex === 'grass' || tex === 'sand' || tex === 'gravel' || tex === 'snow') continue;
        if (!atlasKeys.has(tex)) {
          console.warn(`[MISSING TILE] File: ${f.name} -> "${tex}" not in atlas.json!`);
        }
      }
    }
  }
}

checkDir('src');
console.log('Texture check complete!');
