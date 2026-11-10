import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9224;
const OUT_DIR = path.resolve('public/screenshots/audit');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAuditCapture() {
  console.log('[AuditCapture] Launching Chrome on port', PORT);
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--window-size=1280,720',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--disable-gpu-sandbox',
    '--no-sandbox'
  ]);

  await sleep(1500);

  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
    const target = await res.json();
    const wsUrl = target.webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        const { res, rej } = callbacks.get(data.id);
        callbacks.delete(data.id);
        if (data.error) rej(data.error);
        else res(data.result);
      }
    };

    await new Promise(resolve => { ws.onopen = resolve; });

    function send(method, params = {}) {
      return new Promise((res, rej) => {
        const id = msgId++;
        callbacks.set(id, { res, rej });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    async function captureTarget(url, filename, setupFn) {
      console.log(`[AuditCapture] Navigating to ${url}...`);
      await send('Page.navigate', { url });
      await sleep(2500);

      if (setupFn) {
        await setupFn(send);
        await sleep(500);
      }

      console.log(`[AuditCapture] Capturing ${filename}...`);
      const snap = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      if (snap && snap.data) {
        const outPath = path.join(OUT_DIR, filename);
        fs.writeFileSync(outPath, Buffer.from(snap.data, 'base64'));
        console.log(`[AuditCapture] Saved ${outPath}`);
      }
    }

    // 1. Scene 1 Overview (Grass, Dirt, Path, Sheep, Villager, Hotbar)
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#village', 'audit_scene01_village.png');

    // 2. Scene 2 (Cherry Tree, Leaves, Planks)
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#profile', 'audit_scene02_tree_leaves.png');

    // 3. Scene 4 (Chest, Stone, Mineshaft Planks, Ores)
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#chest', 'audit_scene04_chest_stone.png');

    // 4. Scene 7 (Villager Close-up)
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#trades', 'audit_scene07_villager.png');

    // 5. Scene 8 (Water, Lush Cave)
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#connect', 'audit_scene08_water_cave.png');

    ws.close();
    chrome.kill();
    console.log('[AuditCapture] Audit captures completed successfully in', OUT_DIR);
  } catch (err) {
    console.error('[AuditCapture] Error during audit capture:', err);
    chrome.kill();
  }
}

runAuditCapture();
