import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9225;
const OUT_DIR = path.resolve('public/screenshots/contact_sheet');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runCapture() {
  console.log('[ContactSheet] Launching Chrome on port', PORT);
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

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    function send(method, params = {}) {
      return new Promise((res, rej) => {
        const id = msgId++;
        callbacks.set(id, { res, rej });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    async function captureScreen(url, filename, action) {
      console.log(`[ContactSheet] Navigating to ${url}...`);
      await send('Page.navigate', { url });
      await sleep(2500);

      if (action) {
        await action(send);
        await sleep(600);
      }

      console.log(`[ContactSheet] Capturing ${filename}...`);
      const snap = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      if (snap && snap.data) {
        const outPath = path.join(OUT_DIR, filename);
        fs.writeFileSync(outPath, Buffer.from(snap.data, 'base64'));
        console.log(`[ContactSheet] Saved ${outPath}`);
      }
    }

    // 1. Hotbar & HUD
    await captureScreen('http://127.0.0.1:3000/?skipLoading=true#village', 'hotbar_slots.png');

    // 2. Chest Grid (Scene 4)
    await captureScreen('http://127.0.0.1:3000/?skipLoading=true#chest', 'chest_vault_grid.png');

    // 3. Crafting Journey (Scene 5)
    await captureScreen('http://127.0.0.1:3000/?skipLoading=true#crafting', 'crafting_recipes.png');

    // 4. Advancements (Scene 6)
    await captureScreen('http://127.0.0.1:3000/?skipLoading=true#advancements', 'advancements_panel.png');

    // 5. Villager Trades (Scene 7)
    await captureScreen('http://127.0.0.1:3000/?skipLoading=true#trades', 'villager_trades.png');

    // 6. Inventory Modal (Press 'E')
    await captureScreen('http://127.0.0.1:3000/?skipLoading=true#village', 'inventory_modal.png', async (send) => {
      await send('Runtime.evaluate', {
        expression: `
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', code: 'KeyE', bubbles: true }));
        `
      });
    });

    ws.close();
    chrome.kill();
    console.log('[ContactSheet] All screenshots captured successfully in', OUT_DIR);
  } catch (err) {
    console.error('[ContactSheet] Error during capture:', err);
    chrome.kill();
  }
}

runCapture();
