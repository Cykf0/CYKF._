import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9225;
const OUT_DIR = path.resolve('public/screenshots/compare');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runCompareCapture() {
  console.log('[CompareCapture] Launching Chrome on port', PORT);
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

    async function captureTarget(url, filename) {
      console.log(`[CompareCapture] Navigating to ${url}...`);
      await send('Page.navigate', { url });
      await sleep(2500);

      console.log(`[CompareCapture] Capturing ${filename}...`);
      const snap = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      if (snap && snap.data) {
        const outPath = path.join(OUT_DIR, filename);
        fs.writeFileSync(outPath, Buffer.from(snap.data, 'base64'));
        console.log(`[CompareCapture] Saved ${outPath}`);
      }
    }

    // Capture each scene close-up
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#village', 'scene01_grass_path.png');
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#profile', 'scene02_cherry_tree.png');
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#enchantments', 'scene03_enchanting_table.png');
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#chest', 'scene04_chest_ores.png');
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#crafting', 'scene05_stepped_mountains.png');
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#advancements', 'scene06_sculk_pillars.png');
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#trades', 'scene07_villager_trades.png');
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#connect', 'scene08_water_pool.png');
    await captureTarget('http://127.0.0.1:3000/?skipLoading=true#end', 'scene09_end_portal.png');

    ws.close();
    chrome.kill();
    console.log('[CompareCapture] All verification screenshots captured successfully!');
  } catch (err) {
    console.error('[CompareCapture] Error:', err);
    chrome.kill();
  }
}

runCompareCapture();
