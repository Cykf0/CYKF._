import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERNAME = 'Cykf_';
const PUBLIC_DIR = path.resolve(__dirname, '../public/skins');
const TARGET_PATH = path.join(PUBLIC_DIR, 'cykf.png');
const META_PATH = path.join(PUBLIC_DIR, 'cykf-meta.json');

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

async function tryFetchSkin() {
  console.log(`[Skin] Attempting to fetch Minecraft skin for '${USERNAME}'...`);

  // Source 1: Crafatar
  try {
    console.log(`[Skin] Trying Crafatar (https://crafatar.com/skins/${USERNAME})...`);
    const res = await fetch(`https://crafatar.com/skins/${USERNAME}`, {
      headers: { 'User-Agent': 'CykfPortfolio/1.0' }
    });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 200) {
        fs.writeFileSync(TARGET_PATH, buffer);
        fs.writeFileSync(META_PATH, JSON.stringify({ username: USERNAME, source: 'crafatar', model: 'auto', downloadedAt: new Date().toISOString() }, null, 2));
        console.log(`[Skin] Successfully downloaded skin from Crafatar to ${TARGET_PATH} (${buffer.length} bytes)`);
        return true;
      }
    }
  } catch (err) {
    console.warn(`[Skin] Crafatar fetch failed:`, err.message);
  }

  // Source 2: MC-Heads
  try {
    console.log(`[Skin] Trying MC-Heads (https://mc-heads.net/skin/${USERNAME})...`);
    const res = await fetch(`https://mc-heads.net/skin/${USERNAME}`, {
      headers: { 'User-Agent': 'CykfPortfolio/1.0' }
    });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 200) {
        fs.writeFileSync(TARGET_PATH, buffer);
        fs.writeFileSync(META_PATH, JSON.stringify({ username: USERNAME, source: 'mc-heads', model: 'auto', downloadedAt: new Date().toISOString() }, null, 2));
        console.log(`[Skin] Successfully downloaded skin from MC-Heads to ${TARGET_PATH} (${buffer.length} bytes)`);
        return true;
      }
    }
  } catch (err) {
    console.warn(`[Skin] MC-Heads fetch failed:`, err.message);
  }

  // Source 3: Mojang Session Server
  try {
    console.log(`[Skin] Trying Mojang API...`);
    const profileRes = await fetch(`https://api.mojang.com/users/profiles/minecraft/${USERNAME}`);
    if (profileRes.ok) {
      const profile = await profileRes.json();
      if (profile && profile.id) {
        const sessionRes = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${profile.id}`);
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          const texturesProp = session.properties?.find(p => p.name === 'textures');
          if (texturesProp) {
            const decoded = JSON.parse(Buffer.from(texturesProp.value, 'base64').toString('utf8'));
            const skinUrl = decoded.textures?.SKIN?.url;
            const model = decoded.textures?.SKIN?.metadata?.model || 'classic';
            if (skinUrl) {
              const skinRes = await fetch(skinUrl);
              if (skinRes.ok) {
                const buffer = Buffer.from(await skinRes.arrayBuffer());
                fs.writeFileSync(TARGET_PATH, buffer);
                fs.writeFileSync(META_PATH, JSON.stringify({ username: USERNAME, uuid: profile.id, source: 'mojang', model, downloadedAt: new Date().toISOString() }, null, 2));
                console.log(`[Skin] Successfully downloaded skin from Mojang (${model}) to ${TARGET_PATH}`);
                return true;
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[Skin] Mojang API fetch failed:`, err.message);
  }

  // Fallback: Check if file already exists or create minimal placeholder
  if (fs.existsSync(TARGET_PATH) && fs.statSync(TARGET_PATH).size > 200) {
    console.log(`[Skin] Using existing skin file at ${TARGET_PATH}`);
    return true;
  }

  console.warn(`[Skin] WARNING: All external skin sources failed or network unreachable.`);
  console.warn(`[Skin] Generating a fallback Steve/Alex placeholder skin.`);
  console.warn(`[Skin] Please drop your custom skin at 'public/skins/cykf.png'.`);

  // Generate a valid 64x64 base64 PNG fallback (standard Steve skin atlas format)
  // Simple 64x64 PNG buffer
  const fallbackPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nO3BMQEAAADCoPVPbQhfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+A3v0AAHhO/78AAAAAElFTkSuQmCC";
  fs.writeFileSync(TARGET_PATH, Buffer.from(fallbackPngBase64, 'base64'));
  fs.writeFileSync(META_PATH, JSON.stringify({ username: USERNAME, source: 'placeholder', model: 'classic', downloadedAt: new Date().toISOString() }, null, 2));
  return false;
}

tryFetchSkin();
